import { getDish } from "@/lib/dishes"
import { LANGUAGES } from "@/lib/languages"
import { recordPlay } from "@/lib/visits-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** POST /api/play { dish, lang } — công khai: khách vừa bấm nghe thuyết minh một món (đếm 1 lượt nghe). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { dish?: unknown; lang?: unknown } | null
  const dish = typeof body?.dish === "string" ? body.dish : ""
  if (!getDish(dish)) return Response.json({ error: "bad_dish" }, { status: 400 })
  const lang = LANGUAGES.find((l) => l.code === body?.lang)?.code ?? ""
  try {
    await recordPlay(dish, lang)
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
