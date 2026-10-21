// Usage: node scripts/gen-shop-qr.mjs [baseUrl]   (default http://192.168.1.5:3000)
// Writes one PNG per shop into qr-codes/, each pointing to <baseUrl>/shop/<id>.
import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import QRCode from "qrcode"

const base = (process.argv[2] ?? "http://192.168.1.5:3000").replace(/\/+$/, "")
const out = path.join(process.cwd(), "qr-codes")

// Read shop ids from lib/shops.ts so new shops are picked up automatically
const src = await readFile(path.join(process.cwd(), "lib", "shops.ts"), "utf8")
const shops = [...src.matchAll(/id:\s*"(\w+)",\s*name:\s*"([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2] }))

await mkdir(out, { recursive: true })
for (const s of shops) {
  const url = `${base}/shop/${s.id}`
  const file = path.join(out, `qr-${s.id}.png`)
  await QRCode.toFile(file, url, { width: 800, margin: 2, errorCorrectionLevel: "M", color: { dark: "#2b1a12", light: "#ffffff" } })
  console.log(`${s.name}: ${url} -> ${file}`)
}
