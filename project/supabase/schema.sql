-- Bảng lưu đơn hàng cho FoodLingo.
-- Cách dùng: Supabase → SQL Editor → New query → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần cũng không sao (đã có bảng thì chỉ cập nhật phần còn thiếu).

create table if not exists public.orders (
  id            text primary key,
  created_at    timestamptz not null default now(),
  status        text not null default 'ordered',
  table_no      text,
  name          text not null default '',
  phone         text not null default '',
  address       text not null default '',
  note          text not null default '',
  payment       text not null default '',
  transfer_note text not null default '',
  items         jsonb not null default '[]'::jsonb,
  total         integer not null default 0
);

-- Lý do quán từ chối đơn
alter table public.orders add column if not exists cancel_reason text;

-- Các trạng thái hợp lệ (có thêm 'cancelled' = quán từ chối)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('ordered', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'));

create index if not exists orders_created_at_idx on public.orders (created_at);

-- Bật RLS và KHÔNG tạo policy nào: người ngoài (khóa public/anon) không đọc được bảng.
-- Chỉ server của web (dùng khóa secret) mới đọc/ghi được.
alter table public.orders enable row level security;
