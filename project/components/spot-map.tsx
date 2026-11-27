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
  onSelect,
  selected,
  me,
  meLabel = "",
  color: mainColor = COLOR,
  className,
}: {
  spots: Pick<FoodSpot, "id" | "name" | "at" | "radius" | "hidden">[]
  /** Điểm cần phóng to tới; không có thì vừa khít mọi điểm */
  focus?: [number, number] | null
  onPick?: (at: [number, number]) => void
  /** Bấm vào một điểm (trang người dùng); có thì không mở popup admin */
  onSelect?: (id: string) => void
  /** id điểm đang chọn: viền đậm hơn */
  selected?: string | null
  /** Vị trí người dùng: chấm xanh, tính vào khung nhìn */
  me?: [number, number] | null
  meLabel?: string
  /** Màu vòng tròn của điểm đang hiển thị (mặc định tím của web) */
  color?: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const pick = useRef(onPick)
  pick.current = onPick
  const select = useRef(onSelect)
  select.current = onSelect
  const fitted = useRef("")

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
      const color = s.hidden ? HIDDEN : mainColor
      const r = s.radius ?? SPOT_RADIUS
      const on = s.id === selected
      const circle = L.circle(s.at, {
        radius: r,
        color,
        weight: on ? 4 : 2,
        fillOpacity: on ? 0.3 : 0.15,
        dashArray: s.hidden ? "6 6" : undefined,
      }).addTo(g)
      // chấm tâm để vẫn thấy điểm khi thu nhỏ cả nước
      const dot = L.circleMarker(s.at, { radius: on ? 8 : 6, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
        .bindTooltip(esc(s.name), { permanent: on, direction: "top" })
        .addTo(g)
      // Thu nhỏ cả nước thì vòng bán kính (vài trăm mét) chưa tới 1 pixel: bấm vào điểm thì phóng to vừa khít vùng
      const zoomIn = () => m.fitBounds(circle.getBounds().pad(0.6), { maxZoom: 18 })
      if (select.current) {
        for (const x of [circle, dot]) x.on("click", () => (zoomIn(), select.current?.(s.id)))
      } else {
        const html = `<b>${esc(s.name)}</b><br>Bán kính ${r} m${s.hidden ? "<br><i>Đang ẩn</i>" : ""}`
        for (const x of [circle, dot]) x.bindPopup(html).on("click", zoomIn)
      }
    }
    if (me) L.circleMarker(me, { radius: 7, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).bindTooltip(esc(meLabel)).addTo(g)

    if (focus) m.setView(focus, Math.max(m.getZoom(), 16))
    else {
      // chỉ căn lại khung nhìn khi danh sách điểm hoặc vị trí đổi, không phải mỗi lần chọn điểm
      const key = JSON.stringify([spots.map((s) => s.at), me])
      if (key !== fitted.current && (spots.length || me)) {
        fitted.current = key
        const pts = [...spots.map((s) => s.at), ...(me ? [me] : [])]
        m.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 15 })
      }
    }
  }, [spots, focus, selected, me, meLabel, mainColor])

  // isolation: các lớp của Leaflet có z-index 400–1000, không được đè lên hộp thoại của trang
  return <div ref={box} className={className} style={{ cursor: onPick ? "crosshair" : undefined, isolation: "isolate" }} />
}
