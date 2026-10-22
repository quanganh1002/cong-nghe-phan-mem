import { STORAGE, sb, sbFail } from "./orders-db"

/**
 * Online-device tracking. Every open tab sends a heartbeat every few seconds ("I'm still here").
 * A device counts as ONLINE if its last heartbeat is newer than ONLINE_WINDOW_MS.
 * Closing a tab sends a "leave" request, so the number drops right away; if that is lost
 * (phone locked, network gone) the device simply expires after the window.
 *
 * Storage follows orders-db: Supabase table `presence` when configured, otherwise server memory.
 * Supabase table (run once in the SQL editor):
 *   create table presence (device_id text primary key, last_seen timestamptz not null);
 */

export const ONLINE_WINDOW_MS = 25_000

const memory = ((globalThis as { __presence?: Map<string, number> }).__presence ??= new Map<string, number>())

/** Heartbeat: mark this device as seen right now */
export async function touchDevice(id: string): Promise<void> {
  if (STORAGE === "supabase") {
    const res = await sb("presence?on_conflict=device_id", {
      method: "POST",
      body: { device_id: id, last_seen: new Date().toISOString() },
      prefer: "resolution=merge-duplicates",
    })
    if (!res.ok) await sbFail(res, "ghi heartbeat")
    return
  }
  memory.set(id, Date.now())
}

/** Device left (tab closed): remove it immediately */
export async function removeDevice(id: string): Promise<void> {
  if (STORAGE === "supabase") {
    const res = await sb(`presence?device_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" })
    if (!res.ok) await sbFail(res, "xóa thiết bị")
    return
  }
  memory.delete(id)
}

/** THE online number shown on the dashboard: devices with a heartbeat inside the window */
export async function countOnline(): Promise<number> {
  const since = Date.now() - ONLINE_WINDOW_MS
  if (STORAGE === "supabase") {
    const res = await sb(`presence?select=device_id&last_seen=gte.${encodeURIComponent(new Date(since).toISOString())}`)
    if (!res.ok) await sbFail(res, "đếm thiết bị")
    return ((await res.json()) as unknown[]).length
  }
  for (const [id, seen] of memory) if (seen < since) memory.delete(id) // drop expired devices
  return memory.size
}
