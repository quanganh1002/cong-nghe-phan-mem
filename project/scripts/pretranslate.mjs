// Pre-translate all English UI + dish text into public/translations/<lang>.json
// so the site works without calling Google Translate at runtime.
//
// Usage (from project/):  node scripts/pretranslate.mjs [lang ...]
// Re-running only translates texts that are missing from the existing files.
// Requires Node 22.6+ (runs the .ts data files directly) and an internet connection.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { DISHES } from "../lib/dishes.ts"
import { DICT_EN } from "../lib/i18n.ts"
import { LANGUAGES } from "../lib/languages.ts"

const GOOGLE_CODE = { zh: "zh-CN" }
const CHUNK = 800
const CONCURRENCY = 2 // higher values get rate-limited by Google
const OUT_DIR = new URL("../public/translations/", import.meta.url)

const sources = new Set(Object.values(DICT_EN))
for (const d of DISHES) for (const v of Object.values(d.en)) if (typeof v === "string" && v.trim()) sources.add(v)

const split = (text) => {
  if (text.length <= CHUNK) return [text]
  const out = []
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

async function piece(text, to, tries = 3) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${GOOGLE_CODE[to] ?? to}&dt=t&q=${encodeURIComponent(text)}`
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const out = data[0].map((p) => p[0]).join("").trim()
      if (!out) throw new Error("empty")
      return out
    } catch (e) {
      if (i >= tries) throw e
      await new Promise((r) => setTimeout(r, 800 * i))
    }
  }
}

const wanted = process.argv.slice(2)
const langs = LANGUAGES.map((l) => l.code).filter((c) => c !== "vi" && c !== "en" && (!wanted.length || wanted.includes(c)))

await mkdir(OUT_DIR, { recursive: true })
for (const lang of langs) {
  const file = new URL(`${lang}.json`, OUT_DIR)
  let table = {}
  try {
    table = JSON.parse(await readFile(file, "utf8"))
  } catch {}
  const todo = [...sources].filter((t) => !table[t])
  let failed = 0
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(
      todo.slice(i, i + CONCURRENCY).map(async (text) => {
        try {
          table[text] = (await Promise.all(split(text).map((c) => piece(c, lang)))).join(" ")
        } catch {
          failed++
        }
      }),
    )
  }
  await writeFile(file, JSON.stringify(table), "utf8")
  console.log(`${lang}: ${todo.length - failed}/${todo.length} translated, ${Object.keys(table).length} total${failed ? `, ${failed} FAILED (re-run to retry)` : ""}`)
}
