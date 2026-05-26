import type { MetadataRoute } from "next";
import {
  APP_DESCRIPTION,
  APP_NAME,
  BRAND_BACKGROUND_COLOR,
  BRAND_THEME_COLOR,
} from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_BACKGROUND_COLOR,
    theme_color: BRAND_THEME_COLOR,
    categories: ["shopping", "utilities", "lifestyle"],
    lang: "ru",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
	src: "/icons/icon.svg",
	sizes: "any",
	type: "image/svg+xml",
	purpose: "maskable",
      }, 	
    ],
  };
}
