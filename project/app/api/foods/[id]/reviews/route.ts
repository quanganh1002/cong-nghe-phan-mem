import type { NextRequest } from "next/server"
import { getFood } from "@/lib/foods"
import {
  addReview,
  contentFromBody,
  deleteReview,
  listReviews,
  reviewFromBody,
  toPublic,
  updateReview,
} from "@/lib/reviews-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

const body = (req: NextRequest) => req.json().catch(() => ({})) as Promise<Record<string, unknown>>
const userIdOf = (b: Record<string, unknown>) => (typeof b.userId === "string" ? b.userId.trim().slice(0, 60) : "")

const ERROR_STATUS = { not_found: 404, forbidden: 403 } as const

/** Danh sách đánh giá của món — ai cũng xem được. Header x-user-id (nếu có) để đánh dấu đánh giá của mình (mine) */
export async function GET(req: NextRequest, { params }: Ctx) {
  const food = getFood((await params).id)
  if (!food) return Response.json({ error: "not found" }, { status: 404 })
  const viewer = req.headers.get("x-user-id")
  return Response.json((await listReviews(food.shop, food.id)).map((r) => toPublic(r, viewer)))
}

/** Khách viết đánh giá món mới (viết nhiều lần được). Body: { userId, name, rating: 1..5, comment } */
export async function POST(req: NextRequest, { params }: Ctx) {
  const food = getFood((await params).id)
  if (!food) return Response.json({ error: "not found" }, { status: 404 })
  const review = reviewFromBody(await body(req), food.shop, food.id)
  if (!review) return Response.json({ error: "bad review" }, { status: 400 })
  await addReview(review)
  return Response.json(toPublic(review, review.userId))
}

/** Chủ đánh giá sửa. Body: { id, userId, rating, comment } — userId phải là chủ đánh giá */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!getFood((await params).id)) return Response.json({ error: "not found" }, { status: 404 })
  const b = await body(req)
  const content = contentFromBody(b)
  if (typeof b.id !== "string" || !userIdOf(b) || !content) return Response.json({ error: "bad request" }, { status: 400 })
  const result = await updateReview(b.id, userIdOf(b), content)
  if ("error" in result) return Response.json({ error: result.error }, { status: ERROR_STATUS[result.error] })
  return Response.json(toPublic(result.review, userIdOf(b)))
}

/** Chủ đánh giá xóa. Body: { id, userId } */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!getFood((await params).id)) return Response.json({ error: "not found" }, { status: 404 })
  const b = await body(req)
  if (typeof b.id !== "string" || !userIdOf(b)) return Response.json({ error: "bad request" }, { status: 400 })
  const result = await deleteReview(b.id, userIdOf(b))
  if ("error" in result) return Response.json({ error: result.error }, { status: ERROR_STATUS[result.error] })
  return Response.json({ ok: true })
}
