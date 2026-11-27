// Tạo sẵn file audio thuyết minh (giọng Google) cho từng câu của mọi món, bản ngắn + đầy đủ, vào thư mục
// "audio 2" trong project: audio 2/<lang>/<mã câu>.mp3. Trang món phát file có sẵn thay cho giọng máy.
// Commit thư mục này để bản deploy cũng có audio.
//
// Chạy từ project/ (Node 22.6+, cần mạng):
//   node scripts/gen-audio.mjs [lang ...]                 tạo file còn thiếu (mặc định cả 10 ngôn ngữ)
//   node scripts/gen-audio.mjs --base http://localhost:3000 vi   lấy món từ web đang chạy (gồm món admin đã thêm/sửa)
//   node scripts/gen-audio.mjs --dish pho-bo vi en       chỉ một món
//
// Không ghi đè file đã có (kể cả file admin tải lên); muốn tạo lại câu nào thì xóa file của câu đó.
// 8 ngôn ngữ dịch máy lấy chữ từ public/translations/<lang>.json: chạy scripts/pretranslate.mjs trước; câu chưa dịch thì bỏ qua.
import { existsSync } from "node:fs"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { DISHES } from "../lib/dishes.ts"
import { DICT_EN, DICT_VI } from "../lib/i18n.ts"
import { LANGUAGES } from "../lib/languages.ts"
import { audioKey, narrationSegments } from "../lib/narration.ts"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const AUDIO_DIR = process.env.AUDIO_DIR || path.join(ROOT, "audio 2")
const GOOGLE_CODE = { zh: "zh-CN" }
const CONCURRENCY = 2 // cao hơn dễ bị Google chặn
const FIELDS = ["name", "summary", "origin", "culture", "ingredients", "tip"]
const LABELS = ["sectionOrigin", "sectionCulture", "sectionIngredients", "sectionTip"]

const args = process.argv.slice(2)
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : "")
const base = opt("--base").replace(/\/+$/, "")
const onlyDish = opt("--dish") // chỉ một món (thử nhanh)
const wanted = args.filter((a, i) => !a.startsWith("--") && !["--base", "--dish"].includes(args[i - 1]))
const langs = LANGUAGES.map((l) => l.code).filter((c) => !wanted.length || wanted.includes(c))

/** Món: từ web đang chạy (--base), không thì data/dishes.json (bản admin đã sửa khi chạy ở máy), không thì món mặc định */
async function loadDishes() {
  if (base) {
    const res = await fetch(`${base}/api/dishes`)
    if (!res.ok) throw new Error(`GET ${base}/api/dishes: HTTP ${res.status}`)
    return res.json()
  }
  const file = path.join(ROOT, "data", "dishes.json")
  return existsSync(file) ? JSON.parse(await readFile(file, "utf8")) : DISHES
}

async function tts(text, lang, tries = 3) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${GOOGLE_CODE[lang] ?? lang}&q=${encodeURIComponent(text)}`
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = new Uint8Array(await res.arrayBuffer())
      if (buf.length < 200) throw new Error("audio rỗng")
      return buf
    } catch (e) {
      if (i >= tries) throw e
      await new Promise((r) => setTimeout(r, 1500 * i))
    }
  }
}

const dishes = (await loadDishes()).filter((d) => !onlyDish || d.id === onlyDish)
if (!dishes.length) throw new Error(`Không có món "${onlyDish}"`)
console.log(`${dishes.length} món, ngôn ngữ: ${langs.join(" ")}, thư mục: ${AUDIO_DIR}`)

for (const lang of langs) {
  const dir = path.join(AUDIO_DIR, lang)
  await mkdir(dir, { recursive: true })
  const have = new Set((await readdir(dir)).map((n) => n.split(".")[0]))
  const table = lang === "vi" || lang === "en" ? null : JSON.parse(await readFile(path.join(ROOT, "public", "translations", `${lang}.json`), "utf8").catch(() => "{}"))
  const tr = (en, vi) => (lang === "vi" ? vi : lang === "en" ? en : table[en])

  // Các câu cần có file (bỏ trùng giữa các món / giữa bản ngắn và đầy đủ)
  const todo = new Map()
  let untranslated = 0
  for (const d of dishes) {
    const info = Object.fromEntries(FIELDS.map((f) => [f, tr(d.en[f], d.vi[f])]))
    const labels = Object.fromEntries(LABELS.map((k) => [k, tr(DICT_EN[k], DICT_VI[k])]))
    if ([...Object.values(info), ...Object.values(labels)].some((v) => !v)) {
      untranslated++
      continue
    }
    for (const mode of ["short", "full"])
      for (const s of narrationSegments(info, labels, mode)) {
        const key = audioKey(s)
        if (!have.has(key)) todo.set(key, s)
      }
  }

  const jobs = [...todo]
  let ok = 0
  let failed = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let job; (job = jobs.shift()); ) {
        const [key, text] = job
        try {
          await writeFile(path.join(dir, `${key}.mp3`), await tts(text, lang))
          ok++
        } catch (e) {
          failed++
          console.warn(`  ${lang} lỗi "${text.slice(0, 40)}…": ${e.message}`)
        }
        await new Promise((r) => setTimeout(r, 250))
      }
    }),
  )
  console.log(`${lang}: tạo ${ok} file, lỗi ${failed}, đã có ${have.size}${untranslated ? `, ${untranslated} món chưa có bản dịch (chạy pretranslate.mjs)` : ""}`)
}
