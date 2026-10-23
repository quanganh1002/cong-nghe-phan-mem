import { USE_SUPABASE, sb, sbFail } from "./supabase"

/**
 * Theo dõi thiết bị đang online. Mỗi tab đang mở gửi "heartbeat" vài giây một lần ("tôi vẫn đang xem").
 * Thiết bị được tính là ONLINE nếu heartbeat cuối nằm trong ONLINE_WINDOW_MS.
 * Đóng tab sẽ gửi "leave" nên thiết bị biến mất ngay; nếu mất tín hiệu (khóa máy, mất mạng) thì tự hết hạn.
 *
 * Lưu: bảng `presence` trên Supabase nếu đã cấu hình (cần khi chạy trên Vercel), không thì trong bộ nhớ server.
 */

export const ONLINE_WINDOW_MS = 15_000

/** Khách vào web bằng cách nào: quét mã QR (link có ?src=qr) hay mở link thường */
export type Source = "qr" | "link"

export interface OnlineDevice {
  id: string
  lastSeen: string // ISO
  path: string
  source: Source
  /** Ngôn ngữ khách đang chọn (mã LangCode), rỗng nếu chưa biết */
  lang: string
}

interface Entry {
  seen: number
  path: string
  source: Source
  lang: string
  hitPath: string
  hitAt: number
}

const memory = ((globalThis as { __presence?: Map<string, Entry> }).__presence ??= new Map<string, Entry>())

/** Heartbeat: đánh dấu thiết bị vừa xuất hiện. Trả về true nếu `hit` (vừa mở trang) là lượt xem mới chưa tính trùng */
export async function touchDevice(id: string, path: string, source: Source, lang: string, hit: boolean): Promise<boolean> {
  if (USE_SUPABASE) {
    const res = await sb("presence?on_conflict=device_id", {
      method: "POST",
      body: { device_id: id, last_seen: new Date().toISOString(), path, source, lang },
      prefer: "resolution=merge-duplicates",
    })
    if (!res.ok) await sbFail(res, "ghi heartbeat")
    return hit
  }
  const prev = memory.get(id)
  const now = Date.now()
  let counted = false
  const e: Entry = { seen: now, path, source, lang, hitPath: prev?.hitPath ?? "", hitAt: prev?.hitAt ?? 0 }
  // React Strict Mode (dev) gửi hit 2 lần liền nhau: bỏ qua lần trùng trong 3 giây
  if (hit && !(e.hitPath === path && now - e.hitAt < 3000)) {
    e.hitPath = path
    e.hitAt = now
    counted = true
  }
  memory.set(id, e)
  return counted
}

/** Thiết bị rời đi (đóng tab): xóa ngay */
export async function removeDevice(id: string): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb(`presence?device_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" })
    if (!res.ok) await sbFail(res, "xóa thiết bị")
    return
  }
  memory.delete(id)
}

/** Các thiết bị có heartbeat trong khoảng cho phép, mới nhất trước */
export async function listOnline(): Promise<OnlineDevice[]> {
  const since = Date.now() - ONLINE_WINDOW_MS
  if (USE_SUPABASE) {
    const res = await sb(
      `presence?select=device_id,last_seen,path,source,lang&last_seen=gte.${encodeURIComponent(new Date(since).toISOString())}&order=last_seen.desc`,
    )
    if (!res.ok) await sbFail(res, "đếm thiết bị")
    // thỉnh thoảng dọn các dòng đã cũ hơn 1 giờ để bảng không phình ra
    if (Math.random() < 0.03) {
      sb(`presence?last_seen=lt.${encodeURIComponent(new Date(Date.now() - 3600_000).toISOString())}`, { method: "DELETE" }).catch(() => {})
    }
    const rows = (await res.json()) as { device_id: string; last_seen: string; path: string; source: string; lang: string }[]
    return rows.map((r) => ({
      id: r.device_id,
      lastSeen: r.last_seen,
      path: r.path,
      source: r.source === "qr" ? "qr" : "link",
      lang: r.lang ?? "",
    }))
  }
  for (const [id, e] of memory) if (e.seen < since) memory.delete(id)
  return [...memory]
    .sort((a, b) => b[1].seen - a[1].seen)
    .map(([id, e]) => ({ id, lastSeen: new Date(e.seen).toISOString(), path: e.path, source: e.source, lang: e.lang }))
}
