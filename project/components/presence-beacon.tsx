"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const HEARTBEAT_MS = 8_000
const ID_KEY = "foodlingo:device-id"

/** One id per open tab (sessionStorage), so each tab/device is counted once */
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

/** Runs silently on customer pages: tells the server this device is online, and when it leaves. */
export function PresenceBeacon() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin") // the shop's own screens are not "customers"

  useEffect(() => {
    if (isAdmin) return
    const id = deviceId()
    const send = (leave = false) => {
      const data = JSON.stringify({ id, leave })
      if (leave && navigator.sendBeacon) navigator.sendBeacon("/api/presence", data)
      else fetch("/api/presence", { method: "POST", body: data, keepalive: true }).catch(() => {})
    }

    send()
    const timer = setInterval(() => send(), HEARTBEAT_MS)
    const onHide = () => send(true)
    window.addEventListener("pagehide", onHide)
    return () => {
      clearInterval(timer)
      window.removeEventListener("pagehide", onHide)
      send(true) // navigating into /admin or unmounting
    }
  }, [isAdmin])

  return null
}
