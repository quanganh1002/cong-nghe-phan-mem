import { promises as fs } from "fs"
import path from "path"

/**
 * Nơi lưu đơn hàng — tự chọn 1 trong 2:
 *
 *  1) SUPABASE (khi đã đặt biến môi trường SUPABASE_URL + SUPABASE_SECRET_KEY)
 *     → dùng khi đưa web lên Vercel. Mọi máy, mọi điện thoại dùng chung 1 danh sách đơn.
 *
 *  2) FILE data/orders.json (khi KHÔNG có 2 biến trên)
 *     → chạy thử trên máy cá nhân, không cần cài đặt gì thêm.
 *
 * Không cần cài thêm thư viện: nói chuyện với Supabase qua REST API bằng fetch.
 */

export const ADMIN_PIN = process.env.ADMIN_PIN || "1234" // đổi PIN: đặt biến môi trường ADMIN_PIN (trên Vercel) hoặc sửa số ở đây

export const STATUSES = ["ordered", "confirmed", "preparing", "delivering", "completed", "cancelled"] as const
export type ShopOrderStatus = (typeof STATUSES)[number]

/** Đơn đã kết thúc (hoàn thành hoặc bị từ chối) thì không đổi trạng thái được nữa */
export const FINAL_STATUSES: readonly ShopOrderStatus[] = ["completed", "cancelled"]

/** Kết quả đổi trạng thái */
export type UpdateResult = { order: ShopOrder } | { error: "not_found" | "locked" }

/** Trạng thái + lý do từ chối (nếu có) — thứ duy nhất khách được xem */
export type StatusInfo = { status: ShopOrderStatus; reason?: string }

export type ShopOrderItem = { foodId: string; quantity: number; unitPrice: number }

export type ShopOrder = {
  id: string
  createdAt: string
  status: ShopOrderStatus
  table: string | null
  name: string
  phone: string
  address: string
  note: string
  payment: string
  transferNote: string
  items: ShopOrderItem[]
  total: number
  /** Lý do quán từ chối đơn (chỉ có khi status = "cancelled") */
  cancelReason?: string
}

type NewOrder = Omit<ShopOrder, "id" | "createdAt" | "status" | "cancelReason">

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").trim().replace(/\/+$/, "")
const SUPABASE_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()

/** "supabase" hoặc "file" — để biết web đang lưu đơn ở đâu */
export const STORAGE: "supabase" | "file" = SUPABASE_URL && SUPABASE_KEY ? "supabase" : "file"

/** Mã đơn 6 chữ số, dễ đọc cho nhân viên */
const newId = () => String(Math.floor(100000 + Math.random() * 900000))

const toInfo = (status: ShopOrderStatus, reason?: string | null): StatusInfo =>
  status === "cancelled" && reason ? { status, reason } : { status }

/* ================================================================== */
/* 1) SUPABASE                                                         */
/* ================================================================== */

type Row = {
  id: string
  created_at: string
  status: ShopOrderStatus
  table_no: string | null
  name: string
  phone: string
  address: string
  note: string
  payment: string
  transfer_note: string
  items: ShopOrderItem[]
  total: number
  cancel_reason?: string | null
}

const toOrder = (r: Row): ShopOrder => ({
  id: r.id,
  createdAt: new Date(r.created_at).toISOString(),
  status: r.status,
  table: r.table_no,
  name: r.name ?? "",
  phone: r.phone ?? "",
  address: r.address ?? "",
  note: r.note ?? "",
  payment: r.payment ?? "",
  transferNote: r.transfer_note ?? "",
  items: Array.isArray(r.items) ? r.items : [],
  total: Number(r.total) || 0,
  ...(r.cancel_reason ? { cancelReason: r.cancel_reason } : {}),
})

async function sb(query: string, init: { method?: string; body?: unknown; prefer?: string } = {}) {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY, "Content-Type": "application/json" }
  // Khóa kiểu cũ (service_role, dạng JWT) cần thêm Authorization; khóa mới "sb_secret_..." thì chỉ cần apikey
  if (!SUPABASE_KEY.startsWith("sb_")) headers.Authorization = `Bearer ${SUPABASE_KEY}`
  if (init.prefer) headers.Prefer = init.prefer

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })
  return res
}

async function sbFail(res: Response, what: string): Promise<never> {
  const detail = await res.text().catch(() => "")
  throw new Error(`Supabase ${what} lỗi ${res.status}: ${detail.slice(0, 300)}`)
}

const sbStore = {
  async list(): Promise<ShopOrder[]> {
    // Supabase trả tối đa 1000 dòng mỗi lần → lấy theo từng trang
    const all: ShopOrder[] = []
    for (let offset = 0; ; offset += 1000) {
      const res = await sb(`orders?select=*&order=created_at.asc&limit=1000&offset=${offset}`)
      if (!res.ok) await sbFail(res, "đọc đơn")
      const rows = (await res.json()) as Row[]
      all.push(...rows.map(toOrder))
      if (rows.length < 1000) return all
    }
  },

  async add(data: NewOrder): Promise<ShopOrder> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const row = {
        id: newId(),
        created_at: new Date().toISOString(),
        status: "ordered",
        table_no: data.table,
        name: data.name,
        phone: data.phone,
        address: data.address,
        note: data.note,
        payment: data.payment,
        transfer_note: data.transferNote,
        items: data.items,
        total: data.total,
      }
      const res = await sb("orders", { method: "POST", body: row, prefer: "return=representation" })
      if (res.status === 409) continue // trùng mã đơn (rất hiếm) → tạo mã khác
      if (!res.ok) await sbFail(res, "thêm đơn")
      const [saved] = (await res.json()) as Row[]
      return toOrder(saved)
    }
    throw new Error("Không tạo được mã đơn mới, thử lại")
  },

  async update(id: string, status: ShopOrderStatus, reason = ""): Promise<UpdateResult> {
    // Chỉ sửa đơn chưa kết thúc (chưa hoàn thành, chưa bị từ chối)
    const res = await sb(`orders?id=eq.${encodeURIComponent(id)}&status=not.in.(${FINAL_STATUSES.join(",")})`, {
      method: "PATCH",
      body: { status, cancel_reason: status === "cancelled" ? reason : null },
      prefer: "return=representation",
    })
    if (!res.ok) await sbFail(res, "cập nhật đơn")
    const rows = (await res.json()) as Row[]
    if (rows[0]) return { order: toOrder(rows[0]) }
    // Không sửa được: hoặc không có đơn, hoặc đơn đã kết thúc
    const check = await sb(`orders?select=id&id=eq.${encodeURIComponent(id)}`)
    if (!check.ok) await sbFail(check, "kiểm tra đơn")
    return ((await check.json()) as unknown[]).length ? { error: "locked" } : { error: "not_found" }
  },

  async statuses(ids: string[]): Promise<Record<string, StatusInfo>> {
    const safe = ids.filter((id) => /^\d{1,12}$/.test(id))
    if (safe.length === 0) return {}
    const res = await sb(`orders?select=id,status,cancel_reason&id=in.(${safe.join(",")})`)
    if (!res.ok) await sbFail(res, "đọc trạng thái")
    const rows = (await res.json()) as { id: string; status: ShopOrderStatus; cancel_reason?: string | null }[]
    return Object.fromEntries(rows.map((r) => [r.id, toInfo(r.status, r.cancel_reason)]))
  },
}

/* ================================================================== */
/* 2) FILE data/orders.json (chạy trên máy cá nhân)                     */
/* ================================================================== */

const FILE = path.join(process.cwd(), "data", "orders.json")

// Ghi file lần lượt từng lệnh một để 2 khách đặt cùng lúc không đè mất đơn của nhau
let queue: Promise<unknown> = Promise.resolve()
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.catch(() => {})
  return run
}

async function load(): Promise<ShopOrder[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as ShopOrder[]
  } catch {
    return []
  }
}

async function save(orders: ShopOrder[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  const tmp = `${FILE}.tmp`
  await fs.writeFile(tmp, JSON.stringify(orders, null, 2), "utf8")
  await fs.rename(tmp, FILE)
}

const fileStore = {
  list: () => serial(load),

  add: (data: NewOrder) =>
    serial(async () => {
      const orders = await load()
      let id: string
      do id = newId()
      while (orders.some((o) => o.id === id))
      const order: ShopOrder = { ...data, id, createdAt: new Date().toISOString(), status: "ordered" }
      orders.push(order)
      await save(orders)
      return order
    }),

  update: (id: string, status: ShopOrderStatus, reason = "") =>
    serial(async (): Promise<UpdateResult> => {
      const orders = await load()
      const order = orders.find((o) => o.id === id)
      if (!order) return { error: "not_found" }
      if (FINAL_STATUSES.includes(order.status)) return { error: "locked" }
      order.status = status
      if (status === "cancelled") order.cancelReason = reason
      else delete order.cancelReason
      await save(orders)
      return { order }
    }),

  statuses: async (ids: string[]) => {
    const wanted = new Set(ids)
    const result: Record<string, StatusInfo> = {}
    for (const o of await serial(load)) if (wanted.has(o.id)) result[o.id] = toInfo(o.status, o.cancelReason)
    return result
  },
}

/* ================================================================== */
/* Các hàm các trang/API gọi tới (giữ nguyên tên như trước)             */
/* ================================================================== */

const store = STORAGE === "supabase" ? sbStore : fileStore

/** Toàn bộ đơn, cũ → mới */
export function listOrders(): Promise<ShopOrder[]> {
  return store.list()
}

export function addOrder(data: NewOrder): Promise<ShopOrder> {
  return store.add(data)
}

/** Đổi trạng thái đơn. Từ chối thì kèm lý do. Đơn đã hoàn thành / đã từ chối thì không đổi được nữa. */
export function updateStatus(id: string, status: ShopOrderStatus, reason = ""): Promise<UpdateResult> {
  return store.update(id, status, reason)
}

/** Chỉ trạng thái (+ lý do từ chối) của vài đơn — cho phía khách xem */
export function getStatuses(ids: string[]): Promise<Record<string, StatusInfo>> {
  return store.statuses(ids)
}
