import { NextResponse } from "next/server"
import { LANGUAGES } from "@/lib/languages"

/** Mã ngôn ngữ của Google Translate (khác LangCode ở tiếng Trung) */
const GOOGLE_CODE: Record<string, string> = { zh: "zh-CN" }
const MAX_TEXTS = 60
const MAX_LEN = 4000
const CHUNK = 800

const cache = new Map<string, string>()

/** Cắt văn bản dài theo câu để mỗi mảnh gửi đi không vượt giới hạn độ dài URL */
function chunks(text: string): string[] {
  if (text.length <= CHUNK) return [text]
  const out: string[] = []
  let cur = ""
  for (const s of text.match(/[^.!?。！？]+[.!?。！？]*\s*/g) ?? [text]) {
    if (cur && (cur + s).length > CHUNK) {
      out.push(cur)
      cur = s
    } else cur += s
  }
  if (cur) out.push(cur)
  return out
}

async function translatePiece(text: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${GOOGLE_CODE[to] ?? to}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`translate ${res.status}`)
  const data = (await res.json()) as [[string, string][]]
  const out = data[0].map((part) => part[0]).join("")
  if (!out.trim()) throw new Error("empty")
  return out.trim()
}

async function translateOne(text: string, to: string): Promise<string | null> {
  const key = `${to}\u0000${text}`
  const hit = cache.get(key)
  if (hit) return hit
  try {
    const parts = await Promise.all(chunks(text).map((c) => translatePiece(c, to)))
    const out = parts.join(" ")
    cache.set(key, out)
    return out
  } catch {
    return null
  }
}

/** POST { to, texts[] } → { texts[] }; phần dịch lỗi trả về null để trình duyệt giữ bản tiếng Anh */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { to?: unknown; texts?: unknown } | null
  const to = typeof body?.to === "string" ? body.to : ""
  if (!LANGUAGES.some((l) => l.code === to) || to === "vi" || to === "en") {
    return NextResponse.json({ error: "bad language" }, { status: 400 })
  }
  if (!Array.isArray(body?.texts) || body.texts.length > MAX_TEXTS) {
    return NextResponse.json({ error: "bad texts" }, { status: 400 })
  }
  const texts = body.texts.map((t) => (typeof t === "string" ? t.slice(0, MAX_LEN) : ""))
  const out: (string | null)[] = []
  for (let i = 0; i < texts.length; i += 8) {
    out.push(...(await Promise.all(texts.slice(i, i + 8).map((t) => (t ? translateOne(t, to) : Promise.resolve(""))))))
  }
  return NextResponse.json({ texts: out })
}
