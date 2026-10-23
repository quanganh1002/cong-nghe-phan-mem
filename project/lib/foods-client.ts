"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import { FOODS, type Food } from "./foods"

/**
 * Menu phía trình duyệt: bắt đầu bằng menu gốc trong code (hiện ngay, không chờ mạng),
 * rồi thay bằng menu thật từ /api/foods (đã có phần admin sửa/thêm).
 */
type State = { all: Food[]; loaded: boolean }

const SERVER_STATE: State = { all: FOODS, loaded: false }
let state: State = SERVER_STATE
let started = false
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function refreshFoods() {
  try {
    const res = await fetch("/api/foods", { cache: "no-store" })
    if (!res.ok) return
    state = { all: (await res.json()) as Food[], loaded: true }
    listeners.forEach((fn) => fn())
  } catch {
    // mất mạng thì giữ menu đang có
  }
}

/** Tra 1 món ngoài component (VD: store). Có thể là món đã ẩn */
export const getFoodNow = (id: string) => state.all.find((f) => f.id === id)

/**
 * `foods` = món đang bán; `all` + `getFood` gồm cả món đã ẩn (để đơn cũ/giỏ hàng vẫn hiện được tên, ảnh).
 * `loaded` = đã lấy xong menu từ server (trước đó, món do admin thêm mới có thể chưa có trong `all`).
 */
export function useFoods() {
  const { all, loaded } = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE)

  useEffect(() => {
    if (!started) {
      started = true
      refreshFoods()
      // quay lại tab sau khi admin vừa đổi giá thì lấy lại menu
      window.addEventListener("focus", refreshFoods)
    }
  }, [])

  return useMemo(
    () => ({ all, loaded, foods: all.filter((f) => !f.hidden), getFood: (id: string) => all.find((f) => f.id === id) }),
    [all, loaded],
  )
}
