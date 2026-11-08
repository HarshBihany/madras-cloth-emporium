import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getAllActiveSlugs, getCategories } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/shop", "/heritage", "/wedding", "/bulk-orders", "/tailoring", "/contact", "/policies"].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  try {
    const [cats, slugs] = await Promise.all([getCategories(), getAllActiveSlugs()]);
    return [
      ...staticPages,
      ...cats.map((c) => ({ url: `${siteUrl}/collections/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
      // Demo listings are excluded (and marked noindex) so they never appear in search.
      ...slugs.filter((s) => !s.isDemo).map((s) => ({ url: `${siteUrl}/product/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ];
  } catch {
    return staticPages;
  }
}
