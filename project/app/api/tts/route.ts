import type { NextRequest } from "next/server"
 
// Proxy đọc văn bản thành giọng nói (Google TTS) chạy ở server để trình duyệt không bị chặn
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text") ?? ""
  const lang = req.nextUrl.searchParams.get("lang") ?? "vi"
  if (!text || text.length > 300) return new Response("bad request", { status: 400 })
 
  const url =
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob` +
    `&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    })
    if (!r.ok) return new Response("tts failed", { status: 502 })
    return new Response(r.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
    })
  } catch {
    return new Response("tts error", { status: 502 })
  }
}