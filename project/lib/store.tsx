"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { DEFAULT_LANG, LANGUAGES, getLanguage, type LangCode } from "./languages"
import { DICT_EN, DICT_KEYS, DICT_VI, type Dict } from "./i18n"
import { useL10n } from "./translate-client"

interface AppState {
  lang: LangCode
  setLang: (l: LangCode) => void
  dict: Dict
}

const AppContext = createContext<AppState | null>(null)

const LANG_KEY = "foodlingo:lang"

const VI_VALUES = DICT_KEYS.map((k) => DICT_VI[k])
const EN_VALUES = DICT_KEYS.map((k) => DICT_EN[k])

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY) as LangCode | null
      if (l && LANGUAGES.some((x) => x.code === l)) setLangState(l)
      else {
        // First visit: pick the browser language if we support it
        const preferred = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((x) =>
          x.toLowerCase().split("-")[0],
        )
        const match = preferred.find((p) => LANGUAGES.some((x) => x.code === p))
        if (match) setLangState(match as LangCode)
      }
    } catch {
      // không đọc được localStorage: dùng ngôn ngữ mặc định
    }
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

  const setLang = useCallback((l: LangCode) => setLangState(l), [])

  const values = useL10n(VI_VALUES, EN_VALUES, lang)
  const dict = Object.fromEntries(DICT_KEYS.map((k, i) => [k, values[i]])) as Dict

  return <AppContext.Provider value={{ lang, setLang, dict }}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
