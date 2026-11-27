import { promises as fs } from "node:fs"
import path from "node:path"
import { LANGUAGES } from "./languages"
import { AUDIO_TYPES } from "./narration"

/**
 * File audio thuyết minh, mỗi câu một file: "audio 2"/<ngôn ngữ>/<audioKey(câu)>.<đuôi>, trong thư mục project
 * (đổi bằng biến AUDIO_DIR). Phục vụ qua /api/audio/file/<lang>/<file>. Thư mục này được commit cùng mã nguồn;
 * next.config.mjs đưa nó vào bản deploy (outputFileTracingIncludes).
 */
export const AUDIO_DIR = process.env.AUDIO_DIR || path.join(process.cwd(), "audio 2")

export const isLang = (l: string) => LANGUAGES.some((x) => x.code === l)
export const isKey = (k: string) => /^[0-9a-f]{14}$/.test(k)
export const isFile = (f: string) => /^[0-9a-f]{14}\.[a-z0-9]{2,4}$/.test(f) && f.split(".")[1] in AUDIO_TYPES

/** Mọi file của một ngôn ngữ: mã câu → URL phát được */
export async function listAudio(lang: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  let names: string[] = []
  try {
    names = await fs.readdir(path.join(AUDIO_DIR, lang))
  } catch {
    return out // chưa có thư mục của ngôn ngữ này
  }
  for (const name of names) {
    if (!isFile(name)) continue
    const { mtimeMs } = await fs.stat(path.join(AUDIO_DIR, lang, name))
    // ?v= để trình duyệt không phát bản cũ đã lưu đệm khi admin thay file
    out[name.split(".")[0]] = `/api/audio/file/${lang}/${name}?v=${Math.round(mtimeMs)}`
  }
  return out
}

/** Lưu (thay) file của một câu; xóa bản cũ có đuôi khác */
export async function saveAudio(lang: string, key: string, ext: string, data: Uint8Array): Promise<void> {
  await deleteAudio(lang, key)
  const dir = path.join(AUDIO_DIR, lang)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, `${key}.${ext}.tmp`), data)
  await fs.rename(path.join(dir, `${key}.${ext}.tmp`), path.join(dir, `${key}.${ext}`))
}

/** Xóa file của một câu (mọi đuôi); câu đó sẽ đọc bằng giọng máy */
export async function deleteAudio(lang: string, key: string): Promise<void> {
  for (const ext of Object.keys(AUDIO_TYPES)) await fs.rm(path.join(AUDIO_DIR, lang, `${key}.${ext}`), { force: true })
}

/** Đọc một file trong thư mục audio */
export async function readAudio(lang: string, file: string): Promise<Uint8Array | null> {
  try {
    return await fs.readFile(path.join(AUDIO_DIR, lang, file))
  } catch {
    return null
  }
}

/** Lỗi do máy chủ không cho ghi (Vercel chỉ đọc) */
export const isReadOnly = (e: unknown) => ["EROFS", "EACCES", "EPERM"].includes((e as NodeJS.ErrnoException)?.code ?? "")
