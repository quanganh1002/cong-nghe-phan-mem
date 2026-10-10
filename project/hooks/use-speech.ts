"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface SpeechState {
  supported: boolean
  speaking: boolean
  paused: boolean
  speak: (text: string, lang: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

export function useSpeech(): SpeechState {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window)
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const pickVoice = useCallback((lang: string): SpeechSynthesisVoice | undefined => {
    const voices = window.speechSynthesis.getVoices()
    const base = lang.split("-")[0]
    return (
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(base))
    )
  }, [])

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      const voice = pickVoice(lang)
      if (voice) u.voice = voice
      u.rate = 0.98
      u.pitch = 1
      u.onstart = () => {
        setSpeaking(true)
        setPaused(false)
      }
      u.onend = () => {
        setSpeaking(false)
        setPaused(false)
      }
      u.onerror = () => {
        setSpeaking(false)
        setPaused(false)
      }
      utteranceRef.current = u
      // Some browsers need the voice list to load first.
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const v = pickVoice(lang)
          if (v) u.voice = v
          window.speechSynthesis.speak(u)
          window.speechSynthesis.onvoiceschanged = null
        }
      } else {
        window.speechSynthesis.speak(u)
      }
    },
    [pickVoice],
  )

  const pause = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume()
      setPaused(false)
    }
  }, [])

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      setPaused(false)
    }
  }, [])

  return { supported, speaking, paused, speak, pause, resume, stop }
}
