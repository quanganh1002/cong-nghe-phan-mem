/**
 * Nguồn ảnh món ăn lấy từ Wikimedia Commons (giấy phép mở, bắt buộc ghi tác giả + giấy phép).
 * Khóa = id món trong lib/dishes.ts; hiển thị ở trang Giới thiệu. Thêm ảnh mới từ Commons thì thêm một dòng ở đây.
 */
export interface PhotoCredit {
  /** Tác giả (đúng như ghi trên trang ảnh) */
  author: string
  /** Giấy phép, ví dụ "CC BY-SA 4.0" */
  license: string
  /** Trang ảnh trên Commons */
  source: string
}

export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  "banh-beo": { author: "Christopher Crouzet", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_B%C3%A8o,_Da_Nang,_Vietnam.jpg" },
  "banh-bot-loc": { author: "Vietcuongdao", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg" },
  "banh-chung": { author: "TRMC", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Banh_chung_2.JPG" },
  "banh-cuon": { author: "Ser Amantio di Nicolao", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Banh_cuon_nhan_thit_cha_lua,_Banh_Cuon_Thang_Long.jpg" },
  "banh-da-lon": { author: "Biskuit from Atlanta, GA", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_da_l%E1%BB%A3n_s%E1%BA%A7u_ri%C3%AAng.jpg" },
  "banh-dau-xanh": { author: "Hoangkid", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_%C4%91%E1%BA%ADu_xanh.jpg" },
  "banh-pia": { author: "TonySam123", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_p%C3%ADa_new.jpg" },
  "banh-tet": { author: "viviandnguyen_", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Banh_tet.jpg" },
  "banh-to-hoi-an": { author: "Peachyeung316", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:4_mini_Nian_Gao_on_the_table.jpg" },
  "banh-xeo": { author: "Ser Amantio di Nicolao", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_x%C3%A8o_with_pork_sausage_and_shrimp_served_with_various_garnishes.jpg" },
  "bun-bo-hue": { author: "TarnishedPath", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_b%C3%B2_Hu%E1%BA%BF-Feb_2025.jpg" },
  "bun-cha-ca": { author: "Phương Huy (thảo luận)", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_ch%E1%BA%A3_c%C3%A1,_th%C3%A1ng_8_n%C4%83m_2018.JPG" },
  "bun-dau-mam-tom": { author: "trungnguyen299", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m.jpg" },
  "bun-nuoc-leo": { author: "SauceSupreme", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_n%C6%B0%E1%BB%9Bc_l%C3%A8o.jpg" },
  "bun-rieu-cua": { author: "Alpha", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_ri%C3%AAu_cua_n%C6%B0%E1%BB%9Bc.jpg" },
  "bun-thang": { author: "Nguyễn Thanh Quang", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_thang.JPG" },
  "ca-loc-nuong-trui": { author: "Memberofc1", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:C%C3%A1_l%C3%B3c_n%C6%B0%E1%BB%9Bng_trui.JPG" },
  "ca-phe-trung": { author: "travel oriented", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:C%C3%A0_ph%C3%AA_tr%E1%BB%A9ng.jpg" },
  "cao-lau": { author: "Chainwit.", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Cao_l%E1%BA%A7u_H%E1%BB%99i_An_(2024).jpg" },
  "cha-ca-la-vong": { author: "Phương Huy", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng_H%C3%A0_N%E1%BB%99i_th%C3%A1ng_2_n%C4%83m_2018_(2).jpg" },
  "com-hen": { author: "Lucas Jans from USA", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:H%E1%BA%BFn_tr%E1%BB%99n.jpg" },
  "com-lang-vong": { author: "D.Thiên", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Com-lang-vong.jpg" },
  "me-xung-hue": { author: "Seba Della y Sole Bossio", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Caramelo_de_mango_con_s%C3%A9samo_y_man%C3%AD_%C2%B7_Vietnam.jpg" },
  "mi-quang": { author: "Chainwit.", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Mi_Quang_Hoi_An_(2024).jpg" },
  "thang-co": { author: "Alpha", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Th%E1%BA%AFng_c%E1%BB%91.jpg" },
  "thit-kho-trung": { author: "Baoothersks", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg" },
  "tra-sen-tay-ho": { author: "늘피네", license: "CC BY 2.0 kr", source: "https://commons.wikimedia.org/wiki/File:Yeonkkot-cha.jpg" },
  "xoi-gac": { author: "Nguyễn Thanh Quang", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:X%C3%B4i_g%E1%BA%A5c.JPG" },
  "hu-tieu-nam-vang": { author: "SauceSupreme", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang.jpg" },
  "ruou-can": { author: "Genghiskhanviet", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Ruou_can_for_sale.jpg" },
  "banh-it-la-gai": { author: "Lionel Ng from Singapore", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Banh_gai.jpg" },
  "nem-lui": { author: "Baoothersks", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Nem_n%C6%B0%E1%BB%9Bng_by_Baoothersks.jpg" },
  "canh-chua-ca-loc": { author: "Jason Hutchens", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Canhchua2.jpg" },
  "com-ga-hoi-an": { author: "Đông Sơn (thảo luận)", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:C%C6%A1m_g%C3%A0_Tam_K%E1%BB%B3,_Qu%E1%BA%A3ng_Nam.JPG" },
  "banh-can": { author: "Saigon Time", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_c%C4%83n_in_phan_rang,_vietnam.jpg" },
  "banh-troi-banh-chay": { author: "GT#4 - thank you for your support from Singapore", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Transparent_tangyuan_(glutinous_rice_balls,_%E6%B1%A4%E5%9C%86)_-_Flickr_-_GeorgeTan%5E4_-_Thanks_for_your_support.jpg" },
  "thit-dong": { author: "viviandnguyen_ (Flickr)", license: "CC BY-SA 2.0", source: "https://www.flickr.com/photos/11849171@N00/6749932339" },
}
