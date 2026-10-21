import type { NextRequest } from "next/server"
import { shopForPin } from "@/lib/orders-db"
import { listReviews, replyReview, reviewFromBody, saveShopReview, toPublic } from "@/lib/reviews-db"
import { getShop } from "@/lib/shops"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** Danh sách đánh giá của quán — ai cũng xem được. Header x-user-id (nếu có) để đánh dấu đánh giá của mình (mine) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = getShop((await params).id)
  if (!shop) return Response.json({ error: "not found" }, { status: 404 })
  const viewer = req.headers.get("x-user-id")
  return Response.json((await listReviews(shop.id)).map((r) => toPublic(r, viewer)))
}

/** Khách gửi đánh giá quán (mỗi tài khoản 1 bản, gửi lại thì thay). Body: { userId, name, rating: 1..5, comment } */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = getShop((await params).id)
  if (!shop) return Response.json({ error: "not found" }, { status: 404 })

  const review = reviewFromBody(await req.json().catch(() => ({})), shop.id, "")
  if (!review) return Response.json({ error: "bad review" }, { status: 400 })
  await saveShopReview(review)
  return Response.json(toPublic(review, review.userId))
}

/** Quán trả lời đánh giá — cần mã PIN của đúng quán. Body: { id, reply } (reply rỗng = xóa phản hồi) */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = getShop((await params).id)
  if (!shop) return Response.json({ error: "not found" }, { status: 404 })
  if (shopForPin(req.headers.get("x-admin-pin")) !== shop.id) return Response.json({ error: "unauthorized" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const reply = typeof body.reply === "string" ? body.reply.trim().slice(0, 500) : ""
  if (typeof body.id !== "string" || !body.id) return Response.json({ error: "bad request" }, { status: 400 })
  const review = await replyReview(shop.id, body.id, reply)
  if (!review) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(toPublic(review, null))
}
