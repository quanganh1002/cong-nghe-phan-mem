import type { NextRequest } from "next/server"
import { isAdminPin } from "@/lib/admin-auth"
import { readVisits, vnDay } from "@/lib/visits-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** GET /api/stats — chỉ admin: thống kê lượt truy cập 30 ngày gần nhất + lượt xem / lượt nghe từng món và từng ngôn ngữ */
export async function GET(req: NextRequest) {
  if (!isAdminPin(req.headers.get("x-admin-pin"))) return Response.json({ error: "unauthorized" }, { status: 401 })

  let visits
  try {
    visits = await readVisits()
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  const { days, dishes, dishPlays, langs } = visits
  const out = []
  for (let i = 29; i >= 0; i--) {
    const date = vnDay(Date.now() - i * 86_400_000)
    out.push({ date, ...(days[date] ?? { visits: 0, qr: 0, link: 0, views: 0, plays: 0 }) })
  }
  const all = Object.values(days).reduce(
    (t, d) => ({
      visits: t.visits + d.visits,
      qr: t.qr + d.qr,
      link: t.link + d.link,
      views: t.views + d.views,
      plays: t.plays + d.plays,
    }),
    { visits: 0, qr: 0, link: 0, views: 0, plays: 0 },
  )
  return Response.json({ days: out, total: all, dishes, dishPlays, langs }, { headers: { "Cache-Control": "no-store" } })
}
