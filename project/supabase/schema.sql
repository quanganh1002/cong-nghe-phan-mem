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

-- Đang nghe món nào, nghe hết bài, nghe bản tóm tắt, mức dùng tính năng phụ (bổ sung sau)
alter table presence add column if not exists listening text not null default '';
alter table visit_days add column if not exists completes int not null default 0;
alter table dish_views add column if not exists plays_short int not null default 0;
alter table dish_views add column if not exists completes int not null default 0;
alter table lang_stats add column if not exists completes int not null default 0;

create table if not exists feature_uses (
  feature text primary key,
  uses int not null default 0
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

-- Bản cũ có 3 tham số: xóa đi để không bị trùng tên với bản có p_short (bản mới vẫn gọi được kiểu cũ nhờ giá trị mặc định)
drop function if exists record_play(date, text, text);

create or replace function record_play(p_day date, p_dish text, p_lang text default '', p_short boolean default false) returns void
language sql as $$
  insert into visit_days (day, plays) values (p_day, 1)
  on conflict (day) do update set plays = visit_days.plays + 1;
  insert into dish_views (dish_id, plays, plays_short) values (p_dish, 1, p_short::int)
  on conflict (dish_id) do update set
    plays = dish_views.plays + 1,
    plays_short = dish_views.plays_short + p_short::int;
  insert into lang_stats (lang, plays) select p_lang, 1 where p_lang <> ''
  on conflict (lang) do update set plays = lang_stats.plays + 1;
$$;

-- Nghe đến hết câu cuối
create or replace function record_complete(p_day date, p_dish text, p_lang text default '') returns void
language sql as $$
  insert into visit_days (day, completes) values (p_day, 1)
  on conflict (day) do update set completes = visit_days.completes + 1;
  insert into dish_views (dish_id, completes) values (p_dish, 1)
  on conflict (dish_id) do update set completes = dish_views.completes + 1;
  insert into lang_stats (lang, completes) select p_lang, 1 where p_lang <> ''
  on conflict (lang) do update set completes = lang_stats.completes + 1;
$$;

-- Đếm mức sử dụng các tính năng phụ ("món ăn gần tôi", từ điển...)
create or replace function record_feature(p_key text) returns void
language sql as $$
  insert into feature_uses (feature, uses) values (p_key, 1)
  on conflict (feature) do update set uses = feature_uses.uses + 1;
$$;

-- Điểm ẩm thực (POI) do admin thêm/sửa/xóa ở /admin/diem-an
create table if not exists food_spots (
  id text primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  dishes text[] not null default '{}'
);

-- Dữ liệu ban đầu (giống FOOD_SPOTS trong lib/dishes.ts); chỉ nạp khi bảng còn trống
insert into food_spots (id, name, lat, lng, dishes)
select * from (values
  ('dong-xuan', 'Chợ Đồng Xuân, Hà Nội', 21.038, 105.849, array['xoi-gac','bun-rieu-cua','thit-dong','nem-ran']),
  ('ta-hien', 'Phố Tạ Hiện, Hà Nội', 21.0352, 105.852, array['bun-dau-mam-tom','nem-ran','bun-cha']),
  ('bac-ha', 'Chợ Bắc Hà, Lào Cai', 22.538, 104.288, array['thang-co']),
  ('dong-ba', 'Chợ Đông Ba, Huế', 16.4695, 107.587, array['bun-bo-hue','banh-beo','nem-lui','banh-bot-loc','me-xung-hue']),
  ('cho-han', 'Chợ Hàn, Đà Nẵng', 16.0679, 108.2245, array['mi-quang','banh-beo','nem-lui']),
  ('cho-con', 'Chợ Cồn, Đà Nẵng', 16.068, 108.214, array['bun-cha-ca','mi-quang','banh-xeo']),
  ('cho-hoi-an', 'Chợ Hội An, Quảng Nam', 15.877, 108.3305, array['cao-lau','com-ga-hoi-an','banh-to-hoi-an','mi-quang']),
  ('cho-da-lat', 'Chợ Đà Lạt, Lâm Đồng', 11.943, 108.437, array['banh-can','ca-phe-sua-da']),
  ('ben-thanh', 'Chợ Bến Thành, TP. Hồ Chí Minh', 10.7725, 106.698, array['banh-mi','com-tam','goi-cuon','che-ba-mau','nuoc-mia','banh-da-lon']),
  ('binh-tay', 'Chợ Bình Tây (Chợ Lớn), TP. Hồ Chí Minh', 10.7497, 106.651, array['hu-tieu-nam-vang','banh-pia','banh-da-lon']),
  ('cai-rang', 'Chợ nổi Cái Răng, Cần Thơ', 10.0007, 105.7486, array['hu-tieu-nam-vang','banh-xeo','canh-chua-ca-loc'])
) as v(id, name, lat, lng, dishes)
where not exists (select 1 from food_spots);

-- Món ăn do admin thêm/sửa/xóa ở /admin/mon-an. data là nội dung món (vùng, loại, emoji, ảnh, chữ vi/en, địa điểm),
-- cùng dạng với kiểu Dish trong lib/dishes.ts trừ id. Bảng trống thì server tự nạp các món có sẵn trong lib/dishes.ts.
create table if not exists dishes (
  id text primary key,
  position int not null default 0,
  data jsonb not null
);

-- Chỉ server (secret key) được truy cập; chặn truy cập công khai bằng anon key
alter table dishes enable row level security;
alter table food_spots enable row level security;
alter table presence enable row level security;
alter table visit_days enable row level security;
alter table dish_views enable row level security;
alter table lang_stats enable row level security;
alter table feature_uses enable row level security;
