import type { NextRequest } from "next/server"
import { shopForPin } from "@/lib/orders-db"
import { countOnline, removeDevice, touchDevice } from "@/lib/presence-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * POST /api/presence  { id, leave? }  — public: a device reports "I'm here" (or "I left").
 * GET  /api/presence                  — admin only (x-admin-pin): { online } = devices online right now.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; leave?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) return Response.json({ error: "bad_id" }, { status: 400 })

  try {
    if (body?.leave) await removeDevice(id)
    else await touchDevice(id)
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}

export async function GET(req: NextRequest) {
  if (!shopForPin(req.headers.get("x-admin-pin"))) return Response.json({ error: "unauthorized" }, { status: 401 })
  try {
    return Response.json({ online: await countOnline() }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ error: "server" }, { status: 500 })
  }
}
