import type { NextRequest } from "next/server"
import { listOrders } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Khách xem trạng thái đơn của mình: GET /api/orders/status?ids=947421,947533
 * Chỉ trả về trạng thái (không có tên, SĐT, địa chỉ) nên không cần PIN.
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((id) => /^\d{1,12}$/.test(id))
    .slice(0, 50)

  const result: Record<string, string> = {}
  if (ids.length > 0) {
    const wanted = new Set(ids)
    for (const o of await listOrders()) {
      if (wanted.has(o.id)) result[o.id] = o.status
    }
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } })
}
