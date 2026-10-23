import type { NextRequest } from "next/server"
import { shopForPin } from "@/lib/orders-db"
import { listOnline, removeDevice, touchDevice, type PresenceUser } from "@/lib/presence-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST /api/presence  { id, leave?, path?, user? }  — public: a device reports "I'm here" (or "I left").
 * GET  /api/presence                  — admin only (x-admin-pin): { online, devices } = devices online right now.
 */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** Self-declared profile: keep only known short text fields */
function sanitizeUser(raw: unknown): PresenceUser | null {
  if (!raw || typeof raw !== "object") return null
  const u = raw as Record<string, unknown>
  const name = clip(u.name, 80)
  if (!name) return null
  return {
    name,
    username: clip(u.username, 40) || undefined,
    email: clip(u.email, 120) || undefined,
    phone: clip(u.phone, 20) || undefined,
    address: clip(u.address, 200) || undefined,
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; leave?: unknown; path?: unknown; user?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) return Response.json({ error: "bad_id" }, { status: 400 })

  try {
    if (body?.leave) await removeDevice(id)
    else await touchDevice(id, clip(body?.path, 200), sanitizeUser(body?.user))
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}

export async function GET(req: NextRequest) {
  if (!shopForPin(req.headers.get("x-admin-pin"))) return Response.json({ error: "unauthorized" }, { status: 401 })
  try {
    const devices = await listOnline()
    return Response.json({ online: devices.length, devices }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
}
