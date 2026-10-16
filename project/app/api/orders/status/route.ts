import type { NextRequest } from "next/server"
import { getStatuses } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Khách xem trạng thái đơn của mình: GET /api/orders/status?ids=947421,947533
 * Trả về { "947421": { status: "preparing" }, "947533": { status: "cancelled", reason: "Hết món" } }
 * Chỉ có trạng thái + lý do từ chối (không có tên, SĐT, địa chỉ) nên không cần PIN.
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((id) => /^\d{1,12}$/.test(id))
    .slice(0, 50)

  const result = ids.length > 0 ? await getStatuses(ids) : {}
  return Response.json(result, { headers: { "Cache-Control": "no-store" } })
}
