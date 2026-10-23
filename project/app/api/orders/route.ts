import type { NextRequest } from "next/server"
import { listAllFoods } from "@/lib/foods-db"
import { getShopInfo } from "@/lib/shop-info-db"
import { shopState } from "@/lib/shops"
import { addOrder, listOrders, shopForPin, shopOfOrder, type ShopOrderItem } from "@/lib/orders-db"

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
  // Mỗi đơn chỉ được có món của 1 quán (trang thanh toán đã tách đơn theo quán)
  const foods = await listAllFoods()
  const foodOf = (id: string) => foods.find((f) => f.id === id)
  // Món đã bị quán ẩn (ngừng bán) thì không nhận; giá luôn lấy theo menu hiện tại ở server, không tin giá trình duyệt gửi
  if (items.some((i) => foodOf(i.foodId)?.hidden)) return Response.json({ error: "food unavailable" }, { status: 409 })
  for (const i of items) i.unitPrice = foodOf(i.foodId)?.price ?? i.unitPrice
  if (new Set(items.map((i) => foodOf(i.foodId)?.shop)).size > 1) return Response.json({ error: "mixed shops" }, { status: 400 })

  // Quán đang tạm đóng / tạm ngừng nhận đơn / ngoài giờ hoạt động thì không nhận đơn
  const shopId = foodOf(items[0].foodId)?.shop
  if (shopId) {
    const state = shopState(await getShopInfo(shopId))
    if (state !== "open") return Response.json({ error: "shop not accepting", state }, { status: 409 })
  }

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

/** Trang bếp lấy danh sách đơn của quán có mã PIN đó */
export async function GET(req: NextRequest) {
  const shop = shopForPin(req.headers.get("x-admin-pin"))
  if (!shop) return Response.json({ error: "unauthorized" }, { status: 401 })
  const foods = await listAllFoods()
  const orders = (await listOrders()).filter((o) => shopOfOrder(o, foods) === shop)
  // ?all=1 → trả hết (trang thống kê); mặc định 300 đơn gần nhất (trang bếp). Mới nhất lên đầu.
  const all = req.nextUrl.searchParams.get("all") === "1"
  return Response.json((all ? orders : orders.slice(-300)).reverse(), { headers: { "x-shop": shop } })
}
