"use client"

import { useEffect, useRef, useState } from "react"
import type { OnlineDevice } from "@/lib/presence-db"

export interface DayRow {
  date: string
  visits: number
  qr: number
  link: number
  views: number
  plays: number
  completes: number
}

export interface DishPlays {
  plays: number
  /** Số lượt nghe bản tóm tắt (còn lại là bản đầy đủ) */
  short: number
  completes: number
}

export interface StatsData {
  days: DayRow[]
  total: { visits: number; qr: number; link: number; views: number; plays: number; completes: number }
  /** Lượt xem trang món */
  dishes: Record<string, number>
  /** Lượt nghe thuyết minh */
  dishPlays: Record<string, DishPlays>
  langs: Record<string, { views: number; plays: number; completes: number }>
  /** "near_me", "near_listen", "glossary:<id>:term|meaning" */
  features: Record<string, number>
}

/** Gọi API của admin theo `pin` mỗi `every` ms; lỗi mạng thì giữ số liệu cũ */
function usePolled<T>(url: string, pin: string, every: number): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(url, { headers: { "x-admin-pin": pin }, cache: "no-store" })
        if (res.ok && alive) setData((await res.json()) as T)
      } catch {}
    }
    load()
    const id = setInterval(load, every)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [url, pin, every])
  return data
}

/** Thiết bị đang online ngay lúc này (server đếm heartbeat, xem lib/presence-db.ts); hỏi lại mỗi 2 giây */
export const usePresence = (pin: string) => usePolled<{ online: number; devices: OnlineDevice[] }>("/api/presence", pin, 2_000)

export interface LiveEvent {
  key: number
  kind: "join" | "leave"
  device: OnlineDevice
  at: number
}

/** So sánh danh sách thiết bị giữa 2 lần hỏi để biết ai vừa vào / vừa rời đi (mới nhất trước, giữ 30 sự kiện) */
export function useLiveEvents(devices: OnlineDevice[] | undefined): LiveEvent[] {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const prev = useRef<Map<string, OnlineDevice> | null>(null)
  const seq = useRef(0)

  useEffect(() => {
    if (!devices) return
    const now = new Map(devices.map((d) => [d.id, d]))
    const before = prev.current
    prev.current = now
    if (!before) return // lần tải đầu: chỉ ghi nhận, không tính là "vừa vào"
    const fresh: LiveEvent[] = []
    for (const [id, d] of now) if (!before.has(id)) fresh.push({ key: seq.current++, kind: "join", device: d, at: Date.now() })
    for (const [id, d] of before) if (!now.has(id)) fresh.push({ key: seq.current++, kind: "leave", device: d, at: Date.now() })
    if (fresh.length) setEvents((e) => [...fresh.reverse(), ...e].slice(0, 30))
  }, [devices])

  return events
}

export const useStats = (pin: string) => usePolled<StatsData>("/api/stats", pin, 30_000)
