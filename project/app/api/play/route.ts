import { getDish } from "@/lib/dishes"
import { LANGUAGES } from "@/lib/languages"
import { recordComplete, recordPlay } from "@/lib/visits-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST /api/play { dish, lang, short?, done? } — công khai: khách vừa bấm nghe thuyết minh một món (đếm 1 lượt nghe;
 * short = nghe bản tóm tắt) hoặc nghe đến hết câu cuối (done = true, đếm 1 lượt nghe hết).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { dish?: unknown; lang?: unknown; short?: unknown; done?: unknown } | null
  const dish = typeof body?.dish === "string" ? body.dish : ""
  if (!getDish(dish)) return Response.json({ error: "bad_dish" }, { status: 400 })
  const lang = LANGUAGES.find((l) => l.code === body?.lang)?.code ?? ""
  try {
    if (body?.done === true) await recordComplete(dish, lang)
    else await recordPlay(dish, lang, body?.short === true)
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
