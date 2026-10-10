export type LangCode = "vi" | "en" | "ja" | "zh" | "es" | "fr" | "ar" | "pt" | "ru" | "hi"

export interface Language {
  code: LangCode
  /** Native name of the language */
  name: string
  /** English name */
  englishName: string
  /** Emoji flag */
  flag: string
  /** BCP-47 tag used for the Web Speech API */
  speechLang: string
  /** Text direction */
  dir: "ltr" | "rtl"
}

/** The 10 most widely spoken languages supported by FoodLingo. */
export const LANGUAGES: Language[] = [
  { code: "en", name: "English", englishName: "English", flag: "🇬🇧", speechLang: "en-US", dir: "ltr" },
  { code: "zh", name: "中文", englishName: "Chinese", flag: "🇨🇳", speechLang: "zh-CN", dir: "ltr" },
  { code: "hi", name: "हिन्दी", englishName: "Hindi", flag: "🇮🇳", speechLang: "hi-IN", dir: "ltr" },
  { code: "es", name: "Español", englishName: "Spanish", flag: "🇪🇸", speechLang: "es-ES", dir: "ltr" },
  { code: "fr", name: "Français", englishName: "French", flag: "🇫🇷", speechLang: "fr-FR", dir: "ltr" },
  { code: "ar", name: "العربية", englishName: "Arabic", flag: "🇸🇦", speechLang: "ar-SA", dir: "rtl" },
  { code: "pt", name: "Português", englishName: "Portuguese", flag: "🇧🇷", speechLang: "pt-BR", dir: "ltr" },
  { code: "ru", name: "Русский", englishName: "Russian", flag: "🇷🇺", speechLang: "ru-RU", dir: "ltr" },
  { code: "ja", name: "日本語", englishName: "Japanese", flag: "🇯🇵", speechLang: "ja-JP", dir: "ltr" },
  { code: "vi", name: "Tiếng Việt", englishName: "Vietnamese", flag: "🇻🇳", speechLang: "vi-VN", dir: "ltr" },
]

export const DEFAULT_LANG: LangCode = "vi"

export function getLanguage(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[LANGUAGES.length - 1]
}
