"use client"

import { useEffect, useState } from "react"
import type { FoodRatings } from "@/lib/reviews-db"

/** Điểm trung bình từng món (từ đánh giá của khách). Các thẻ món mount cùng lúc chỉ gọi /api/ratings 1 lần */
let cache: FoodRatings = {}
let pending: Promise<void> | null = null
const listeners = new Set<(r: FoodRatings) => void>()

export function refreshFoodRatings() {
  pending ??= fetch("/api/ratings", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : cache))
    .then((r: FoodRatings) => {
      cache = r
      listeners.forEach((l) => l(r))
    })
    .catch(() => {})
    .finally(() => {
      pending = null
    })
}

export function useFoodRatings() {
  const [ratings, setRatings] = useState(cache)
  useEffect(() => {
    listeners.add(setRatings)
    refreshFoodRatings()
    return () => {
      listeners.delete(setRatings)
    }
  }, [])
  return ratings
}

/** "4.5" hoặc "–" khi món chưa có lượt đánh giá nào */
export const formatRating = (r: FoodRatings[string] | undefined) => (r ? r.avg.toFixed(1) : "–")
