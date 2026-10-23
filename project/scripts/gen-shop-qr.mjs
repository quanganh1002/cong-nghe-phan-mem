// Usage: node scripts/gen-shop-qr.mjs [baseUrl]   (mặc định https://foodlingo.vercel.app)
// Tạo qr-codes/qr-home.png (trang chủ) và qr-<id món>.png cho từng món trong lib/dishes.ts.
// Link có thêm ?src=qr để trang /admin/thong-ke biết khách vào bằng cách quét QR.
import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import QRCode from "qrcode"

const base = (process.argv[2] ?? "https://foodlingo.vercel.app").replace(/\/+$/, "")
const out = path.join(process.cwd(), "qr-codes")

// Lấy id + tên món từ lib/dishes.ts để món mới tự có QR
const src = await readFile(path.join(process.cwd(), "lib", "dishes.ts"), "utf8")
const dishes = [...src.matchAll(/id:\s*"([a-z0-9-]+)",\s*region:[\s\S]*?vi:\s*\{\s*name:\s*"([^"]+)"/g)].map((m) => ({
  id: m[1],
  name: m[2],
  path: `/dishes/${m[1]}`,
}))

const targets = [{ id: "home", name: "Trang chủ", path: "/" }, ...dishes]

await mkdir(out, { recursive: true })
for (const t of targets) {
  const url = `${base}${t.path}?src=qr`
  const file = path.join(out, `qr-${t.id}.png`)
  await QRCode.toFile(file, url, { width: 800, margin: 2, errorCorrectionLevel: "M", color: { dark: "#2b1a12", light: "#ffffff" } })
  console.log(`${t.name}: ${url} -> ${file}`)
}
