"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Lưu số bàn khách đang ngồi (lấy từ QR: /menu?table=5).
 * Tự hết hạn sau 4 tiếng để khách về nhà đặt món không bị dính số bàn cũ.
 */
const KEY = "foodlingo:table"
const EVENT = "foodlingo:table"
const TTL = 4 * 60 * 60 * 1000
const TABLE_RE = /^[A-Za-z0-9-]{1,10}$/

export function isValidTable(v: string | null | undefined): v is string {
  // "none" là mã của QR đặt online (không ngồi tại quán), không phải số bàn
  return !!v && v.toLowerCase() !== "none" && TABLE_RE.test(v)
}

export function readTable(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const { table, at } = JSON.parse(raw) as { table: string; at: number }
    if (!isValidTable(table) || Date.now() - at > TTL) {
      localStorage.removeItem(KEY)
      return null
    }
    return table
  } catch {
    return null
  }
}

export function writeTable(table: string | null) {
  try {
    if (table) localStorage.setItem(KEY, JSON.stringify({ table, at: Date.now() }))
    else localStorage.removeItem(KEY)
  } catch {
    // localStorage bị chặn (tab ẩn danh...) thì bỏ qua
  }
  window.dispatchEvent(new Event(EVENT))
}

/** const [table, setTable] = useTable() — table = null nghĩa là khách không ngồi tại quán */
export function useTable() {
  const [table, setState] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setState(readTable())
    sync()
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const setTable = useCallback((t: string | null) => writeTable(t), [])
  return [table, setTable] as const
}
