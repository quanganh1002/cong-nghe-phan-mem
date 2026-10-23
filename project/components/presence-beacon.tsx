"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useApp } from "@/lib/store"
import type { PresenceUser } from "@/lib/presence-db"

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
  const { user } = useApp()
  const isAdmin = pathname.startsWith("/admin") // the shop's own screens are not "customers"

  // Latest page + profile, read by the heartbeat without restarting its timer
  const info = useRef({ path: pathname, user: null as PresenceUser | null })
  const sendNow = useRef<() => void>(() => {})
  info.current = {
    path: pathname,
    user: user ? { name: user.name, username: user.username, email: user.email, phone: user.phone, address: user.address } : null,
  }

  // Report right away when the visitor navigates or logs in/out
  useEffect(() => sendNow.current(), [pathname, user?.id])

  useEffect(() => {
    if (isAdmin) return
    const id = deviceId()
    const send = (leave = false) => {
      const data = JSON.stringify(leave ? { id, leave } : { id, ...info.current })
      if (leave && navigator.sendBeacon) navigator.sendBeacon("/api/presence", data)
      else fetch("/api/presence", { method: "POST", body: data, keepalive: true }).catch(() => {})
    }
    sendNow.current = () => send()

    send()
    const timer = setInterval(() => send(), HEARTBEAT_MS)
    const onHide = () => send(true)
    window.addEventListener("pagehide", onHide)
    return () => {
      sendNow.current = () => {}
      clearInterval(timer)
      window.removeEventListener("pagehide", onHide)
      send(true) // navigating into /admin or unmounting
    }
  }, [isAdmin])

  return null
}
