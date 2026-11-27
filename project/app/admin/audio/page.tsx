"use client"

import { useRef, useState } from "react"
import { Pause, Play, Trash2, Upload } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useAudioFiles } from "@/lib/audio-client"
import type { DishText } from "@/lib/dishes"
import { useDishes } from "@/lib/dishes-context"
import { DICT_EN, DICT_VI } from "@/lib/i18n"
import { LANGUAGES, type LangCode } from "@/lib/languages"
import { AUDIO_TYPES, audioKey, narrationSegments, type NarrationMode } from "@/lib/narration"
import { useL10n } from "@/lib/translate-client"
import { cn } from "@/lib/utils"

const FIELDS: (keyof DishText)[] = ["name", "summary", "origin", "culture", "ingredients", "tip"]
const LABELS = ["sectionOrigin", "sectionCulture", "sectionIngredients", "sectionTip"] as const
const select = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"

/**
 * Audio thuyết minh theo từng câu: câu có file thì trang món phát file, chưa có thì đọc bằng giọng máy.
 * Tạo hàng loạt bằng giọng Google: node scripts/gen-audio.mjs (xem đầu file script).
 */
function AudioManager({ pin }: { pin: string }) {
  const { dishes, getDish } = useDishes()
  const [dishId, setDishId] = useState(dishes[0]?.id ?? "")
  const [lang, setLang] = useState<LangCode>("vi")
  const [mode, setMode] = useState<NarrationMode>("full")
  const [files, reload] = useAudioFiles(lang)
  const [busy, setBusy] = useState<string | null>(null) // mã câu đang tải lên / xóa
  const [error, setError] = useState("")
  const [playing, setPlaying] = useState<string | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const pickFor = useRef<string>("") // câu đang chọn file

  const dish = getDish(dishId) ?? dishes[0]
  // Nội dung món + tiêu đề mục theo ngôn ngữ đã chọn (8 ngôn ngữ dịch máy, giống trang món)
  const vi = [...FIELDS.map((f) => dish.vi[f]), ...LABELS.map((k) => DICT_VI[k])]
  const en = [...FIELDS.map((f) => dish.en[f]), ...LABELS.map((k) => DICT_EN[k])]
  const t = useL10n(vi, en, lang)
  const info = Object.fromEntries(FIELDS.map((f, i) => [f, t[i]])) as unknown as DishText
  const labels = Object.fromEntries(LABELS.map((k, i) => [k, t[FIELDS.length + i]])) as Record<(typeof LABELS)[number], string>
  const segments = narrationSegments(info, labels, mode)
  const done = segments.filter((s) => files[audioKey(s)]).length
  const speechLang = LANGUAGES.find((l) => l.code === lang)!.speechLang

  const play = (text: string) => {
    const key = audioKey(text)
    audio.current?.pause()
    if (playing === key) return setPlaying(null)
    // chưa có file: nghe thử giọng Google dự phòng để so sánh
    const a = new Audio(files[key] ?? `/api/tts?lang=${lang}&text=${encodeURIComponent(text)}`)
    a.onended = a.onerror = () => setPlaying((p) => (p === key ? null : p))
    audio.current = a
    setPlaying(key)
    a.play().catch(() => setPlaying(null))
  }

  const send = async (text: string, init: RequestInit, url = "/api/audio") => {
    const key = audioKey(text)
    setBusy(key)
    setError("")
    try {
      const res = await fetch(url, { ...init, headers: { "x-admin-pin": pin } })
      if (!res.ok) setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Lỗi ${res.status}`)
      else reload()
    } catch {
      setError("Không kết nối được máy chủ")
    } finally {
      setBusy(null)
    }
  }

  const upload = (file: File) => {
    const text = pickFor.current
    const form = new FormData()
    form.set("lang", lang)
    form.set("text", text)
    form.set("file", file)
    send(text, { method: "POST", body: form })
  }

  const remove = (text: string) => {
    if (confirm("Xóa file audio của câu này? Câu sẽ đọc bằng giọng máy."))
      send(text, { method: "DELETE" }, `/api/audio?lang=${lang}&key=${audioKey(text)}`)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3">
        <label className="block text-sm font-semibold">
          Món
          <select className={select} value={dish.id} onChange={(e) => setDishId(e.target.value)}>
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.emoji} {d.vi.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Ngôn ngữ
          <select className={select} value={lang} onChange={(e) => setLang(e.target.value as LangCode)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Bản thuyết minh
          <select className={select} value={mode} onChange={(e) => setMode(e.target.value as NarrationMode)}>
            <option value="full">Đầy đủ</option>
            <option value="short">Ngắn</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        <b className="text-foreground">
          {done}/{segments.length}
        </b>{" "}
        câu đã có file audio (lưu trong thư mục <code className="rounded bg-muted px-1">project/audio 2</code>). Câu chưa có file sẽ đọc bằng
        giọng máy. Tạo hàng loạt bằng giọng Google:{" "}
        <code className="rounded bg-muted px-1">node scripts/gen-audio.mjs</code>. Nhận {Object.keys(AUDIO_TYPES).join(", ")} (tối đa 4 MB).
      </p>
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

      <input
        type="file"
        hidden
        accept={Object.keys(AUDIO_TYPES)
          .map((e) => `.${e}`)
          .join(",")}
        id="audio-pick"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = "" // chọn lại cùng file vẫn chạy
          if (f) upload(f)
        }}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm" lang={speechLang}>
          <thead className="bg-primary/10 text-xs uppercase tracking-wide">
            <tr>
              <th className="w-12 px-3 py-3 text-center font-bold">#</th>
              <th className="px-3 py-3 text-left font-bold">Câu thuyết minh</th>
              <th className="w-32 px-3 py-3 text-center font-bold">Audio</th>
              <th className="w-56 px-3 py-3 text-center font-bold">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s, i) => {
              const key = audioKey(s)
              const has = !!files[key]
              return (
                <tr key={`${i}-${key}`} className="border-t border-border">
                  <td className="px-3 py-2.5 text-center tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2.5">{s}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("inline-block rounded px-2 py-1 text-xs font-bold", has ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground")}>
                      {has ? "Có file" : "Giọng máy"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => play(s)}
                        title={has ? "Nghe file" : "Nghe thử giọng Google"}
                        className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white"
                      >
                        {playing === key ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        Nghe
                      </button>
                      <button
                        type="button"
                        disabled={busy === key}
                        onClick={() => {
                          pickFor.current = s
                          document.getElementById("audio-pick")?.click()
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <Upload className="size-3.5" />
                        {busy === key ? "Đang tải…" : has ? "Thay" : "Tải lên"}
                      </button>
                      <button
                        type="button"
                        disabled={!has || busy === key}
                        onClick={() => remove(s)}
                        aria-label="Xóa file audio"
                        title="Xóa file audio"
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-30"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminAudioPage() {
  return <AdminShell title="Audio thuyết minh">{(pin) => <AudioManager pin={pin} />}</AdminShell>
}
