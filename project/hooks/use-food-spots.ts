"use client"

import { useCallback, useEffect, useState } from "react"
import { FOOD_SPOTS, type FoodSpot } from "@/lib/dishes"

/**
 * Danh sách điểm ẩm thực từ /api/spots; trong lúc tải hoặc khi lỗi mạng thì dùng danh sách có sẵn.
 * `pin` (admin): lấy cả điểm đang ẩn.
 */
export function useFoodSpots(pin?: string): [FoodSpot[], () => void] {
  const [spots, setSpots] = useState<FoodSpot[]>(FOOD_SPOTS)
  const reload = useCallback(() => {
    fetch("/api/spots", { cache: "no-store", headers: pin ? { "x-admin-pin": pin } : {} })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: FoodSpot[]) => setSpots(s))
      .catch(() => {})
  }, [pin])
  useEffect(reload, [reload])
  return [spots, reload]
}
