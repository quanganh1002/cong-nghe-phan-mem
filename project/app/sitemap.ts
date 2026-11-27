import type { MetadataRoute } from "next"
import { listDishes } from "@/lib/dishes-db"
import { SITE_URL } from "@/lib/agent-markdown"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/dishes", "/map", "/glossary", "/about", ...(await listDishes()).map((d) => `/dishes/${d.id}`)]
  return pages.map((p) => ({ url: `${SITE_URL}${p}` }))
}
