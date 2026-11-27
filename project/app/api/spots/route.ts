import type { NextRequest } from "next/server"
import { isAdminPin } from "@/lib/admin-auth"
import { listDishes } from "@/lib/dishes-db"
import { createSpot, deleteSpot, listSpots, parseSpot, updateSpot } from "@/lib/spots-db"

const dishIds = async () => new Set((await listDishes()).map((d) => d.id))

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
const denied = (req: NextRequest) => !isAdminPin(req.headers.get("x-admin-pin"))

async function run(fn: () => Promise<Response>) {
  try {
    return await fn()
  } catch (e) {
    console.error(e)
    return json({ error: "Lỗi máy chủ" }, 500)
  }
}

/** GET /api/spots — công khai: các điểm đang hiển thị; gửi kèm PIN admin thì có cả điểm đang ẩn */
export function GET(req: NextRequest) {
  return run(async () => json(await listSpots(!denied(req))))
}

/** POST /api/spots — admin: thêm điểm {name, at: [lat, lng], radius, hidden, dishes} */
export function POST(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  return run(async () => {
    const s = parseSpot(await req.json().catch(() => null), await dishIds())
    return typeof s === "string" ? json({ error: s }, 400) : json(await createSpot(s), 201)
  })
}

/** PUT /api/spots?id=... — admin: sửa điểm */
export function PUT(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  const id = req.nextUrl.searchParams.get("id") ?? ""
  return run(async () => {
    const s = parseSpot(await req.json().catch(() => null), await dishIds())
    if (typeof s === "string") return json({ error: s }, 400)
    return (await updateSpot(id, s)) ? json({ id, ...s }) : json({ error: "Không tìm thấy điểm" }, 404)
  })
}

/** DELETE /api/spots?id=... — admin: xóa điểm */
export function DELETE(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  const id = req.nextUrl.searchParams.get("id") ?? ""
  return run(async () => ((await deleteSpot(id)) ? json({ ok: true }) : json({ error: "Không tìm thấy điểm" }, 404)))
}
