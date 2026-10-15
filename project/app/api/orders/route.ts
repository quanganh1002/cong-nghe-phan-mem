import type { NextRequest } from "next/server"
import { ADMIN_PIN, addOrder, listOrders, type ShopOrderItem } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** Khách gửi đơn (trang thanh toán gọi) — ai cũng gọi được */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 })
  }

  const rawItems = Array.isArray(body.items) ? body.items : []
  const items: ShopOrderItem[] = rawItems
    .slice(0, 50)
    .map((i: Record<string, unknown>) => ({
      foodId: str(i?.foodId, 60),
      quantity: Math.floor(Number(i?.quantity)),
      unitPrice: Math.max(0, Math.round(Number(i?.unitPrice) || 0)),
    }))
    .filter((i) => i.foodId && i.quantity >= 1 && i.quantity <= 99)

  if (items.length === 0) return Response.json({ error: "empty order" }, { status: 400 })

  const table = str(body.table, 10)
  const order = await addOrder({
    table: /^[A-Za-z0-9-]{1,10}$/.test(table) ? table : null,
    name: str(body.name, 80),
    phone: str(body.phone, 20),
    address: str(body.address, 200),
    note: str(body.note, 300),
    payment: str(body.payment, 20),
    transferNote: str(body.transferNote, 40),
    items,
    // Tự tính lại tổng ở server, không tin con số từ trình duyệt gửi lên
    total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  })
  return Response.json({ id: order.id })
}

/** Trang bếp lấy danh sách đơn — cần mã PIN */
export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-pin") !== ADMIN_PIN) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const orders = await listOrders()
  // ?all=1 → trả hết (trang thống kê); mặc định 300 đơn gần nhất (trang bếp). Mới nhất lên đầu.
  const all = req.nextUrl.searchParams.get("all") === "1"
  return Response.json((all ? orders : orders.slice(-300)).reverse())
}
