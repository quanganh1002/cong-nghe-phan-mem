import type { NextRequest } from "next/server"
import { buildFood, newFoodId } from "@/lib/food-input"
import { listAllFoods, saveFood } from "@/lib/foods-db"
import { shopForPin } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

/** Toàn bộ menu (kể cả món đã ẩn, có cờ hidden) — ai cũng xem được; trang khách tự lọc món ẩn */
export async function GET() {
  return Response.json(await listAllFoods(), { headers: { "Cache-Control": "no-store" } })
}

/** Admin quán thêm món mới (tự dịch sang 9 ngôn ngữ). Body: { name, description, price, category, image, popular, isNew } */
export async function POST(req: NextRequest) {
  const shop = shopForPin(req.headers.get("x-admin-pin"))
  if (!shop) return Response.json({ error: "unauthorized" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const name = typeof body.name === "string" ? body.name : ""
  const taken = new Set((await listAllFoods()).map((f) => f.id))
  let id = newFoodId(name)
  while (taken.has(id)) id = newFoodId(name)

  const built = await buildFood(body, shop, undefined, id)
  if ("error" in built) return Response.json({ error: built.error }, { status: 400 })
  await saveFood(built.food)
  return Response.json({ food: built.food, failed: built.failed })
}
