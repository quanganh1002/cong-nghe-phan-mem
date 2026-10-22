import type { NextRequest } from "next/server"
import { shopForPin } from "@/lib/orders-db"
import { getShopInfo, saveShopInfo } from "@/lib/shop-info-db"
import { SHOP_AVATARS, TIME_RE, getShop, type ShopInfo } from "@/lib/shops"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

const image = (v: unknown, max: number) => (typeof v === "string" && v.length <= max && IMAGE_RE.test(v) ? v : undefined)

/** Preset emoji or a small uploaded image (data URL, resized by the client) */
const avatar = (v: unknown) => (typeof v === "string" && SHOP_AVATARS.includes(v) ? v : image(v, 150_000))

const time = (v: unknown) => (typeof v === "string" && TIME_RE.test(v) ? v : "")

/** Thông tin quán — ai cũng xem được (trang quán phía khách). Chưa nhập thì trả null */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = getShop((await params).id)
  if (!shop) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(await getShopInfo(shop.id))
}

/** Admin quán lưu thông tin — cần mã PIN của đúng quán đó */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = getShop((await params).id)
  if (!shop) return Response.json({ error: "not found" }, { status: 404 })
  if (shopForPin(req.headers.get("x-admin-pin")) !== shop.id) return Response.json({ error: "unauthorized" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const info: ShopInfo = {
    name: str(body.name, 200) || shop.name,
    address: str(body.address, 200),
    province: str(body.province, 100),
    ward: str(body.ward, 100),
    phone: str(body.phone, 20),
    email: str(body.email, 200),
    avatar: avatar(body.avatar),
    cover: image(body.cover, 400_000),
    description: str(body.description, 500),
    openTime: time(body.openTime),
    closeTime: time(body.closeTime),
    days: Array.isArray(body.days) ? [...new Set(body.days.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort() : [],
    status: body.status === "closed" || body.status === "paused" ? body.status : "open",
  }
  await saveShopInfo(shop.id, info)
  return Response.json(info)
}
