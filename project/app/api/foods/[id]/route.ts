import type { NextRequest } from "next/server"
import { buildFood } from "@/lib/food-input"
import { findFood, saveFood } from "@/lib/foods-db"
import { shopForPin } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

/** Admin sửa món của CHÍNH quán mình (đổi giá, ảnh, ẩn/hiện…). Chỉ gửi các trường cần đổi; tên/mô tả đổi thì tự dịch lại */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const shop = shopForPin(req.headers.get("x-admin-pin"))
  if (!shop) return Response.json({ error: "unauthorized" }, { status: 401 })

  const current = await findFood((await params).id)
  if (!current) return Response.json({ error: "not found" }, { status: 404 })
  if (current.shop !== shop) return Response.json({ error: "forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const built = await buildFood(body, shop, current, current.id)
  if ("error" in built) return Response.json({ error: built.error }, { status: 400 })
  await saveFood(built.food)
  return Response.json({ food: built.food, failed: built.failed })
}
