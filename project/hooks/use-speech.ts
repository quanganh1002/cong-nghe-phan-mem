"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Thứ tự ưu tiên giọng có sẵn trong trình duyệt/hệ điều hành:
 * HoaiMy / NamMinh = giọng Natural tiếng Việt của Microsoft (Edge).
 */
const PREFERRED = [/hoaimy/i, /namminh/i, /natural/i, /online/i, /google/i]

/** Tốc độ đọc theo ngôn ngữ (1 = bình thường) */
const RATE: Record<string, number> = { vi: 1.1 }

/** Reading speeds the user can cycle through */
export const SPEEDS = [0.75, 1, 1.25] as const

const norm = (s: string) => s.toLowerCase().replace("_", "-")

/** Chỉ trả về giọng ĐÚNG ngôn ngữ; không có thì trả về null (không đọc bằng giọng ngôn ngữ khác) */
function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const base = norm(lang).split("-")[0]
  const sameLang = voices.filter((v) => norm(v.lang).split("-")[0] === base)
  if (sameLang.length === 0) return null
  for (const re of PREFERRED) {
    const exact = sameLang.find((v) => re.test(v.name) && norm(v.lang) === norm(lang))
    if (exact) return exact
    const any = sameLang.find((v) => re.test(v.name))
    if (any) return any
  }
  return sameLang.find((v) => norm(v.lang) === norm(lang)) ?? sameLang[0]
}

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

/** Giọng dự phòng: gọi qua /api/tts (server proxy tới Google, không cần API key, cần có mạng) */
const ttsUrl = (text: string, lang: string) =>
  `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`

export function useSpeech() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  /** Index of the sentence being read, -1 when idle */
  const [current, setCurrent] = useState(-1)
  const [speed, setSpeedState] = useState(1)

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const tokenRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const modeRef = useRef<"synth" | "audio">("synth")
  const segsRef = useRef<string[]>([])
  const idxRef = useRef(0)
  const langRef = useRef("vi-VN")
  const speedRef = useRef(1)
  const pausedRef = useRef(false)
  const activeRef = useRef(false)
  const playRef = useRef<(i: number) => void>(() => {})

  useEffect(() => {
    if (typeof window === "undefined") return
    setSupported(true) // luôn dùng được: có giọng hệ thống hoặc giọng dự phòng qua <audio>
    if (!("speechSynthesis" in window)) return
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    load()
    window.speechSynthesis.addEventListener("voiceschanged", load)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load)
  }, [])

  /** Silence any running synth/audio without touching React state */
  const halt = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    pausedRef.current = false
    activeRef.current = false
    setSpeaking(false)
    setPaused(false)
    setCurrent(-1)
  }, [])

  const stop = useCallback(() => {
    if (typeof window === "undefined") return
    tokenRef.current++
    halt()
    reset()
  }, [halt, reset])

  /** Read sentence i, then continue with the next one */
  const playFrom = useCallback(
    (i: number) => {
      if (typeof window === "undefined") return
      halt()
      const token = ++tokenRef.current
      const segs = segsRef.current
      if (i >= segs.length) return reset()
      const index = Math.max(0, i)
      idxRef.current = index
      activeRef.current = true
      setCurrent(index)
      setSpeaking(true)
      setPaused(false)
      pausedRef.current = false

      const text = segs[index]
      const lang = langRef.current
      const base = lang.split("-")[0].toLowerCase()
      const rate = (RATE[base] ?? 1) * speedRef.current
      const advance = () => {
        if (token === tokenRef.current) playRef.current(index + 1)
      }

      const speakSynth = (voice: SpeechSynthesisVoice | null) => {
        modeRef.current = "synth"
        const u = new SpeechSynthesisUtterance(text)
        if (voice) u.voice = voice
        u.lang = voice?.lang ?? lang
        u.rate = rate
        u.onend = advance
        u.onerror = advance
        window.speechSynthesis.speak(u)
      }

      if ("speechSynthesis" in window && voicesRef.current.length === 0) {
        voicesRef.current = window.speechSynthesis.getVoices()
      }
      const voice = "speechSynthesis" in window ? pickVoice(voicesRef.current, lang) : null
      if (voice) return speakSynth(voice)

      /* No voice for this language on the device → Google voice through <audio> */
      modeRef.current = "audio"
      const audio = new Audio(ttsUrl(text, base))
      audio.playbackRate = rate
      audioRef.current = audio
      // Online voice failed (offline, blocked...) → default device voice so there is still sound
      const fallback = () => {
        if (token !== tokenRef.current) return
        audioRef.current = null
        if ("speechSynthesis" in window) speakSynth(null)
        else advance()
      }
      audio.onended = advance
      audio.onerror = fallback
      audio.play().catch(fallback)
    },
    [halt, reset],
  )
  playRef.current = playFrom

  /** Start reading the given sentences from `from` */
  const speak = useCallback(
    (segments: string[], lang: string, from = 0) => {
      segsRef.current = segments
      langRef.current = lang
      playFrom(from)
    },
    [playFrom],
  )

  const next = useCallback(() => playFrom(idxRef.current + 1), [playFrom])
  const prev = useCallback(() => playFrom(Math.max(0, idxRef.current - 1)), [playFrom])

  const setSpeed = useCallback(
    (s: number) => {
      speedRef.current = s
      setSpeedState(s)
      // Rate only applies to a new utterance, so restart the current sentence
      if (activeRef.current && !pausedRef.current) playFrom(idxRef.current)
    },
    [playFrom],
  )

  const pause = useCallback(() => {
    if (modeRef.current === "audio") audioRef.current?.pause()
    else if ("speechSynthesis" in window) window.speechSynthesis.pause()
    pausedRef.current = true
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (modeRef.current === "audio") audioRef.current?.play().catch(() => {})
    else if ("speechSynthesis" in window) window.speechSynthesis.resume()
    pausedRef.current = false
    setPaused(false)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { supported, speaking, paused, current, speed, speak, next, prev, setSpeed, pause, resume, stop }
}
