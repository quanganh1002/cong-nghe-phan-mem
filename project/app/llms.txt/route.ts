import { indexMarkdown } from "@/lib/agent-markdown"
import { listDishes } from "@/lib/dishes-db"

export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(indexMarkdown(await listDishes()), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
