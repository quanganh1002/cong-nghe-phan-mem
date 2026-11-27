const R_EARTH = 6371008.8 // m

/** Khoảng cách giữa 2 tọa độ [lat, lng] (mét), công thức Haversine */
export function distanceM(a: [number, number], b: [number, number]): number {
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)))
}

export type Overlap = {
  d: number // khoảng cách 2 tâm (m)
  area: number // diện tích phần giao (m²)
  kind: "apart" | "overlap" | "contained" // tách rời / giao một phần / một vòng nằm trọn trong vòng kia
}

/** Diện tích phần giao của 2 hình tròn (m²) */
export function circleOverlap(d: number, r1: number, r2: number): Overlap {
  if (d >= r1 + r2) return { d, area: 0, kind: "apart" }
  if (d <= Math.abs(r1 - r2)) {
    const r = Math.min(r1, r2)
    return { d, area: Math.PI * r * r, kind: "contained" }
  }
  const a1 = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1))
  const a2 = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
  const tri = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2))
  return { d, area: a1 + a2 - tri, kind: "overlap" }
}

export const fmtArea = (m2: number) =>
  m2 >= 10_000 ? `${(m2 / 10_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ha` : `${Math.round(m2).toLocaleString("vi-VN")} m²`
