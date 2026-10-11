"use client"
 
import { useCallback, useEffect, useRef, useState } from "react"
 
/**
 * Thứ tự ưu tiên giọng có sẵn trong trình duyệt/hệ điều hành:
 * HoaiMy / NamMinh = giọng Natural tiếng Việt của Microsoft (Edge).
 */
const PREFERRED = [/hoaimy/i, /namminh/i, /natural/i, /online/i, /google/i]
 
/** Tốc độ đọc theo ngôn ngữ (1 = bình thường) */
const RATE: Record<string, number> = { vi: 1.3 }
 
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
 
/** Tách văn bản thành các đoạn ngắn (<= max ký tự): ưu tiên ngắt ở dấu câu, câu quá dài thì ngắt ở dấu phẩy rồi theo từ */
function splitText(text: string, max = 150): string[] {
  const sentences = (text.match(/[^.!?…。！？\n]+[.!?…。！？]*/g) ?? [text]).map((x) => x.trim()).filter(Boolean)
  const pieces: string[] = []
  for (const sentence of sentences) {
    if (sentence.length <= max) {
      pieces.push(sentence)
      continue
    }
    for (const part of sentence.split(/(?<=[,;:，；：])\s+/)) pieces.push(...breakLong(part.trim(), max))
  }
  const chunks: string[] = []
  let cur = ""
  for (const piece of pieces) {
    if ((cur + " " + piece).trim().length > max && cur) {
      chunks.push(cur)
      cur = piece
    } else {
      cur = (cur + " " + piece).trim()
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}
 
/** Giọng dự phòng: gọi qua /api/tts (server proxy tới Google, không cần API key, cần có mạng) */
const ttsUrl = (text: string, lang: string) =>
  `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`
 
export function useSpeech() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const tokenRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const modeRef = useRef<"synth" | "audio">("synth")
 
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
 
  const stop = useCallback(() => {
    if (typeof window === "undefined") return
    tokenRef.current++
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setSpeaking(false)
    setPaused(false)
  }, [])
 
  const speak = useCallback(
    (text: string, lang: string) => {
      if (typeof window === "undefined") return
      stop()
      const token = tokenRef.current
      const base = lang.split("-")[0].toLowerCase()
      const rate = RATE[base] ?? 1
      const chunks = splitText(text)
 
      if ("speechSynthesis" in window && voicesRef.current.length === 0) {
        voicesRef.current = window.speechSynthesis.getVoices()
      }
      const voice = "speechSynthesis" in window ? pickVoice(voicesRef.current, lang) : null
 
      /* --- Có giọng đúng ngôn ngữ trong máy --- */
      if (voice) {
        modeRef.current = "synth"
        const synth = window.speechSynthesis
        chunks.forEach((chunk, i) => {
          const u = new SpeechSynthesisUtterance(chunk)
          u.voice = voice
          u.lang = voice.lang
          u.rate = rate
          if (i === chunks.length - 1) {
            const finish = () => {
              if (token !== tokenRef.current) return
              setSpeaking(false)
              setPaused(false)
            }
            u.onend = finish
            u.onerror = finish
          }
          synth.speak(u)
        })
        setSpeaking(true)
        setPaused(false)
        return
      }
 
      /* --- Máy không có giọng ngôn ngữ này → dùng giọng Google qua <audio> --- */
      modeRef.current = "audio"
      const audio = new Audio()
      audio.playbackRate = rate
      audioRef.current = audio
      let i = 0
      const finish = () => {
        if (token !== tokenRef.current) return
        setSpeaking(false)
        setPaused(false)
      }
      // Giọng online lỗi (mất mạng, bị chặn...) → đọc bằng giọng mặc định của máy để vẫn có tiếng
      const fallbackSynth = () => {
        if (token !== tokenRef.current) return
        if (!("speechSynthesis" in window)) return finish()
        modeRef.current = "synth"
        audioRef.current = null
        const synth = window.speechSynthesis
        const rest = chunks.slice(Math.max(0, i - 1))
        rest.forEach((chunk, k) => {
          const u = new SpeechSynthesisUtterance(chunk)
          u.lang = lang
          u.rate = rate
          if (k === rest.length - 1) {
            u.onend = finish
            u.onerror = finish
          }
          synth.speak(u)
        })
      }
      const next = () => {
        if (token !== tokenRef.current) return
        if (i >= chunks.length) return finish()
        audio.src = ttsUrl(chunks[i++], base)
        audio.playbackRate = rate
        audio.play().catch(fallbackSynth)
      }
      audio.onended = next
      audio.onerror = fallbackSynth
      setSpeaking(true)
      setPaused(false)
      next()
    },
    [stop],
  )
 
  const pause = useCallback(() => {
    if (modeRef.current === "audio") audioRef.current?.pause()
    else if ("speechSynthesis" in window) window.speechSynthesis.pause()
    setPaused(true)
  }, [])
 
  const resume = useCallback(() => {
    if (modeRef.current === "audio") audioRef.current?.play().catch(() => {})
    else if ("speechSynthesis" in window) window.speechSynthesis.resume()
    setPaused(false)
  }, [])
 
  useEffect(() => () => stop(), [stop])
 
  return { supported, speaking, paused, speak, pause, resume, stop }
}
