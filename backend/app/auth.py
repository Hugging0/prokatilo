import hashlib
import hmac
import secrets
import base64
from dataclasses import dataclass

PASSWORD_ALGORITHM = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 210_000


@dataclass(frozen=True)
class TokenPayload:
    user_id: int
    token_secret: str


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PASSWORD_ITERATIONS,
    ).hex()
    return f"{PASSWORD_ALGORITHM}${PASSWORD_ITERATIONS}${salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected_hash = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != PASSWORD_ALGORITHM:
        return False

    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    ).hex()
    return hmac.compare_digest(actual_hash, expected_hash)


def create_access_token(user_id: int, secret: str) -> str:
    nonce = secrets.token_urlsafe(18)
    payload = f"{user_id}:{nonce}"
    payload_token = base64.urlsafe_b64encode(
        payload.encode("utf-8"),
    ).decode("utf-8").rstrip("=")
    signature = hmac.new(
        secret.encode("utf-8"),
        payload_token.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{payload_token}.{signature}"


def parse_access_token(token: str, secret: str) -> TokenPayload | None:
    try:
        payload_token, signature = token.split(".", 1)
        expected_signature = hmac.new(
            secret.encode("utf-8"),
            payload_token.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            return None

        padded_payload = payload_token + "=" * (-len(payload_token) % 4)
        payload = base64.urlsafe_b64decode(padded_payload).decode("utf-8")
        user_id_raw, token_secret = payload.split(":", 1)
        user_id = int(user_id_raw)
    except (ValueError, UnicodeDecodeError):
        return None

    if not token_secret:
        return None

    return TokenPayload(user_id=user_id, token_secret=token_secret)
