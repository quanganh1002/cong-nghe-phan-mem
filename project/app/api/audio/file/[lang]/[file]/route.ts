import { isFile, isLang, readAudio } from "@/lib/audio-store"
import { AUDIO_TYPES } from "@/lib/narration"

export const runtime = "nodejs"

/** GET /api/audio/file/<lang>/<mã>.<đuôi> — phát file trong thư mục audio/ (khi không dùng Supabase Storage) */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string; file: string }> }) {
  const { lang, file } = await params
  // chỉ nhận đúng dạng tên file, không cho ../ ra ngoài thư mục audio
  if (!isLang(lang) || !isFile(file)) return new Response("not found", { status: 404 })
  const data = await readAudio(lang, file)
  if (!data) return new Response("not found", { status: 404 })
  return new Response(data as BodyInit, {
    headers: {
      "Content-Type": AUDIO_TYPES[file.split(".")[1]],
      // URL có ?v=<thời điểm sửa> nên lưu đệm lâu được
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "none",
    },
  })
}
