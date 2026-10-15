"use client"

import { useEffect, useState } from "react"

/**
 * Nối đơn lưu trên máy khách (mã kiểu DH4004) với đơn bên quán (mã kiểu 947421),
 * để trang "Đơn hàng" của khách lấy được trạng thái mà trang bếp /admin cập nhật.
 */
const KEY = "foodlingo:order-links"
const POLL_MS = 5000

export const SERVER_STATUSES = ["ordered", "confirmed", "preparing", "delivering", "completed"] as const
export type ServerStatus = (typeof SERVER_STATUSES)[number]

function readLinks(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string>
  } catch {
    return {}
  }
}

/** Gọi ngay sau khi đặt hàng thành công */
export function linkOrder(localId: string, serverId: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readLinks(), [localId]: serverId }))
  } catch {
    // localStorage bị chặn thì thôi, đơn vẫn đặt được, chỉ không tự cập nhật trạng thái
  }
}

/**
 * Trả về { [mã đơn trên máy]: { serverId, status } } cho các đơn có liên kết với quán.
 * Tự hỏi server mỗi 5 giây (chỉ khi tab đang mở), dừng khi mọi đơn đã hoàn thành.
 */
export function useServerOrders(localIds: string[]) {
  const [links, setLinks] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, ServerStatus>>({})

  useEffect(() => setLinks(readLinks()), [])

  const serverIds = localIds.map((id) => links[id]).filter((id): id is string => !!id)
  const pending = serverIds.filter((id) => statuses[id] !== "completed")
  const key = pending.join(",")

  useEffect(() => {
    if (!key) return
    let stopped = false

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/status?ids=${encodeURIComponent(key)}`, { cache: "no-store" })
        if (!res.ok || stopped) return
        const data = (await res.json()) as Record<string, string>
        const clean: Record<string, ServerStatus> = {}
        for (const [id, st] of Object.entries(data)) {
          if ((SERVER_STATUSES as readonly string[]).includes(st)) clean[id] = st as ServerStatus
        }
        if (!stopped) setStatuses((prev) => ({ ...prev, ...clean }))
      } catch {
        // mất mạng tạm thời: lần sau thử lại
      }
    }

    load()
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, POLL_MS)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [key])

  const result: Record<string, { serverId: string; status?: ServerStatus }> = {}
  for (const id of localIds) {
    const serverId = links[id]
    if (serverId) result[id] = { serverId, status: statuses[serverId] }
  }
  return result
}
