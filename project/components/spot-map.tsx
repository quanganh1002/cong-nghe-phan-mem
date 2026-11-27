"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { SPOT_RADIUS, type FoodSpot } from "@/lib/dishes"

const COLOR = "#6d4aff"
const HIDDEN = "#9ca3af"
const VIETNAM: L.LatLngBoundsExpression = [
  [8.4, 102.1],
  [23.4, 109.5],
]

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/**
 * Bản đồ Leaflet (nền OpenStreetMap) vẽ mỗi điểm là một vòng tròn theo bán kính.
 * `onPick`: bấm lên bản đồ để chọn tọa độ (form thêm/sửa). Chỉ chạy ở trình duyệt: nạp bằng next/dynamic, ssr: false.
 */
export default function SpotMap({
  spots,
  focus,
  onPick,
  className,
}: {
  spots: Pick<FoodSpot, "id" | "name" | "at" | "radius" | "hidden">[]
  /** Điểm cần phóng to tới; không có thì vừa khít mọi điểm */
  focus?: [number, number] | null
  onPick?: (at: [number, number]) => void
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const pick = useRef(onPick)
  pick.current = onPick

  useEffect(() => {
    const m = L.map(box.current!, { scrollWheelZoom: true }).fitBounds(VIETNAM)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    m.on("click", (e) => pick.current?.([+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)]))
    layer.current = L.layerGroup().addTo(m)
    map.current = m
    // khung chứa đổi kích thước (đổi tab, mở hộp thoại) thì vẽ lại cho đủ ô bản đồ
    const ro = new ResizeObserver(() => m.invalidateSize())
    ro.observe(box.current!)
    return () => {
      ro.disconnect()
      m.remove()
    }
  }, [])

  useEffect(() => {
    const m = map.current!
    const g = layer.current!
    g.clearLayers()
    for (const s of spots) {
      const color = s.hidden ? HIDDEN : COLOR
      const r = s.radius ?? SPOT_RADIUS
      L.circle(s.at, { radius: r, color, weight: 2, fillOpacity: 0.15, dashArray: s.hidden ? "6 6" : undefined })
        .bindPopup(`<b>${esc(s.name)}</b><br>Bán kính ${r} m${s.hidden ? "<br><i>Đang ẩn</i>" : ""}`)
        .addTo(g)
      // chấm tâm để vẫn thấy điểm khi thu nhỏ cả nước
      L.circleMarker(s.at, { radius: 5, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
        .bindTooltip(esc(s.name))
        .addTo(g)
    }
    if (focus) m.setView(focus, Math.max(m.getZoom(), 16))
    else if (spots.length) m.fitBounds(L.latLngBounds(spots.map((s) => s.at)).pad(0.15), { maxZoom: 15 })
  }, [spots, focus])

  // isolation: các lớp của Leaflet có z-index 400–1000, không được đè lên hộp thoại của trang
  return <div ref={box} className={className} style={{ cursor: onPick ? "crosshair" : undefined, isolation: "isolate" }} />
}
