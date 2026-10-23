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

-- Thông tin quán (trang admin "Thông tin nhà hàng" sửa, trang quán phía khách đọc)
create table if not exists public.shop_info (
  id         text primary key,
  info       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.shop_info enable row level security;

-- Đánh giá quán (mỗi tài khoản 1 đánh giá / quán, viết lại thì thay bản cũ)
create table if not exists public.reviews (
  shop_id    text not null,
  user_id    text not null,
  name       text not null default '',
  rating     integer not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);
alter table public.reviews enable row level security;

-- Phản hồi của quán cho đánh giá
alter table public.reviews add column if not exists reply text;
alter table public.reviews add column if not exists replied_at timestamptz;

-- Đánh giá món: food_id rỗng = đánh giá quán, có giá trị = đánh giá món đó
alter table public.reviews add column if not exists food_id text not null default '';

-- Mỗi đánh giá có id riêng: khách viết được nhiều đánh giá cho 1 món, chủ đánh giá sửa/xóa theo id
alter table public.reviews add column if not exists id text;
update public.reviews set id = md5(shop_id || '|' || food_id || '|' || user_id || '|' || created_at::text) where id is null;
alter table public.reviews alter column id set not null;
alter table public.reviews add column if not exists edited_at timestamptz;
alter table public.reviews drop constraint if exists reviews_pkey;
alter table public.reviews add primary key (id);
create index if not exists reviews_target_idx on public.reviews (shop_id, food_id, created_at desc);

-- Món ăn do admin thêm/sửa (trang /admin/mon-an). Trùng id với menu gốc trong code thì bản này thắng.
create table if not exists public.foods (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.foods enable row level security;

-- Thiết bị đang online (lib/presence-db.ts): mỗi tab gửi heartbeat, dashboard thống kê đếm
create table if not exists public.presence (
  device_id text primary key,
  last_seen timestamptz not null
);
alter table public.presence add column if not exists path text;
alter table public.presence add column if not exists user_info jsonb;
alter table public.presence enable row level security;

-- Kho ảnh món (công khai để khách xem được). Chỉ server (khóa secret) mới ghi được.
insert into storage.buckets (id, name, public)
values ('foods', 'foods', true)
on conflict (id) do nothing;
