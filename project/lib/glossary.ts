/**
 * Từ điển món ăn: các từ thường gặp trong ẩm thực Việt. Tên gọi giữ nguyên tiếng Việt (có nút nghe phát âm),
 * phần nghĩa viết tay bằng tiếng Việt và tiếng Anh; 8 ngôn ngữ còn lại dịch từ bản tiếng Anh như nội dung món ăn.
 */
export interface GlossaryTerm {
  id: string
  /** Từ tiếng Việt, đọc bằng giọng Việt */
  term: string
  vi: { name: string; desc: string }
  en: { name: string; desc: string }
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "nuoc-mam",
    term: "nước mắm",
    vi: { name: "Nước mắm", desc: "Nước chấm làm từ cá (thường là cá cơm) ủ muối nhiều tháng. Gia vị cốt lõi của bếp Việt, dùng để chấm, nêm và pha nước sốt." },
    en: { name: "Fish sauce", desc: "A sauce made by fermenting fish, usually anchovies, with salt for several months. The backbone of Vietnamese cooking, used for dipping, seasoning and sauces." },
  },
  {
    id: "mam-tom",
    term: "mắm tôm",
    vi: { name: "Mắm tôm", desc: "Tôm nhỏ xay nhuyễn, muối và ủ lên men. Có mùi rất nồng, thường được đánh với chanh, đường, ớt để chấm bún đậu hay bún riêu." },
    en: { name: "Fermented shrimp paste", desc: "Tiny shrimp ground, salted and fermented. It has a very strong smell and is usually whipped with lime, sugar and chili as a dip for dishes like bún đậu." },
  },
  {
    id: "bun",
    term: "bún",
    vi: { name: "Bún", desc: "Sợi gạo tròn, trắng, làm từ gạo lên men. Ăn trong nước dùng như bún bò Huế hoặc ăn nguội với thịt nướng như bún chả." },
    en: { name: "Rice vermicelli", desc: "Round, white noodles made from fermented rice. Eaten in broth, as in bún bò Huế, or cold with grilled meat, as in bún chả." },
  },
  {
    id: "banh-pho",
    term: "bánh phở",
    vi: { name: "Bánh phở", desc: "Sợi gạo dẹt, mềm, tráng từ bột gạo. Là phần ruột của món phở." },
    en: { name: "Flat rice noodles", desc: "Soft, flat noodles made from rice batter. They are the heart of a bowl of phở." },
  },
  {
    id: "banh-trang",
    term: "bánh tráng",
    vi: { name: "Bánh tráng", desc: "Lá bánh mỏng tráng từ bột gạo rồi phơi nắng. Dùng để cuốn gỏi cuốn, chả giò, hoặc nướng ăn vặt." },
    en: { name: "Rice paper", desc: "Thin sheets of rice dough dried in the sun. Used to wrap fresh rolls and fried spring rolls, or grilled as a snack." },
  },
  {
    id: "rau-thom",
    term: "rau thơm",
    vi: { name: "Rau thơm", desc: "Các loại rau gia vị ăn sống như húng quế, kinh giới, tía tô, ngò gai, rau răm. Hầu như món nào cũng có đĩa rau ăn kèm." },
    en: { name: "Fresh herbs", desc: "Herbs eaten raw, such as Thai basil, perilla, mint, sawtooth coriander and Vietnamese coriander. Almost every meal comes with a plate of them." },
  },
  {
    id: "nuoc-dung",
    term: "nước dùng",
    vi: { name: "Nước dùng", desc: "Nước hầm từ xương, hành, gia vị trong nhiều giờ. Được xem là linh hồn của phở và các món bún nước." },
    en: { name: "Broth", desc: "A stock simmered for hours from bones, onions and spices. It is considered the soul of phở and other noodle soups." },
  },
  {
    id: "cha",
    term: "chả",
    vi: { name: "Chả", desc: "Thịt hoặc cá giã nhuyễn, tẩm gia vị rồi chiên, nướng hoặc hấp. Ví dụ chả lụa, chả cá, chả nướng." },
    en: { name: "Chả (pounded meat or fish patty)", desc: "Meat or fish pounded to a paste, seasoned, then fried, grilled or steamed. Examples are chả lụa, chả cá and grilled chả." },
  },
  {
    id: "nem",
    term: "nem",
    vi: { name: "Nem", desc: "Tên gọi khác nhau tùy vùng: ở miền Bắc, nem rán là món cuốn chiên giòn (miền Nam gọi là chả giò); nem còn chỉ các loại thịt lên men như nem chua." },
    en: { name: "Nem", desc: "The meaning changes by region: in the North, nem rán is the fried roll (called chả giò in the South), and nem can also mean fermented meats such as nem chua." },
  },
  {
    id: "xoi",
    term: "xôi",
    vi: { name: "Xôi", desc: "Gạo nếp đồ chín, ăn với đậu xanh, lạc, ngô, hành phi hoặc nhuộm màu từ gấc. Món sáng quen thuộc và cũng là món cúng." },
    en: { name: "Sticky rice (xôi)", desc: "Steamed glutinous rice eaten with mung beans, peanuts, corn or fried shallots, or colored with gấc fruit. A common breakfast and an offering at ceremonies." },
  },
  {
    id: "che",
    term: "chè",
    vi: { name: "Chè", desc: "Món ngọt nấu từ đậu, gạo nếp, trái cây hoặc nước cốt dừa, ăn nóng hoặc lạnh như một món tráng miệng." },
    en: { name: "Chè (sweet dessert soup)", desc: "A sweet dish made from beans, glutinous rice, fruit or coconut milk, served hot or cold as a dessert." },
  },
  {
    id: "gao-nep",
    term: "gạo nếp",
    vi: { name: "Gạo nếp", desc: "Loại gạo dẻo và dính khi nấu chín. Nguyên liệu chính của xôi, bánh chưng và nhiều loại bánh ngày lễ." },
    en: { name: "Glutinous rice", desc: "A rice that turns soft and sticky when cooked. The main ingredient of xôi, bánh chưng and many festival cakes." },
  },
  {
    id: "la-dong",
    term: "lá dong",
    vi: { name: "Lá dong", desc: "Lá to, xanh đậm dùng gói bánh chưng, cho bánh màu xanh và mùi thơm đặc trưng." },
    en: { name: "Dong leaves", desc: "Large, dark green leaves used to wrap bánh chưng, giving the cake its green color and distinct fragrance." },
  },
  {
    id: "nuoc-cot-dua",
    term: "nước cốt dừa",
    vi: { name: "Nước cốt dừa", desc: "Phần nước béo vắt từ cùi dừa nạo. Dùng trong chè, bánh và các món cà ri, đặc biệt phổ biến ở miền Nam." },
    en: { name: "Coconut cream", desc: "The rich liquid squeezed from grated coconut flesh. Used in chè, cakes and curries, especially in the South." },
  },
  {
    id: "hanh-phi",
    term: "hành phi",
    vi: { name: "Hành phi", desc: "Hành khô thái lát mỏng chiên vàng giòn. Rắc lên xôi, cháo, bún để tăng mùi thơm." },
    en: { name: "Fried shallots", desc: "Thinly sliced shallots fried until golden and crisp. Sprinkled over sticky rice, porridge and noodles for aroma." },
  },
  {
    id: "banh",
    term: "bánh",
    vi: { name: "Bánh", desc: "Từ chung chỉ các món làm từ bột hoặc gạo như bánh cuốn, bánh xèo, bánh chưng. Có thể hấp, chiên, nướng, mặn hoặc ngọt." },
    en: { name: "Bánh (cake, bun or dumpling)", desc: "A broad word for foods made from flour or rice, such as bánh cuốn, bánh xèo and bánh chưng. They can be steamed, fried or baked, savory or sweet." },
  },
  {
    id: "phin",
    term: "phin",
    vi: { name: "Phin cà phê", desc: "Dụng cụ lọc nhỏ bằng kim loại đặt trên ly. Cà phê nhỏ giọt chậm cho vị đậm, thường uống với sữa đặc." },
    en: { name: "Phin (coffee filter)", desc: "A small metal drip filter set on top of a cup. The slow drip gives a strong coffee, often drunk with condensed milk." },
  },
  {
    id: "chay",
    term: "chay",
    vi: { name: "Ăn chay", desc: "Nấu và ăn không dùng thịt, cá, kể cả nước mắm. Nhiều người ăn chay vào ngày mùng một và ngày rằm âm lịch." },
    en: { name: "Vegetarian (chay)", desc: "Cooking and eating without meat or fish, including fish sauce. Many people eat chay on the first and fifteenth days of the lunar month." },
  },
]
