import type { NextRequest } from "next/server"
import { saveFoodImage } from "@/lib/foods-db"
import { shopForPin } from "@/lib/orders-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const MAX_BYTES = 2 * 1024 * 1024

/** Admin tải ảnh món lên: gửi thẳng file ảnh làm body (trình duyệt đã thu nhỏ trước). Trả { url } để gắn vào món */
export async function POST(req: NextRequest) {
  const shop = shopForPin(req.headers.get("x-admin-pin"))
  if (!shop) return Response.json({ error: "unauthorized" }, { status: 401 })

  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim()
  const ext = TYPES[type]
  if (!ext) return Response.json({ error: "Chỉ nhận ảnh JPG, PNG hoặc WebP" }, { status: 400 })

  const bytes = Buffer.from(await req.arrayBuffer())
  if (bytes.length === 0 || bytes.length > MAX_BYTES) return Response.json({ error: "Ảnh quá lớn (tối đa 2MB)" }, { status: 413 })

  const name = `${shop}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  return Response.json({ url: await saveFoodImage(name, bytes, type) })
}
