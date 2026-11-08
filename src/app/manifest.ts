import type { MetadataRoute } from "next";
import { business } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.name,
    short_name: business.shortName,
    description: business.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#4a0f1c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
