"use client"

import { useEffect, useState } from "react"
import type { LangCode } from "./languages"

/**
 * Nội dung gốc chỉ có tiếng Việt và tiếng Anh. Các ngôn ngữ khác được dịch từ bản tiếng Anh
 * qua /api/translate, lưu vào localStorage để lần sau hiện ngay.
 */
const CACHE_KEY = "foodlingo:tr:v1:"
const BATCH = 40

const caches = new Map<LangCode, Record<string, string>>()
const inflight = new Map<string, Promise<void>>()

function cacheFor(lang: LangCode): Record<string, string> {
  let c = caches.get(lang)
  if (!c) {
    try {
      c = JSON.parse(localStorage.getItem(CACHE_KEY + lang) ?? "{}") as Record<string, string>
    } catch {
      c = {}
    }
    caches.set(lang, c)
  }
  return c
}

function persist(lang: LangCode) {
  try {
    localStorage.setItem(CACHE_KEY + lang, JSON.stringify(caches.get(lang) ?? {}))
  } catch {
    // hết dung lượng lưu trữ: bỏ qua, vẫn dùng bộ nhớ tạm
  }
}

/**
 * Bản dịch dựng sẵn (scripts/pretranslate.mjs → public/translations/<lang>.json).
 * Giữ trong bộ nhớ, ưu tiên hơn việc gọi /api/translate; chỉ chữ còn thiếu mới phải dịch lúc chạy.
 */
const statics = new Map<LangCode, Record<string, string>>()
const staticLoads = new Map<LangCode, Promise<void>>()

function loadStatic(lang: LangCode): Promise<void> {
  let job = staticLoads.get(lang)
  if (!job) {
    job = fetch(`/translations/${lang}.json`)
      .then((res) => (res.ok ? (res.json() as Promise<Record<string, string>>) : {}))
      .then((table) => {
        statics.set(lang, table)
      })
      .catch(() => {
        statics.set(lang, {})
      })
    staticLoads.set(lang, job)
  }
  return job
}

/** Bản dịch đã có (hoặc chính văn bản gốc nếu chưa dịch) */
function peek(texts: string[], lang: LangCode): string[] {
  if (typeof window === "undefined") return texts
  const c = cacheFor(lang)
  const s = statics.get(lang)
  return texts.map((t) => s?.[t] ?? c[t] ?? t)
}

async function translate(texts: string[], lang: LangCode): Promise<void> {
  await loadStatic(lang)
  const c = cacheFor(lang)
  const s = statics.get(lang) ?? {}
  const missing = [...new Set(texts.filter((t) => t && !(t in c) && !(t in s)))]
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH)
    const key = lang + "\u0000" + batch.join("\u0001")
    let job = inflight.get(key)
    if (!job) {
      job = (async () => {
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ to: lang, texts: batch }),
          })
          if (!res.ok) return
          const { texts: out } = (await res.json()) as { texts: (string | null)[] }
          out.forEach((t, k) => {
            if (t) c[batch[k]] = t
          })
          persist(lang)
        } catch {
          // mất mạng: giữ bản tiếng Anh
        }
      })().finally(() => inflight.delete(key))
      inflight.set(key, job)
    }
    await job
  }
}

/** Trả về `vi` / `en` đúng ngôn ngữ; ngôn ngữ khác trả về bản dịch của `en` (tạm là `en` trong lúc chờ dịch) */
export function useL10n(vi: string[], en: string[], lang: LangCode): string[] {
  const [, bump] = useState(0)
  const sig = en.join("\u0001")
  const foreign = lang !== "vi" && lang !== "en"

  useEffect(() => {
    if (!foreign) return
    let alive = true
    translate(en, lang).then(() => alive && bump((n) => n + 1))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang, foreign])

  if (lang === "vi") return vi
  if (lang === "en") return en
  return peek(en, lang)
}
