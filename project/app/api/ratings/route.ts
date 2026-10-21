import { foodRatings } from "@/lib/reviews-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** Điểm trung bình + số lượt đánh giá của từng món: { [foodId]: { avg, count } } */
export async function GET() {
  return Response.json(await foodRatings())
}
