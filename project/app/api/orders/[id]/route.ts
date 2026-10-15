import type { NextRequest } from "next/server"
import { ADMIN_PIN, STATUSES, updateStatus, type ShopOrderStatus } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** Trang bếp đổi trạng thái đơn — cần mã PIN */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-pin") !== ADMIN_PIN) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { status?: string }
  if (!STATUSES.includes(body.status as ShopOrderStatus)) {
    return Response.json({ error: "bad status" }, { status: 400 })
  }
  const order = await updateStatus(id, body.status as ShopOrderStatus)
  if (!order) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(order)
}
