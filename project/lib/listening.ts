"use client"

import { useEffect } from "react"

/**
 * Món ăn khách đang nghe thuyết minh, để PresenceBeacon báo cho admin ("đang nghe Phở bò").
 * Giữ ở biến module vì beacon và trang món là hai component không liên quan nhau.
 */
export const LISTENING_EVENT = "foodlingo:listening"

let current = ""

export const getListening = () => current

function set(id: string) {
  if (id === current) return
  current = id
  window.dispatchEvent(new Event(LISTENING_EVENT))
}

/** Gọi với mã món khi đang đọc, `null` khi dừng hoặc tạm dừng */
export function useReportListening(id: string | null) {
  useEffect(() => {
    set(id ?? "")
  }, [id])
  useEffect(() => () => set(""), [])
}
