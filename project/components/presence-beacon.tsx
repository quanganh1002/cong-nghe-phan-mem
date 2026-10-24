"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { LISTENING_EVENT, getListening } from "@/lib/listening"
import { detectLang, useApp } from "@/lib/store"

const HEARTBEAT_MS = 8_000
const ID_KEY = "foodlingo:device-id"
const SRC_KEY = "foodlingo:src"
const VISITED_KEY = "foodlingo:visited"

/** Mỗi tab một id (sessionStorage) để mỗi thiết bị chỉ đếm một lần */
function deviceId() {
  try {
    let id = sessionStorage.getItem(ID_KEY)
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
      sessionStorage.setItem(ID_KEY, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2, 14)
  }
}

/** Nguồn vào web: link có ?src=qr (mã QR) thì là "qr", còn lại là "link". Nhớ suốt phiên để chuyển trang vẫn giữ nguồn */
function source(): "qr" | "link" {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("src")
    if (fromUrl === "qr") sessionStorage.setItem(SRC_KEY, "qr")
    return sessionStorage.getItem(SRC_KEY) === "qr" ? "qr" : "link"
  } catch {
    return "link"
  }
}

/** Chạy ngầm trên các trang công khai: báo cho server biết thiết bị đang online, đang xem trang nào và khi nào rời đi */
export function PresenceBeacon() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin") // màn hình quản trị không tính là khách
  const { lang } = useApp()
  const pathRef = useRef(pathname)
  pathRef.current = pathname
  const langRef = useRef<string>("")
  const hitRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (isAdmin) return
    const id = deviceId()
    const src = source()
    // AppProvider chưa kịp đọc ngôn ngữ ở lần chạy đầu, nên tự dò (cùng cách dò với provider)
    langRef.current = detectLang()
    const send = (extra: Record<string, unknown> = {}) => {
      const data = JSON.stringify({ id, path: pathRef.current, src, lang: langRef.current, listening: getListening(), ...extra })
      fetch("/api/presence", { method: "POST", body: data, keepalive: true }).catch(() => {})
    }

    // Tab mới vào web = 1 lượt truy cập
    let start = false
    try {
      if (!sessionStorage.getItem(VISITED_KEY)) {
        sessionStorage.setItem(VISITED_KEY, "1")
        start = true
      }
    } catch {}
    hitRef.current = () => send({ hit: true })
    send({ hit: true, start })

    const timer = setInterval(() => send(), HEARTBEAT_MS)
    const onHide = () => {
      const data = JSON.stringify({ id, leave: true })
      if (navigator.sendBeacon) navigator.sendBeacon("/api/presence", data)
    }
    window.addEventListener("pagehide", onHide)
    // Khách bắt đầu / dừng nghe: báo ngay, không đợi nhịp heartbeat kế tiếp
    const onListening = () => send()
    window.addEventListener(LISTENING_EVENT, onListening)
    return () => {
      window.removeEventListener(LISTENING_EVENT, onListening)
      hitRef.current = () => {}
      clearInterval(timer)
      window.removeEventListener("pagehide", onHide)
      send({ leave: true }) // chuyển vào /admin hoặc tắt component
    }
  }, [isAdmin])

  // Khách đổi ngôn ngữ: heartbeat kế tiếp sẽ mang ngôn ngữ mới (bỏ qua lần đầu vì lúc đó lang chưa được đọc từ localStorage)
  const firstLang = useRef(true)
  useEffect(() => {
    if (firstLang.current) {
      firstLang.current = false
      return
    }
    langRef.current = lang
  }, [lang])

  // Khi khách chuyển trang: báo ngay trang mới (lần đầu đã gửi ở trên nên bỏ qua)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    hitRef.current()
  }, [pathname])

  return null
}
