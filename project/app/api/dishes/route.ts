import type { NextRequest } from "next/server"
import { isAdminPin } from "@/lib/admin-auth"
import { createDish, deleteDish, listDishes, parseDish, updateDish } from "@/lib/dishes-db"

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

/** GET /api/dishes — công khai: danh sách món */
export function GET() {
  return run(async () => json(await listDishes()))
}

/** POST /api/dishes — admin: thêm món (id tạo từ tên tiếng Việt) */
export function POST(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  return run(async () => {
    const d = parseDish(await req.json().catch(() => null))
    return typeof d === "string" ? json({ error: d }, 400) : json(await createDish(d), 201)
  })
}

/** PUT /api/dishes?id=... — admin: sửa món (id giữ nguyên để không đứt link, mã QR và số liệu thống kê) */
export function PUT(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  const id = req.nextUrl.searchParams.get("id") ?? ""
  return run(async () => {
    const d = parseDish(await req.json().catch(() => null))
    if (typeof d === "string") return json({ error: d }, 400)
    return (await updateDish(id, d)) ? json({ id, ...d }) : json({ error: "Không tìm thấy món" }, 404)
  })
}

/** DELETE /api/dishes?id=... — admin: xóa món */
export function DELETE(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  const id = req.nextUrl.searchParams.get("id") ?? ""
  return run(async () => {
    const r = await deleteDish(id)
    if (r === "missing") return json({ error: "Không tìm thấy món" }, 404)
    if (r === "last") return json({ error: "Không thể xóa món cuối cùng" }, 409)
    return json({ ok: true })
  })
}
