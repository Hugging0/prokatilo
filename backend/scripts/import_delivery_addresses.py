from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import psycopg
from sqlalchemy.engine import make_url


BASE_LAT = 55.6692987
BASE_LON = 37.4376738
DEFAULT_RADIUS_M = 10_000
DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def normalize_delivery_text(value: str) -> str:
    normalized = value.lower().replace("ё", "е")
    normalized = re.sub(r"[.,;:()\"'«»]", " ", normalized)
    normalized = normalized.replace("-", " ")
    normalized = re.sub(r"\b(москва|мск|россия|г|город)\b", " ", normalized)
    normalized = re.sub(
        r"\b(улица|ул|шоссе|ш|проспект|пр т|пр кт|пр|переулок|пер|"
        r"бульвар|бул|б р|набережная|наб|проезд|пр д|площадь|пл|дом|д)\b",
        " ",
        normalized,
    )
    normalized = re.sub(r"\b(\d+)\s*(?:ая|я|ый|ой|ий)\b", r"\1", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def normalize_delivery_house(value: str | None) -> str | None:
    if not value:
        return None

    normalized = value.lower().replace("ё", "е")
    normalized = re.sub(r"\s+", "", normalized)
    normalized = normalized.replace("корпус", "к").replace("строение", "с")
    normalized = normalized.replace("к.", "к").replace("с.", "с")
    return normalized or None


def calculate_distance_m(
    first_lat: float,
    first_lon: float,
    second_lat: float,
    second_lon: float,
) -> int:
    earth_radius_m = 6_371_000
    first_phi = math.radians(first_lat)
    second_phi = math.radians(second_lat)
    delta_phi = math.radians(second_lat - first_lat)
    delta_lambda = math.radians(second_lon - first_lon)
    haversine = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(first_phi)
        * math.cos(second_phi)
        * math.sin(delta_lambda / 2) ** 2
    )
    return round(
        earth_radius_m
        * 2
        * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine)),
    )


def build_overpass_query(radius_m: int) -> str:
    return f"""
    [out:json][timeout:180];
    (
      node(around:{radius_m},{BASE_LAT},{BASE_LON})["addr:housenumber"]["addr:street"];
      way(around:{radius_m},{BASE_LAT},{BASE_LON})["addr:housenumber"]["addr:street"];
      relation(around:{radius_m},{BASE_LAT},{BASE_LON})["addr:housenumber"]["addr:street"];
    );
    out center tags;
    """


def load_osm_payload(args: argparse.Namespace) -> dict[str, Any]:
    if args.source_file:
        return json.loads(Path(args.source_file).read_text(encoding="utf-8"))

    query = build_overpass_query(args.radius_m)
    payload = urllib.parse.urlencode({"data": query}).encode()
    request = urllib.request.Request(
        args.overpass_url,
        data=payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "prokatilo-delivery-address-import/1.0",
        },
    )

    with urllib.request.urlopen(request, timeout=args.timeout_s) as response:
        data = json.loads(response.read().decode("utf-8"))

    if args.cache_file:
        Path(args.cache_file).write_text(
            json.dumps(data, ensure_ascii=False),
            encoding="utf-8",
        )

    return data


def get_element_coordinates(element: dict[str, Any]) -> tuple[float, float] | None:
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])

    center = element.get("center")
    if center and "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])

    return None


def build_display_name(street: str, house: str) -> str:
    return f"{street}, {house}"


def iter_address_rows(payload: dict[str, Any]) -> list[tuple[Any, ...]]:
    rows: list[tuple[Any, ...]] = []
    seen: set[tuple[str, str, str, str | None]] = set()

    for element in payload.get("elements", []):
        tags = element.get("tags") or {}
        street = tags.get("addr:street")
        house = tags.get("addr:housenumber")
        coordinates = get_element_coordinates(element)

        if not street or not house or not coordinates:
            continue

        lat, lon = coordinates
        distance_m = calculate_distance_m(BASE_LAT, BASE_LON, lat, lon)
        normalized_street = normalize_delivery_text(street)
        normalized_house = normalize_delivery_house(house)

        if not normalized_street or not normalized_house:
            continue

        osm_type = str(element.get("type", "unknown"))
        osm_id = str(element.get("id", "unknown"))
        unique_key = (osm_type, osm_id, normalized_street, normalized_house)

        if unique_key in seen:
            continue

        seen.add(unique_key)
        rows.append(
            (
                osm_type,
                osm_id,
                build_display_name(street, house),
                street,
                house,
                normalized_street,
                normalized_house,
                lat,
                lon,
                distance_m,
                "osm",
            ),
        )

    return rows


def build_connection_kwargs(database_url: str) -> dict[str, Any]:
    url = make_url(database_url)

    return {
        "dbname": url.database,
        "user": url.username,
        "password": url.password,
        "host": url.host,
        "port": url.port or 5432,
    }


def import_rows(rows: list[tuple[Any, ...]], database_url: str, refresh: bool) -> None:
    query = """
        INSERT INTO delivery_addresses (
            osm_type,
            osm_id,
            display_name,
            street,
            house_number,
            normalized_street,
            normalized_house,
            lat,
            lon,
            distance_m,
            source
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (osm_type, osm_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            street = EXCLUDED.street,
            house_number = EXCLUDED.house_number,
            normalized_street = EXCLUDED.normalized_street,
            normalized_house = EXCLUDED.normalized_house,
            lat = EXCLUDED.lat,
            lon = EXCLUDED.lon,
            distance_m = EXCLUDED.distance_m,
            source = EXCLUDED.source,
            updated_at = now()
    """

    with psycopg.connect(**build_connection_kwargs(database_url)) as conn:
        with conn.cursor() as cursor:
            if refresh:
                cursor.execute("TRUNCATE delivery_addresses")

            cursor.executemany(query, rows)
        conn.commit()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import OSM addresses around Malaya Ochakovskaya into PostgreSQL.",
    )
    parser.add_argument("--radius-m", type=int, default=DEFAULT_RADIUS_M)
    parser.add_argument("--overpass-url", default=DEFAULT_OVERPASS_URL)
    parser.add_argument("--source-file")
    parser.add_argument("--cache-file")
    parser.add_argument("--timeout-s", type=int, default=240)
    parser.add_argument("--refresh", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        print("DATABASE_URL is required", file=sys.stderr)
        return 1

    payload = load_osm_payload(args)
    rows = iter_address_rows(payload)

    if not rows:
        print("No address rows found", file=sys.stderr)
        return 1

    import_rows(rows, database_url=database_url, refresh=args.refresh)
    print(f"Imported {len(rows)} delivery addresses within {args.radius_m} m")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
