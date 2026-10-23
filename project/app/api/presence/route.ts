import type { NextRequest } from "next/server"
import { isAdminPin } from "@/lib/admin-auth"
import { getDish } from "@/lib/dishes"
import { listOnline, removeDevice, touchDevice, type Source } from "@/lib/presence-db"
import { recordDishView, recordVisit } from "@/lib/visits-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST /api/presence  { id, leave?, path?, src?, start?, hit? } — công khai: thiết bị báo "tôi đang ở đây" (hoặc "tôi đã rời").
 *   start = tab mới vào web (đếm 1 lượt truy cập), hit = vừa mở một trang (đếm lượt xem món ăn).
 * GET  /api/presence — chỉ admin (x-admin-pin): { online, devices } = thiết bị đang online ngay lúc này.
 */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) return Response.json({ error: "bad_id" }, { status: 400 })

  try {
    if (body?.leave) {
      await removeDevice(id)
    } else {
      const path = clip(body?.path, 200)
      const source: Source = body?.src === "qr" ? "qr" : "link"
      const counted = await touchDevice(id, path, source, body?.hit === true)
      if (body?.start === true) await recordVisit(source)
      const dishId = /^\/dishes\/([a-z0-9-]+)$/.exec(path)?.[1]
      if (counted && dishId && getDish(dishId)) await recordDishView(dishId)
    }
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}

export async function GET(req: NextRequest) {
  if (!isAdminPin(req.headers.get("x-admin-pin"))) return Response.json({ error: "unauthorized" }, { status: 401 })
  try {
    const devices = await listOnline()
    return Response.json({ online: devices.length, devices }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
}
