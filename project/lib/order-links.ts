"use client"

import { useEffect, useState } from "react"

/**
 * Nối đơn lưu trên máy khách (mã kiểu DH4004) với đơn bên quán (mã kiểu 947421),
 * để phía khách lấy được trạng thái mà trang bếp /admin cập nhật (kể cả khi bị từ chối).
 */
const KEY = "foodlingo:order-links"
const POLL_MS = 5000

export const SERVER_STATUSES = ["ordered", "confirmed", "preparing", "delivering", "completed", "cancelled"] as const
export type ServerStatus = (typeof SERVER_STATUSES)[number]
export type ServerInfo = { status: ServerStatus; reason?: string }

export const isFinal = (s?: ServerStatus) => s === "completed" || s === "cancelled"

/** { mã đơn trên máy khách: mã đơn bên quán } */
export function readLinks(): Record<string, string> {
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

/** Hỏi server trạng thái của các đơn (mã bên quán). Đơn không còn trên server thì không có trong kết quả. */
export async function fetchServerStatuses(serverIds: string[]): Promise<Record<string, ServerInfo>> {
  if (serverIds.length === 0) return {}
  const res = await fetch(`/api/orders/status?ids=${encodeURIComponent(serverIds.join(","))}`, { cache: "no-store" })
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as Record<string, unknown>
  const clean: Record<string, ServerInfo> = {}
  for (const [id, raw] of Object.entries(data)) {
    // Hỗ trợ cả kiểu cũ ("preparing") lẫn kiểu mới ({ status, reason })
    const info = typeof raw === "string" ? { status: raw } : (raw as { status?: unknown; reason?: unknown })
    if (typeof info?.status === "string" && (SERVER_STATUSES as readonly string[]).includes(info.status)) {
      clean[id] = {
        status: info.status as ServerStatus,
        ...("reason" in info && typeof info.reason === "string" && info.reason ? { reason: info.reason } : {}),
      }
    }
  }
  return clean
}

/**
 * Trả về { [mã đơn trên máy]: { serverId, status, reason } } cho các đơn có liên kết với quán.
 * Tự hỏi server mỗi 5 giây (chỉ khi tab đang mở), dừng khi mọi đơn đã kết thúc.
 */
export function useServerOrders(localIds: string[]) {
  const [links, setLinks] = useState<Record<string, string>>({})
  const [infos, setInfos] = useState<Record<string, ServerInfo>>({})

  useEffect(() => setLinks(readLinks()), [])

  const serverIds = localIds.map((id) => links[id]).filter((id): id is string => !!id)
  const pending = serverIds.filter((id) => !isFinal(infos[id]?.status))
  const key = pending.join(",")

  useEffect(() => {
    if (!key) return
    let stopped = false

    const load = async () => {
      try {
        const data = await fetchServerStatuses(key.split(","))
        if (!stopped) setInfos((prev) => ({ ...prev, ...data }))
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

  const result: Record<string, { serverId: string; status?: ServerStatus; reason?: string }> = {}
  for (const id of localIds) {
    const serverId = links[id]
    if (serverId) result[id] = { serverId, ...infos[serverId] }
  }
  return result
}
