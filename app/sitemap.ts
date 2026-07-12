import type { MetadataRoute } from "next";
import { discoveryPaths } from "@/data/discoveryRoutes";
import { getAllPostIdsForAllLocales } from "@/lib/posts";

const BASE = "https://kumma.me";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = discoveryPaths.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
  }));
  const postRoutes = getAllPostIdsForAllLocales().map(({ params }) => ({
    url: `${BASE}/blog/${params.locale}/${params.slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...postRoutes];
}
