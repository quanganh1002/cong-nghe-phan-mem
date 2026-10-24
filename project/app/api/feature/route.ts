import { GLOSSARY } from "@/lib/glossary"
import { recordFeature } from "@/lib/visits-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const GLOSSARY_KEYS = new Set(GLOSSARY.flatMap((g) => [`glossary:${g.id}:term`, `glossary:${g.id}:meaning`]))

/** Chỉ nhận các khóa đã biết để khách không tự tạo thêm dòng trong bảng thống kê */
const isFeatureKey = (k: string) => k === "near_me" || k === "near_listen" || GLOSSARY_KEYS.has(k)

/** POST /api/feature { key } — công khai: khách vừa dùng một tính năng phụ (đếm 1 lượt). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { key?: unknown } | null
  const key = typeof body?.key === "string" ? body.key : ""
  if (!isFeatureKey(key)) return Response.json({ error: "bad_key" }, { status: 400 })
  try {
    await recordFeature(key)
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
