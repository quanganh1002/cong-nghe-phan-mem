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
 *   alter table presence add column user_info jsonb, add column path text;
 */

export const ONLINE_WINDOW_MS = 15_000

/** Profile a device reports about its logged-in user (self-declared, informational only) */
export interface PresenceUser {
  name: string
  username?: string
  email?: string
  phone?: string
  address?: string
}

export interface OnlineDevice {
  id: string
  lastSeen: string // ISO
  path: string
  user: PresenceUser | null // null = guest
}

interface MemoryEntry {
  seen: number
  path: string
  user: PresenceUser | null
}

const memory = ((globalThis as { __presence?: Map<string, MemoryEntry> }).__presence ??= new Map<string, MemoryEntry>())

/** Heartbeat: mark this device as seen right now */
export async function touchDevice(id: string, path = "", user: PresenceUser | null = null): Promise<void> {
  if (STORAGE === "supabase") {
    const res = await sb("presence?on_conflict=device_id", {
      method: "POST",
      body: { device_id: id, last_seen: new Date().toISOString(), path, user_info: user },
      prefer: "resolution=merge-duplicates",
    })
    if (!res.ok) await sbFail(res, "ghi heartbeat")
    return
  }
  memory.set(id, { seen: Date.now(), path, user })
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

/** Devices with a heartbeat inside the window, newest first */
export async function listOnline(): Promise<OnlineDevice[]> {
  const since = Date.now() - ONLINE_WINDOW_MS
  if (STORAGE === "supabase") {
    const res = await sb(
      `presence?select=device_id,last_seen,path,user_info&last_seen=gte.${encodeURIComponent(new Date(since).toISOString())}&order=last_seen.desc`,
    )
    if (!res.ok) await sbFail(res, "đếm thiết bị")
    const rows = (await res.json()) as { device_id: string; last_seen: string; path: string | null; user_info: PresenceUser | null }[]
    return rows.map((r) => ({ id: r.device_id, lastSeen: r.last_seen, path: r.path ?? "", user: r.user_info ?? null }))
  }
  for (const [id, e] of memory) if (e.seen < since) memory.delete(id) // drop expired devices
  return [...memory]
    .sort((a, b) => b[1].seen - a[1].seen)
    .map(([id, e]) => ({ id, lastSeen: new Date(e.seen).toISOString(), path: e.path, user: e.user }))
}

/** THE online number shown on the dashboard */
export async function countOnline(): Promise<number> {
  return (await listOnline()).length
}
