import type { NextRequest } from "next/server"
import { ADMIN_PIN, STATUSES, updateStatus, type ShopOrderStatus } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Trang bếp đổi trạng thái đơn — cần mã PIN.
 * Body: { status: "confirmed" | ... | "cancelled", reason?: "Hết món" }  (reason chỉ dùng khi từ chối)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-pin") !== ADMIN_PIN) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { status?: string; reason?: unknown }
  if (!STATUSES.includes(body.status as ShopOrderStatus)) {
    return Response.json({ error: "bad status" }, { status: 400 })
  }
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 200) : ""

  const result = await updateStatus(id, body.status as ShopOrderStatus, reason)
  if ("error" in result) {
    // locked = đơn đã hoàn thành hoặc đã bị từ chối trước đó
    return Response.json({ error: result.error }, { status: result.error === "not_found" ? 404 : 409 })
  }
  return Response.json(result.order)
}
