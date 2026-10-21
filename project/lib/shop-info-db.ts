import { promises as fs } from "fs"
import path from "path"
import { STORAGE, sb, sbFail } from "./orders-db"
import type { ShopId, ShopInfo } from "./shops"

/** Thông tin quán do admin nhập — lưu cùng chỗ với đơn hàng (Supabase bảng shop_info, hoặc file data/shops.json) */

const FILE = path.join(process.cwd(), "data", "shops.json")

async function loadFile(): Promise<Partial<Record<ShopId, ShopInfo>>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"))
  } catch {
    return {}
  }
}

export async function getShopInfo(id: ShopId): Promise<ShopInfo | null> {
  if (STORAGE === "file") return (await loadFile())[id] ?? null
  const res = await sb(`shop_info?select=info&id=eq.${encodeURIComponent(id)}`)
  if (!res.ok) await sbFail(res, "đọc thông tin quán")
  const rows = (await res.json()) as { info: ShopInfo }[]
  return rows[0]?.info ?? null
}

// Ghi file lần lượt để 2 lần lưu cùng lúc không đè nhau
let queue: Promise<unknown> = Promise.resolve()

export async function saveShopInfo(id: ShopId, info: ShopInfo): Promise<void> {
  if (STORAGE === "file") {
    const run = queue.then(async () => {
      const all = await loadFile()
      all[id] = info
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      await fs.writeFile(`${FILE}.tmp`, JSON.stringify(all, null, 2), "utf8")
      await fs.rename(`${FILE}.tmp`, FILE)
    })
    queue = run.catch(() => {})
    return run
  }
  const res = await sb("shop_info", {
    method: "POST",
    body: { id, info, updated_at: new Date().toISOString() },
    prefer: "resolution=merge-duplicates",
  })
  if (!res.ok) await sbFail(res, "lưu thông tin quán")
}
