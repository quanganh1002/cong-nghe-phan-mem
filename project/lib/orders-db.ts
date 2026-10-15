import { promises as fs } from "fs"
import path from "path"

/**
 * "Database" đơn giản: lưu đơn vào file data/orders.json ngay trong project.
 * Chạy trên máy của quán (npm run dev / npm start) là đủ dùng.
 * Lưu ý: đưa lên Vercel thì file sẽ bị mất → khi đó phải đổi sang DB thật (Supabase, Firebase, SQL Server...).
 */

export const ADMIN_PIN = process.env.ADMIN_PIN ?? "1234" // đổi mã PIN trang bếp ở đây (hoặc đặt biến môi trường ADMIN_PIN)

export const STATUSES = ["ordered", "confirmed", "preparing", "delivering", "completed"] as const
export type ShopOrderStatus = (typeof STATUSES)[number]

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
}

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

export function listOrders() {
  return serial(load)
}

export function addOrder(data: Omit<ShopOrder, "id" | "createdAt" | "status">) {
  return serial(async () => {
    const orders = await load()
    // Mã đơn ngắn, dễ đọc cho nhân viên: 4 số cuối thời gian + 2 số ngẫu nhiên
    let id: string
    do {
      id = `${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`
    } while (orders.some((o) => o.id === id))
    const order: ShopOrder = { ...data, id, createdAt: new Date().toISOString(), status: "ordered" }
    orders.push(order)
    await save(orders)
    return order
  })
}

export function updateStatus(id: string, status: ShopOrderStatus) {
  return serial(async () => {
    const orders = await load()
    const order = orders.find((o) => o.id === id)
    if (!order) return null
    order.status = status
    await save(orders)
    return order
  })
}
