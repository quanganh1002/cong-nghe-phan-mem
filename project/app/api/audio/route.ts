import type { NextRequest } from "next/server"
import { isAdminPin } from "@/lib/admin-auth"
import { deleteAudio, isKey, isLang, isReadOnly, listAudio, saveAudio } from "@/lib/audio-store"
import { AUDIO_TYPES, audioKey } from "@/lib/narration"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_BYTES = 4 * 1024 * 1024 // Vercel giới hạn body ~4,5 MB; một câu thuyết minh chỉ vài trăm KB
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
const denied = (req: NextRequest) => !isAdminPin(req.headers.get("x-admin-pin"))

async function run(fn: () => Promise<Response>) {
  try {
    return await fn()
  } catch (e) {
    console.error(e)
    if (isReadOnly(e))
      return json({ error: 'Máy chủ không ghi được thư mục "audio 2" (bản deploy chỉ đọc). Thêm audio khi chạy ở máy rồi commit.' }, 503)
    return json({ error: "Lỗi máy chủ" }, 500)
  }
}

/** GET /api/audio?lang=vi — công khai: { files: { mã câu: URL } } các câu đã có file audio */
export function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? ""
  if (!isLang(lang)) return json({ error: "bad_lang" }, 400)
  return run(async () => json({ files: await listAudio(lang) }))
}

/** POST /api/audio — admin, multipart: lang, text (câu thuyết minh), file (mp3/m4a/ogg/wav/webm ≤ 4 MB) */
export function POST(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  return run(async () => {
    const form = await req.formData().catch(() => null)
    const lang = String(form?.get("lang") ?? "")
    const text = String(form?.get("text") ?? "").trim()
    const file = form?.get("file")
    if (!isLang(lang)) return json({ error: "Ngôn ngữ không hợp lệ" }, 400)
    if (!text || text.length > 400) return json({ error: "Thiếu câu thuyết minh" }, 400)
    if (!(file instanceof File) || file.size === 0) return json({ error: "Chưa chọn file" }, 400)
    if (file.size > MAX_BYTES) return json({ error: "File quá lớn (tối đa 4 MB)" }, 400)
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!(ext in AUDIO_TYPES)) return json({ error: `Chỉ nhận ${Object.keys(AUDIO_TYPES).join(", ")}` }, 400)
    const key = audioKey(text)
    await saveAudio(lang, key, ext, new Uint8Array(await file.arrayBuffer()))
    return json({ key }, 201)
  })
}

/** DELETE /api/audio?lang=vi&key=... — admin: xóa file của một câu (câu đó quay về giọng máy) */
export function DELETE(req: NextRequest) {
  if (denied(req)) return json({ error: "unauthorized" }, 401)
  const lang = req.nextUrl.searchParams.get("lang") ?? ""
  const key = req.nextUrl.searchParams.get("key") ?? ""
  if (!isLang(lang) || !isKey(key)) return json({ error: "Tham số không hợp lệ" }, 400)
  return run(async () => {
    await deleteAudio(lang, key)
    return json({ ok: true })
  })
}
