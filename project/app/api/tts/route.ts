import { LANGUAGES } from "@/lib/languages"

/** Giọng dự phòng cho ngôn ngữ mà máy không có giọng đọc: proxy tới Google Translate TTS (không cần khóa) */
const GOOGLE_CODE: Record<string, string> = { zh: "zh-CN" }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get("lang") ?? ""
  const text = (searchParams.get("text") ?? "").slice(0, 200)
  if (!text || !LANGUAGES.some((l) => l.code === lang)) return new Response("bad request", { status: 400 })

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${GOOGLE_CODE[lang] ?? lang}&q=${encodeURIComponent(text)}`
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return new Response("tts failed", { status: 502 })
    return new Response(res.body, {
      headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400" },
    })
  } catch {
    return new Response("tts failed", { status: 502 })
  }
}
