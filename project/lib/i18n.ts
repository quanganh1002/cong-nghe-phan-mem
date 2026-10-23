/**
 * Chuỗi giao diện chỉ viết bằng tiếng Việt và tiếng Anh.
 * 8 ngôn ngữ còn lại được dịch tự động từ bản tiếng Anh (xem lib/translate-client.ts).
 */
const vi = {
  appName: "Vị Việt",
  appTagline: "Thuyết minh văn hóa ẩm thực truyền thống Việt Nam",
  navHome: "Trang chủ",
  navDishes: "Món ăn",
  navAbout: "Giới thiệu",

  heroBadge: "Hành trình ẩm thực Việt",
  heroTitle: "Nghe kể chuyện những món ăn truyền thống Việt Nam",
  heroSubtitle:
    "Mỗi món ăn là một câu chuyện về vùng đất, con người và phong tục. Khám phá nguồn gốc, ý nghĩa văn hóa và nghe thuyết minh bằng giọng nói trong 10 ngôn ngữ.",
  startExplore: "Bắt đầu khám phá",
  listen: "Nghe thuyết minh",
  replay: "Nghe lại",
  narrationNote: "Thuyết minh được đọc bằng giọng nói của thiết bị theo ngôn ngữ bạn chọn.",
  notSupported: "Thiết bị của bạn chưa hỗ trợ đọc thuyết minh.",
  translating: "Đang dịch nội dung…",

  searchPlaceholder: "Tìm món ăn: phở, bánh chưng…",
  viewAll: "Xem tất cả",
  featured: "Món ăn tiêu biểu",
  festivalTitle: "Món ăn của ngày Tết & lễ hội",
  byRegion: "Ba miền, ba hương vị",
  related: "Món ăn liên quan",
  noResults: "Không tìm thấy món ăn phù hợp.",
  browseDishes: "Xem tất cả món ăn",
  dishesTitle: "Khám phá món ăn truyền thống",
  dishesCount: "món ăn",

  regionAll: "Tất cả vùng",
  regionNorth: "Miền Bắc",
  regionCentral: "Miền Trung",
  regionSouth: "Miền Nam",
  regionNorthDesc: "Thanh tao, tinh tế, đậm nét ẩm thực Hà Nội xưa và các làng nghề đồng bằng sông Hồng.",
  regionCentralDesc: "Đậm đà, cay nồng, ảnh hưởng của ẩm thực cung đình Huế và thương cảng Hội An.",
  regionSouthDesc: "Phóng khoáng, ngọt ngào, giàu hương vị của sông nước và vựa lúa Đồng bằng sông Cửu Long.",

  catAll: "Tất cả loại",
  catMain: "Món chính",
  catSnack: "Món ăn nhẹ",
  catDrink: "Đồ uống",
  catDessert: "Tráng miệng",
  catFestival: "Lễ hội & Tết",

  sectionOrigin: "Nguồn gốc",
  sectionCulture: "Giá trị văn hóa",
  sectionIngredients: "Nguyên liệu chính",
  sectionTip: "Cách thưởng thức",
  sectionSummary: "Giới thiệu",

  language: "Ngôn ngữ",
  languageTitle: "Chọn ngôn ngữ",
  languageNote: "Nội dung và giọng đọc sẽ chuyển sang ngôn ngữ bạn chọn.",
  back: "Quay lại",

  aboutTitle: "Về dự án",
  aboutP1:
    "Vị Việt là trang web thuyết minh về các món ăn truyền thống và văn hóa ẩm thực Việt Nam, được thực hiện trong khuôn khổ môn Công nghệ phần mềm.",
  aboutP2:
    "Mỗi món ăn được giới thiệu qua nguồn gốc, nguyên liệu, giá trị văn hóa và cách thưởng thức đúng điệu. Du khách và người yêu ẩm thực có thể vừa đọc vừa nghe thuyết minh.",
  aboutP3:
    "Trang hỗ trợ 10 ngôn ngữ phổ biến nhất thế giới. Nội dung gốc bằng tiếng Việt và tiếng Anh, các ngôn ngữ còn lại được dịch tự động nên có thể còn thiếu chính xác.",
  aboutHowTitle: "Cách sử dụng",
  aboutHow1: "Chọn ngôn ngữ ở góc trên bên phải.",
  aboutHow2: "Vào mục Món ăn, lọc theo vùng miền hoặc loại món.",
  aboutHow3: "Mở một món và bấm nút phát để nghe thuyết minh.",
  footer: "Vị Việt · Gìn giữ và lan tỏa văn hóa ẩm thực Việt Nam",
}

export type Dict = Record<keyof typeof vi, string>

const en: Dict = {
  appName: "Vị Việt",
  appTagline: "Narrated guide to traditional Vietnamese food culture",
  navHome: "Home",
  navDishes: "Dishes",
  navAbout: "About",

  heroBadge: "A Vietnamese culinary journey",
  heroTitle: "Hear the stories behind Vietnam's traditional dishes",
  heroSubtitle:
    "Every dish tells a story of a land, its people and their customs. Discover the origins and cultural meaning of each dish and listen to spoken narration in 10 languages.",
  startExplore: "Start exploring",
  listen: "Listen to the narration",
  replay: "Replay",
  narrationNote: "The narration is read aloud by your device in the language you selected.",
  notSupported: "Your device does not support spoken narration.",
  translating: "Translating content…",

  searchPlaceholder: "Search dishes: pho, banh chung…",
  viewAll: "View all",
  featured: "Signature dishes",
  festivalTitle: "Dishes of Tết and festivals",
  byRegion: "Three regions, three flavors",
  related: "Related dishes",
  noResults: "No matching dishes found.",
  browseDishes: "Browse all dishes",
  dishesTitle: "Explore traditional dishes",
  dishesCount: "dishes",

  regionAll: "All regions",
  regionNorth: "North",
  regionCentral: "Central",
  regionSouth: "South",
  regionNorthDesc: "Delicate and refined, shaped by old Hanoi and the craft villages of the Red River Delta.",
  regionCentralDesc: "Bold and spicy, influenced by the imperial cuisine of Huế and the trading port of Hội An.",
  regionSouthDesc: "Generous and sweet, rich with the flavors of the rivers and rice fields of the Mekong Delta.",

  catAll: "All types",
  catMain: "Main dishes",
  catSnack: "Light bites",
  catDrink: "Drinks",
  catDessert: "Desserts",
  catFestival: "Festivals & Tết",

  sectionOrigin: "Origin",
  sectionCulture: "Cultural significance",
  sectionIngredients: "Key ingredients",
  sectionTip: "How to enjoy it",
  sectionSummary: "Introduction",

  language: "Language",
  languageTitle: "Choose a language",
  languageNote: "Content and voice narration switch to the language you pick.",
  back: "Back",

  aboutTitle: "About the project",
  aboutP1:
    "Vị Việt is a website that narrates traditional Vietnamese dishes and food culture, created for a software engineering course.",
  aboutP2:
    "Each dish is introduced through its origin, ingredients, cultural meaning and the proper way to enjoy it. Visitors and food lovers can read and listen at the same time.",
  aboutP3:
    "The site supports the 10 most widely spoken languages. The source content is written in Vietnamese and English; the other languages are machine-translated and may contain inaccuracies.",
  aboutHowTitle: "How to use",
  aboutHow1: "Pick a language at the top right.",
  aboutHow2: "Open Dishes and filter by region or type.",
  aboutHow3: "Open a dish and press play to hear the narration.",
  footer: "Vị Việt · Preserving and sharing Vietnamese food culture",
}

export const DICT_VI: Dict = vi
export const DICT_EN: Dict = en
export const DICT_KEYS = Object.keys(vi) as (keyof Dict)[]
