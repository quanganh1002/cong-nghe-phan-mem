"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { DEFAULT_LANG, LANGUAGES, getLanguage, type LangCode } from "./languages"
import { DICT_EN, DICT_KEYS, DICT_VI, type Dict } from "./i18n"
import { preloadStatic, useL10n } from "./translate-client"

interface AppState {
  lang: LangCode
  setLang: (l: LangCode) => void
  dict: Dict
}

const AppContext = createContext<AppState | null>(null)

const LANG_KEY = "foodlingo:lang"

const VI_VALUES = DICT_KEYS.map((k) => DICT_VI[k])
const EN_VALUES = DICT_KEYS.map((k) => DICT_EN[k])

/** `?lang=ja` in the URL (QR codes for a given language), else the saved language, else the browser language if supported, else the default. Client-side only. */
export function detectLang(): LangCode {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")
    if (fromUrl && LANGUAGES.some((x) => x.code === fromUrl)) return fromUrl as LangCode
    const saved = localStorage.getItem(LANG_KEY) as LangCode | null
    if (saved && LANGUAGES.some((x) => x.code === saved)) return saved
    const preferred = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((x) =>
      x.toLowerCase().split("-")[0],
    )
    const match = preferred.find((p) => LANGUAGES.some((x) => x.code === p))
    if (match) return match as LangCode
  } catch {
    // không đọc được localStorage: dùng ngôn ngữ mặc định
  }
  return DEFAULT_LANG
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLangState(detectLang())
    setHydrated(true)
  }, [])

  // Persist + reflect language on <html>
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {}
    document.documentElement.lang = lang
    document.documentElement.dir = getLanguage(lang).dir
  }, [lang, hydrated])

  // Tải sẵn bản dịch của mọi ngôn ngữ khi trình duyệt rảnh để đổi ngôn ngữ là có chữ ngay
  useEffect(() => {
    if (!hydrated) return
    const run = () => LANGUAGES.forEach((x) => void preloadStatic(x.code))
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(run)
    else setTimeout(run, 500)
  }, [hydrated])

  // Đổi ngôn ngữ: chờ bản dịch dựng sẵn (tối đa 600ms) rồi đổi một lần, tránh nháy tiếng Anh
  const setLang = useCallback((l: LangCode) => {
    Promise.race([preloadStatic(l), new Promise((r) => setTimeout(r, 600))]).then(() => setLangState(l))
  }, [])

  const values = useL10n(VI_VALUES, EN_VALUES, lang)
  const dict = Object.fromEntries(DICT_KEYS.map((k, i) => [k, values[i]])) as Dict

  return <AppContext.Provider value={{ lang, setLang, dict }}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
