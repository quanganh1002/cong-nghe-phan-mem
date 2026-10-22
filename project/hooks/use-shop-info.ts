"use client"

import { useEffect, useState } from "react"
import { fullAddress, getShop, shopState, type ShopInfo } from "@/lib/shops"

/** Thông tin quán để hiển thị cho khách: ưu tiên dữ liệu admin đã nhập, ô nào trống thì dùng dữ liệu mặc định */
export function useShopInfo(id: string | undefined) {
  const shop = getShop(id)
  const [info, setInfo] = useState<ShopInfo | null>(null)

  useEffect(() => {
    if (!shop) return
    let alive = true
    fetch(`/api/shops/${shop.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => alive && setInfo(data))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [shop])

  if (!shop) return null
  return {
    ...shop,
    name: info?.name || shop.name,
    emoji: info?.avatar || shop.emoji,
    city: info?.province || shop.city,
    address: (info && fullAddress(info)) || shop.address,
    phone: info?.phone || shop.phone,
    email: info?.email || "",
    cover: info?.cover,
    description: info?.description || "",
    openTime: info?.openTime || "",
    closeTime: info?.closeTime || "",
    days: info?.days ?? [],
    state: shopState(info),
  }
}
