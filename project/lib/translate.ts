import type { FoodText } from "./foods"
import { LANGUAGES, type LangCode } from "./languages"

/** Mã ngôn ngữ của Google Translate (khác LangCode ở tiếng Trung) */
const GOOGLE_CODE: Partial<Record<LangCode, string>> = { zh: "zh-CN" }

/** Dịch 1 đoạn từ tiếng Việt, cùng cách với app/api/tts (Google Translate, không cần khóa). Lỗi thì ném ra */
async function translateText(text: string, to: LangCode): Promise<string> {
  if (!text) return ""
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${GOOGLE_CODE[to] ?? to}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`translate ${res.status}`)
  const data = (await res.json()) as [[string, string][]]
  const out = data[0].map((part) => part[0]).join("").trim()
  if (!out) throw new Error("translate empty")
  return out
}

/** Dịch tên + mô tả tiếng Việt sang 9 ngôn ngữ còn lại. Ngôn ngữ nào dịch lỗi thì giữ bản của `fallback` (nếu có) hoặc tiếng Việt, và được báo trong `failed` */
export async function translateFood(
  vi: FoodText,
  fallback?: Partial<Record<LangCode, FoodText>>,
): Promise<{ t: Record<LangCode, FoodText>; failed: LangCode[] }> {
  const failed: LangCode[] = []
  const entries = await Promise.all(
    LANGUAGES.map(async ({ code }): Promise<[LangCode, FoodText]> => {
      if (code === "vi") return [code, vi]
      try {
        const [name, description] = await Promise.all([translateText(vi.name, code), translateText(vi.description, code)])
        return [code, { name, description }]
      } catch {
        failed.push(code)
        return [code, fallback?.[code] ?? vi]
      }
    }),
  )
  return { t: Object.fromEntries(entries) as Record<LangCode, FoodText>, failed }
}
