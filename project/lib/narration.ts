/**
 * Ghép và tách nội dung thuyết minh. Dùng chung cho trang món (đọc), trang admin audio và scripts/gen-audio.mjs
 * (tạo file), nên ba nơi luôn ra cùng các câu và cùng mã câu. Không import gì để script Node chạy thẳng được.
 */

/** Cắt một câu quá dài theo từ để mỗi mảnh <= max ký tự */
function breakLong(s: string, max: number): string[] {
  if (s.length <= max) return [s]
  const out: string[] = []
  let cur = ""
  for (const w of s.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur)
      cur = w
    } else {
      cur = (cur + " " + w).trim()
    }
  }
  if (cur) out.push(cur)
  return out
}

/**
 * Split text into sentences (each <= max chars). One segment = one sentence, so the UI
 * can highlight and seek per sentence. Over-long sentences are broken at commas, then by word.
 */
export function splitText(text: string, max = 150): string[] {
  const sentences = (text.match(/[^.!?…。！？\n]+[.!?…。！？]*/g) ?? [text]).map((x) => x.trim()).filter(Boolean)
  const out: string[] = []
  for (const sentence of sentences) {
    if (sentence.length <= max) {
      out.push(sentence)
      continue
    }
    for (const part of sentence.split(/(?<=[,;:，；：])\s+/)) out.push(...breakLong(part.trim(), max))
  }
  return out
}

export type NarrationMode = "short" | "full"
type Text = { name: string; summary: string; origin: string; culture: string; ingredients: string; tip: string }
type Labels = { sectionOrigin: string; sectionCulture: string; sectionIngredients: string; sectionTip: string }

const firstSentence = (s: string) => s.match(/^[^.!?…。！？]+[.!?…。！？]?/)?.[0].trim() ?? s

/** Các câu thuyết minh của một món (đã dịch) theo bản ngắn hoặc đầy đủ */
export function narrationSegments(info: Text, labels: Labels, mode: NarrationMode): string[] {
  const parts =
    mode === "short"
      ? [info.name, info.summary, firstSentence(info.origin), firstSentence(info.culture)]
      : [
          info.name,
          info.summary,
          `${labels.sectionOrigin}. ${info.origin}`,
          `${labels.sectionCulture}. ${info.culture}`,
          `${labels.sectionIngredients}. ${info.ingredients}`,
          `${labels.sectionTip}. ${info.tip}`,
        ]
  return splitText(parts.join("\n"))
}

/** Mã của một câu (băm cyrb53, 14 ký tự hex): tên file audio là <ngôn ngữ>/<mã>.<đuôi>. Sửa câu là ra mã mới. */
export function audioKey(text: string): string {
  const s = text.trim().normalize("NFC")
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0")
}

/** Đuôi file audio được nhận và kiểu MIME tương ứng */
export const AUDIO_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
}
