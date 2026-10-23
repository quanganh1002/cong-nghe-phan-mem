-- Chạy một lần trong Supabase → SQL Editor. Chỉ cần khi deploy lên Vercel (hoặc host serverless khác).
-- Chạy ở máy (npm run dev / next start) thì không cần: web tự lưu trong bộ nhớ và file data/visits.json.

-- Thiết bị đang online (mỗi tab đang mở là một dòng, được làm mới vài giây một lần)
create table if not exists presence (
  device_id text primary key,
  last_seen timestamptz not null,
  path text not null default '',
  source text not null default 'link'
);

-- Nếu bảng presence đã có từ phiên bản cũ (thiếu cột) thì bổ sung; chạy lại nhiều lần vẫn an toàn
alter table presence add column if not exists path text not null default '';
alter table presence add column if not exists source text not null default 'link';

-- Lượt truy cập theo ngày (giờ Việt Nam)
create table if not exists visit_days (
  day date primary key,
  visits int not null default 0,
  qr int not null default 0,
  link int not null default 0,
  views int not null default 0
);

-- Lượt xem từng món
create table if not exists dish_views (
  dish_id text primary key,
  views int not null default 0
);

-- Ngôn ngữ và lượt nghe thuyết minh (bổ sung sau; chạy lại nhiều lần vẫn an toàn)
alter table presence add column if not exists lang text not null default '';
alter table visit_days add column if not exists plays int not null default 0;
alter table dish_views add column if not exists plays int not null default 0;

-- Lượt xem trang món và lượt nghe thuyết minh theo ngôn ngữ
create table if not exists lang_stats (
  lang text primary key,
  views int not null default 0,
  plays int not null default 0
);

-- Tăng bộ đếm nguyên tử (tránh mất số khi nhiều người vào cùng lúc)
create or replace function record_visit(p_day date, p_source text) returns void
language sql as $$
  insert into visit_days (day, visits, qr, link)
  values (p_day, 1, (p_source = 'qr')::int, (p_source <> 'qr')::int)
  on conflict (day) do update set
    visits = visit_days.visits + 1,
    qr = visit_days.qr + (p_source = 'qr')::int,
    link = visit_days.link + (p_source <> 'qr')::int;
$$;

-- Bản cũ chỉ có 2 tham số: xóa đi để không bị trùng tên với bản có p_lang
drop function if exists record_dish_view(date, text);

create or replace function record_dish_view(p_day date, p_dish text, p_lang text default '') returns void
language sql as $$
  insert into visit_days (day, views) values (p_day, 1)
  on conflict (day) do update set views = visit_days.views + 1;
  insert into dish_views (dish_id, views) values (p_dish, 1)
  on conflict (dish_id) do update set views = dish_views.views + 1;
  insert into lang_stats (lang, views) select p_lang, 1 where p_lang <> ''
  on conflict (lang) do update set views = lang_stats.views + 1;
$$;

create or replace function record_play(p_day date, p_dish text, p_lang text default '') returns void
language sql as $$
  insert into visit_days (day, plays) values (p_day, 1)
  on conflict (day) do update set plays = visit_days.plays + 1;
  insert into dish_views (dish_id, plays) values (p_dish, 1)
  on conflict (dish_id) do update set plays = dish_views.plays + 1;
  insert into lang_stats (lang, plays) select p_lang, 1 where p_lang <> ''
  on conflict (lang) do update set plays = lang_stats.plays + 1;
$$;

-- Chỉ server (secret key) được truy cập; chặn truy cập công khai bằng anon key
alter table presence enable row level security;
alter table visit_days enable row level security;
alter table dish_views enable row level security;
alter table lang_stats enable row level security;
