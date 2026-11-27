"use client"

import { useCallback, useEffect, useState } from "react"
import { FOOD_SPOTS, type FoodSpot } from "@/lib/dishes"

/** Danh sách điểm ẩm thực từ /api/spots; trong lúc tải hoặc khi lỗi mạng thì dùng danh sách có sẵn */
export function useFoodSpots(): [FoodSpot[], () => void] {
  const [spots, setSpots] = useState<FoodSpot[]>(FOOD_SPOTS)
  const reload = useCallback(() => {
    fetch("/api/spots", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: FoodSpot[]) => setSpots(s))
      .catch(() => {})
  }, [])
  useEffect(reload, [reload])
  return [spots, reload]
}
