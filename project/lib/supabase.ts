/**
 * Supabase REST bằng fetch thuần (không dùng SDK). Có đủ SUPABASE_URL + SUPABASE_SECRET_KEY thì
 * số người online và thống kê truy cập lưu trên Supabase (cần khi chạy trên Vercel); không thì lưu trên máy.
 * Tạo bảng bằng supabase/schema.sql.
 */
const URL_ = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "")
const KEY = process.env.SUPABASE_SECRET_KEY ?? ""

export const USE_SUPABASE = Boolean(URL_ && KEY)

export function sb(path: string, opts: { method?: string; body?: unknown; prefer?: string } = {}) {
  return fetch(`${URL_}/rest/v1/${path}`, {
    method: opts.method ?? "GET",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
}

export async function sbFail(res: Response, action: string): Promise<never> {
  throw new Error(`Supabase lỗi khi ${action}: ${res.status} ${(await res.text()).slice(0, 200)}`)
}
