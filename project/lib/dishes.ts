export type Region = "north" | "central" | "south"
export type DishCategory = "main" | "snack" | "drink" | "dessert" | "festival"

export interface DishText {
  name: string
  /** Giới thiệu ngắn */
  summary: string
  /** Nguồn gốc, lịch sử */
  origin: string
  /** Giá trị văn hóa, phong tục */
  culture: string
  /** Nguyên liệu, phân cách bằng dấu phẩy */
  ingredients: string
  /** Cách thưởng thức */
  tip: string
}

export interface Dish {
  id: string
  region: Region
  category: DishCategory
  /** Ảnh trong public/foods; không có thì hiện emoji trên nền màu */
  image?: string
  emoji: string
  popular?: boolean
  vi: DishText
  en: DishText
}

export const REGIONS: Region[] = ["north", "central", "south"]
export const CATEGORIES: { key: DishCategory; icon: string }[] = [
  { key: "main", icon: "🍜" },
  { key: "snack", icon: "🥢" },
  { key: "drink", icon: "☕" },
  { key: "dessert", icon: "🍧" },
  { key: "festival", icon: "🎋" },
]

export const DISHES: Dish[] = [
  {
    id: "pho-bo",
    region: "north",
    category: "main",
    image: "/foods/pho-bo.png",
    emoji: "🍜",
    popular: true,
    vi: {
      name: "Phở bò",
      summary:
        "Phở bò là món ăn được xem như biểu tượng của ẩm thực Việt Nam: sợi bánh phở mềm, thịt bò thái mỏng và nước dùng trong, thơm mùi quế, hồi, gừng nướng.",
      origin:
        "Phở xuất hiện vào đầu thế kỷ hai mươi ở miền Bắc, quanh Nam Định và Hà Nội. Ban đầu người bán rong gánh phở đi khắp phố phường, về sau phở theo bước chân người Bắc vào Nam và ra thế giới.",
      culture:
        "Với người Hà Nội, một bát phở ngon cần nước dùng ninh từ xương bò suốt nhiều giờ, ngọt thanh mà không gắt. Phở là bữa sáng quen thuộc, là món để đãi khách và là niềm tự hào mà người Việt xa xứ luôn nhớ về.",
      ingredients: "Bánh phở, thịt bò, xương ống bò, hành tây nướng, gừng nướng, quế, hồi, thảo quả, hành lá, rau thơm",
      tip: "Nếm nước dùng trước khi cho gia vị. Vắt chút chanh, thêm vài lát ớt, hành giấm rồi ăn nóng ngay để giữ trọn vị.",
    },
    en: {
      name: "Beef Pho",
      summary:
        "Beef pho is often seen as the symbol of Vietnamese cuisine: soft rice noodles, thin slices of beef and a clear broth scented with cinnamon, star anise and charred ginger.",
      origin:
        "Pho appeared in the early twentieth century in northern Vietnam, around Nam Định and Hanoi. At first vendors carried it through the streets on shoulder poles; later it travelled south with northerners and then around the world.",
      culture:
        "For Hanoians, a good bowl needs a broth simmered from beef bones for many hours, sweet and gentle rather than harsh. Pho is a familiar breakfast, a dish for welcoming guests and a taste that overseas Vietnamese never stop missing.",
      ingredients: "Rice noodles, beef, beef marrow bones, charred onion, charred ginger, cinnamon, star anise, cardamom, scallions, fresh herbs",
      tip: "Taste the broth before adding anything. Then add a squeeze of lime, a few slices of chili and pickled onion, and eat it piping hot.",
    },
  },
  {
    id: "bun-cha",
    region: "north",
    category: "main",
    image: "/foods/bun-cha.png",
    emoji: "🍖",
    popular: true,
    vi: {
      name: "Bún chả",
      summary:
        "Bún chả gồm chả thịt heo nướng than hoa thơm lừng, thả trong bát nước chấm chua ngọt cùng đu đủ xanh, ăn kèm bún tươi và rau sống.",
      origin:
        "Bún chả là món đặc trưng của Hà Nội, gắn với những quán nhỏ nướng chả trên bếp than ngay vỉa hè khu phố cổ. Thực khách xa gần thường lần theo mùi khói thơm mà tìm đến quán.",
      culture:
        "Món ăn thể hiện sự tinh tế trong cách pha nước chấm của người Hà Nội, cân bằng vị chua, ngọt, mặn và cay. Bún chả thường là bữa trưa của dân văn phòng, đồng thời là món được nhiều du khách quốc tế nhắc tới khi đến thủ đô.",
      ingredients: "Thịt ba chỉ, thịt nạc vai, bún, nước mắm, đường, giấm, tỏi, ớt, đu đủ xanh, cà rốt, rau thơm",
      tip: "Gắp bún và rau cho vào bát nước chấm cùng chả, ăn kèm nem rán nếu có. Hãy ăn khi chả còn nóng để cảm nhận mùi khói than.",
    },
    en: {
      name: "Bún chả",
      summary:
        "Bún chả is made of fragrant charcoal-grilled pork patties and slices, served in a sweet-sour dipping broth with green papaya, alongside fresh rice vermicelli and herbs.",
      origin:
        "Bún chả is a signature dish of Hanoi, tied to small stalls grilling pork over charcoal right on the pavements of the Old Quarter. Hungry diners often follow the smoky aroma to find them.",
      culture:
        "The dish shows the Hanoian skill of balancing sour, sweet, salty and spicy in the dipping sauce. It is a classic office-worker lunch, and many international visitors remember it as a highlight of the capital.",
      ingredients: "Pork belly, lean pork shoulder, rice vermicelli, fish sauce, sugar, vinegar, garlic, chili, green papaya, carrot, herbs",
      tip: "Dip the noodles and herbs together with the pork in the sauce, and add a fried spring roll if you like. Eat while the pork is hot to catch the charcoal smoke.",
    },
  },
  {
    id: "nem-ran",
    region: "north",
    category: "snack",
    image: "/foods/nem-ran.png",
    emoji: "🥟",
    vi: {
      name: "Nem rán (chả giò)",
      summary:
        "Nem rán là những cuốn nhỏ vỏ vàng giòn, nhân thịt heo, miến, mộc nhĩ và cà rốt, chiên trong dầu nóng rồi chấm nước mắm chua ngọt.",
      origin:
        "Món nem rán phổ biến ở miền Bắc, còn miền Nam gọi là chả giò. Vỏ được làm từ bánh đa nem, một loại bánh tráng mỏng, sau khi chiên sẽ nổi những bọt nhỏ li ti rất đẹp mắt.",
      culture:
        "Nem rán có mặt trong mâm cỗ ngày Tết, đám cưới và giỗ chạp, tượng trưng cho sự sum vầy, đủ đầy. Việc cả nhà ngồi cuốn nem cùng nhau cũng là một nét sinh hoạt ấm áp của người Việt.",
      ingredients: "Thịt heo xay, miến, mộc nhĩ, nấm hương, cà rốt, hành khô, trứng, bánh đa nem",
      tip: "Ăn khi còn nóng giòn, cuốn cùng rau xà lách, rau thơm rồi chấm nước mắm pha chua ngọt.",
    },
    en: {
      name: "Fried Spring Rolls (Nem rán)",
      summary:
        "Nem rán are small golden crispy rolls filled with pork, glass noodles, wood-ear mushrooms and carrot, deep-fried and dipped in sweet-sour fish sauce.",
      origin:
        "Nem rán is popular in the north, while southerners call it chả giò. The wrapper is bánh đa nem, a thin rice sheet that blisters into a delicate bubbly pattern when fried.",
      culture:
        "Nem rán appears on Tết, wedding and ancestral banquet trays, symbolizing togetherness and abundance. Rolling them together as a family is itself a warm Vietnamese tradition.",
      ingredients: "Ground pork, glass noodles, wood-ear mushrooms, shiitake, carrot, shallots, egg, rice paper",
      tip: "Eat them hot and crunchy, wrapped in lettuce with fresh herbs, then dipped in sweet-sour fish sauce.",
    },
  },
  {
    id: "banh-cuon",
    region: "north",
    category: "snack",
    image: "/foods/banh-cuon.jpg",
    emoji: "🫓",
    vi: {
      name: "Bánh cuốn",
      summary:
        "Bánh cuốn là lớp bánh gạo mỏng như tờ giấy, tráng bằng hơi nước, cuốn nhân thịt heo và mộc nhĩ, ăn kèm chả quế và nước chấm.",
      origin:
        "Bánh cuốn nổi tiếng ở miền Bắc, đặc biệt là làng Thanh Trì (Hà Nội) và vùng Phủ Lý. Người làm bánh phải tráng từng lớp bột gạo xay mịn trên mặt vải căng trên nồi nước sôi.",
      culture:
        "Món ăn thể hiện sự khéo léo, kiên nhẫn của người làm nghề: bánh phải mỏng mà không rách. Bánh cuốn nóng là bữa sáng thanh nhẹ của nhiều gia đình Hà Nội, thường kèm hành phi giòn thơm.",
      ingredients: "Bột gạo, thịt heo xay, mộc nhĩ, hành phi, chả quế, nước mắm, giá đỗ, rau thơm",
      tip: "Chấm bánh còn nóng vào bát nước mắm pha loãng, ăn cùng chả quế và chút hành phi.",
    },
    en: {
      name: "Steamed Rice Rolls (Bánh cuốn)",
      summary:
        "Bánh cuốn are paper-thin steamed rice sheets rolled around minced pork and wood-ear mushrooms, served with Vietnamese pork sausage and dipping sauce.",
      origin:
        "Bánh cuốn is famous in the north, especially in Thanh Trì village in Hanoi and around Phủ Lý. Cooks steam each sheet of finely ground rice batter on a cloth stretched over boiling water.",
      culture:
        "The dish reflects the skill and patience of its makers: the sheet must be thin without tearing. Warm bánh cuốn is a light breakfast for many Hanoi families, topped with fragrant fried shallots.",
      ingredients: "Rice flour, minced pork, wood-ear mushrooms, fried shallots, pork sausage, fish sauce, bean sprouts, herbs",
      tip: "Dip the warm rolls into lightly diluted fish sauce and eat them with the sausage and a sprinkle of fried shallots.",
    },
  },
  {
    id: "banh-chung",
    region: "north",
    category: "festival",
    image: "/foods/banh-chung.jpg",
    emoji: "🟩",
    popular: true,
    vi: {
      name: "Bánh chưng",
      summary:
        "Bánh chưng là chiếc bánh vuông gói bằng lá dong, nhân đậu xanh và thịt ba chỉ trong lớp gạo nếp dẻo thơm, không thể thiếu trong ngày Tết cổ truyền.",
      origin:
        "Theo truyền thuyết, hoàng tử Lang Liêu đã dâng vua Hùng chiếc bánh chưng vuông tượng trưng cho đất cùng bánh giầy tròn tượng trưng cho trời, và được truyền ngôi nhờ tấm lòng hiếu thảo.",
      culture:
        "Gói và canh nồi bánh chưng thâu đêm là nét sum vầy đáng nhớ của mỗi gia đình ngày cuối năm. Chiếc bánh vuông tượng trưng cho đất, thể hiện lòng biết ơn tổ tiên và ước nguyện một năm mới no đủ.",
      ingredients: "Gạo nếp, đậu xanh, thịt ba chỉ, lá dong, lạt giang, hạt tiêu, muối",
      tip: "Bánh luộc khoảng mười đến mười hai tiếng, ăn nóng hoặc rán vàng, thường dùng kèm dưa hành và giò lụa.",
    },
    en: {
      name: "Bánh chưng (Square Sticky Rice Cake)",
      summary:
        "Bánh chưng is a square cake wrapped in dong leaves, with mung bean and pork belly inside soft, fragrant sticky rice. It is indispensable at the traditional Tết holiday.",
      origin:
        "According to legend, Prince Lang Liêu offered King Hùng a square bánh chưng symbolizing the earth, together with a round bánh giầy symbolizing the sky, and won the throne for his filial devotion.",
      culture:
        "Wrapping the cakes and tending the pot through the night is a treasured family gathering at year's end. The square cake stands for the earth, expressing gratitude to ancestors and a wish for a prosperous new year.",
      ingredients: "Glutinous rice, mung beans, pork belly, dong leaves, bamboo strips, pepper, salt",
      tip: "The cakes are boiled for about ten to twelve hours. Eat them warm or pan-fried until golden, often with pickled shallots and Vietnamese pork roll.",
    },
  },
  {
    id: "bun-bo-hue",
    region: "central",
    category: "main",
    image: "/foods/bun-bo-hue.jpg",
    emoji: "🌶️",
    popular: true,
    vi: {
      name: "Bún bò Huế",
      summary:
        "Bún bò Huế có nước dùng đậm đà, cay nồng mùi sả và mắm ruốc, ăn cùng sợi bún to tròn, thịt bò, giò heo và chả cua.",
      origin:
        "Món ăn ra đời ở cố đô Huế, nơi ẩm thực chịu ảnh hưởng của lối ăn cung đình: cầu kỳ trong chế biến, đậm vị và nhiều màu sắc. Mắm ruốc là gia vị đặc trưng của miền Trung.",
      culture:
        "Người Huế ăn bún bò vào bữa sáng hoặc bữa trưa, tô bún luôn đi kèm đĩa rau sống gồm bắp chuối bào, rau muống chẻ. Vị cay nồng của món ăn phản ánh tính cách mạnh mẽ của người miền Trung.",
      ingredients: "Bún sợi to, thịt bò bắp, giò heo, chả cua, sả, mắm ruốc, ớt, dầu điều, huyết, rau sống",
      tip: "Thêm chút rau sống, vắt chanh và ớt sa tế theo khẩu vị, ăn khi nước dùng còn bốc khói.",
    },
    en: {
      name: "Huế Beef Noodle Soup (Bún bò Huế)",
      summary:
        "Bún bò Huế has a rich, spicy broth scented with lemongrass and fermented shrimp paste, served with thick round noodles, beef, pork knuckle and crab cake.",
      origin:
        "The dish was born in the old imperial capital of Huế, where cooking was shaped by court tastes: elaborate, bold and colorful. Shrimp paste is a signature seasoning of central Vietnam.",
      culture:
        "People of Huế eat it for breakfast or lunch, always with a plate of raw vegetables such as shredded banana blossom and sliced water spinach. Its fiery flavor mirrors the strong character of central Vietnamese people.",
      ingredients: "Thick round noodles, beef shank, pork knuckle, crab cake, lemongrass, shrimp paste, chili, annatto oil, blood cubes, raw vegetables",
      tip: "Add raw vegetables, a squeeze of lime and chili satay to taste, and eat while the broth is steaming.",
    },
  },
  {
    id: "mi-quang",
    region: "central",
    category: "main",
    image: "/foods/mi-quang.jpg",
    emoji: "🍲",
    vi: {
      name: "Mì Quảng",
      summary:
        "Mì Quảng là món mì sợi bản rộng vàng màu nghệ, ít nước dùng đậm đà, ăn cùng tôm, thịt, đậu phộng rang và bánh tráng mè nướng.",
      origin:
        "Mì Quảng là đặc sản của xứ Quảng Nam và Đà Nẵng. Người dân nơi đây vốn quen với gạo và hải sản, nên sáng tạo ra món mì trộn nước lèo ít, đậm đà thay vì tô nước như phở.",
      culture:
        "Mì Quảng hiện diện trong những dịp đoàn tụ, giỗ chạp hay đãi khách, và gắn với câu hát ca ngợi vẻ đẹp xứ Quảng. Bánh tráng mè bẻ vụn trộn vào mì tạo nên độ giòn đặc trưng.",
      ingredients: "Sợi mì gạo nghệ, tôm, thịt heo, đậu phộng rang, bánh tráng mè, hành lá, rau sống, nước dùng xương",
      tip: "Trộn đều mì với nước dùng, rau sống và bẻ bánh tráng vào để thưởng thức vị béo bùi giòn.",
    },
    en: {
      name: "Quảng Noodles (Mì Quảng)",
      summary:
        "Mì Quảng is a dish of wide turmeric-yellow rice noodles with a little rich broth, topped with shrimp, pork, roasted peanuts and a sesame rice cracker.",
      origin:
        "Mì Quảng is a specialty of Quảng Nam and Đà Nẵng. Local people, used to rice and seafood, created a noodle dish with only a small amount of intense broth rather than a full bowl of soup.",
      culture:
        "It appears at reunions, ancestral anniversaries and when welcoming guests, and is praised in folk songs about the Quảng land. Crumbling the sesame cracker into the noodles gives its signature crunch.",
      ingredients: "Turmeric rice noodles, shrimp, pork, roasted peanuts, sesame rice cracker, scallions, raw vegetables, bone broth",
      tip: "Toss the noodles with the broth and raw vegetables, then break in the cracker to enjoy the nutty, crunchy richness.",
    },
  },
  {
    id: "cao-lau",
    region: "central",
    category: "main",
    image: "/foods/cao-lau.jpg",
    emoji: "🍝",
    vi: {
      name: "Cao lầu",
      summary:
        "Cao lầu là món mì đặc sản của phố cổ Hội An với sợi mì dai, thịt xá xíu, tóp mỡ giòn, rau sống và chút nước sốt đậm vị.",
      origin:
        "Cao lầu chỉ có ở Hội An, thương cảng sầm uất xưa nơi người Việt, Hoa và Nhật cùng sinh sống. Tương truyền sợi mì được làm từ nước giếng Bá Lễ và tro của gỗ cây ở Cù Lao Chàm nên có độ dai riêng.",
      culture:
        "Món ăn là kết tinh của sự giao thoa văn hóa tại phố cổ, nay là di sản thế giới. Du khách đến Hội An hầu như đều thử cao lầu như một cách chạm vào lịch sử nơi đây.",
      ingredients: "Sợi mì dai, thịt xá xíu, tóp mỡ, giá đỗ, rau thơm Trà Quế, nước sốt thịt",
      tip: "Trộn đều mì với rau và nước sốt, thêm chút ớt và chanh, rồi ăn khi còn ấm.",
    },
    en: {
      name: "Cao lầu",
      summary:
        "Cao lầu is the signature noodle dish of Hội An's old town, with chewy noodles, sliced roast pork, crispy pork crackling, fresh herbs and a little savory sauce.",
      origin:
        "Cao lầu exists only in Hội An, once a bustling trading port where Vietnamese, Chinese and Japanese merchants lived side by side. Legend says the noodles are made with water from the Bá Lễ well and ash from trees of the Cham Islands, giving them a unique chewiness.",
      culture:
        "The dish is a product of cultural exchange in the old town, now a World Heritage site. Almost every visitor to Hội An tries cao lầu as a way to taste its history.",
      ingredients: "Chewy noodles, roast pork, pork crackling, bean sprouts, Trà Quế herbs, pork sauce",
      tip: "Toss the noodles with the herbs and sauce, add a little chili and lime, and eat while still warm.",
    },
  },
  {
    id: "banh-mi",
    region: "south",
    category: "snack",
    image: "/foods/banh-mi.png",
    emoji: "🥖",
    popular: true,
    vi: {
      name: "Bánh mì",
      summary:
        "Bánh mì là ổ bánh mì giòn rụm, kẹp pa-tê, thịt, đồ chua, ngò và ớt: món ăn đường phố nổi tiếng khắp thế giới.",
      origin:
        "Bánh mì được người Pháp mang vào Việt Nam, sau đó người Sài Gòn biến tấu thành ổ nhỏ, vỏ mỏng và ruột xốp hơn, kẹp nhân đậm đà kiểu Việt. Từ này đã được đưa vào từ điển Oxford.",
      culture:
        "Bánh mì là bữa sáng, bữa trưa và bữa ăn vội của người dân thành phố, thể hiện khả năng tiếp nhận và Việt hóa tinh hoa ẩm thực ngoại lai. Mỗi vùng, mỗi tiệm đều có công thức nhân riêng.",
      ingredients: "Bánh mì, pa-tê, thịt nguội, thịt nướng, đồ chua cà rốt củ cải, dưa leo, ngò rí, ớt, nước tương",
      tip: "Ăn khi vỏ còn nóng giòn, thêm ớt tùy khẩu vị; bánh mì ngon khi hòa quyện được vị béo, chua, cay và thơm.",
    },
    en: {
      name: "Bánh mì",
      summary:
        "Bánh mì is a crisp baguette stuffed with pâté, meats, pickles, cilantro and chili: a street food famous around the world.",
      origin:
        "Baguettes were brought to Vietnam by the French; Saigon cooks then made them smaller, with a thinner crust and airier crumb, and filled them with bold Vietnamese flavors. The word has since entered the Oxford English Dictionary.",
      culture:
        "Bánh mì is breakfast, lunch and the quick meal of city dwellers, showing how Vietnam adopts and reinvents foreign influences. Every region and every shop has its own secret filling.",
      ingredients: "Baguette, pâté, cold cuts, grilled pork, pickled carrot and daikon, cucumber, cilantro, chili, soy sauce",
      tip: "Eat it while the crust is still warm and crisp, adding chili to taste. A great bánh mì balances richness, sourness, spice and aroma.",
    },
  },
  {
    id: "com-tam",
    region: "south",
    category: "main",
    image: "/foods/com-tam.png",
    emoji: "🍚",
    vi: {
      name: "Cơm tấm",
      summary:
        "Cơm tấm là đĩa cơm làm từ hạt gạo tấm, ăn cùng sườn nướng thơm lừng, bì, chả trứng, mỡ hành và chén nước mắm chua ngọt.",
      origin:
        "Gạo tấm là phần gạo vỡ trong quá trình xay xát, ngày xưa người nông dân miền Tây dùng để ăn vì giá rẻ. Về sau món cơm này được người Sài Gòn nâng tầm thành đặc sản.",
      culture:
        "Từ bữa cơm bình dân, cơm tấm trở thành biểu tượng của sự giản dị và phóng khoáng miền Nam. Đĩa cơm tấm sườn nướng là bữa sáng, bữa trưa quen thuộc ở mọi góc phố Sài Gòn.",
      ingredients: "Gạo tấm, sườn heo nướng, bì heo, chả trứng, mỡ hành, đồ chua, dưa leo, nước mắm pha",
      tip: "Rưới nước mắm lên cơm, ăn cùng sườn, bì và chút đồ chua để cân bằng vị béo.",
    },
    en: {
      name: "Broken Rice (Cơm tấm)",
      summary:
        "Cơm tấm is a plate of broken rice served with fragrant grilled pork chop, shredded pork skin, egg meatloaf, scallion oil and a small bowl of sweet-sour fish sauce.",
      origin:
        "Broken rice is the fragments produced during milling. Mekong Delta farmers once ate it because it was cheap, and later Saigon cooks turned it into a beloved specialty.",
      culture:
        "From a humble meal, cơm tấm became a symbol of southern simplicity and generosity. A plate with grilled pork chop is breakfast or lunch on every corner of Saigon.",
      ingredients: "Broken rice, grilled pork chop, shredded pork skin, egg meatloaf, scallion oil, pickles, cucumber, fish sauce dressing",
      tip: "Drizzle the fish sauce over the rice and eat it with the pork, skin and pickles to balance the richness.",
    },
  },
  {
    id: "goi-cuon",
    region: "south",
    category: "snack",
    image: "/foods/goi-cuon.png",
    emoji: "🥬",
    vi: {
      name: "Gỏi cuốn",
      summary:
        "Gỏi cuốn là những cuốn bánh tráng trong suốt chứa tôm, thịt, bún, rau thơm và hẹ, chấm tương đậu phộng béo bùi.",
      origin:
        "Gỏi cuốn là món ăn của miền Nam, nơi sông nước đem lại tôm cá và rau thơm quanh năm. Người miền Nam cuốn bánh tráng ăn sống mà không chiên để giữ độ tươi mát.",
      culture:
        "Món ăn thể hiện triết lý ăn uống lành mạnh, cân bằng giữa đạm, tinh bột và rau. Cuốn gỏi cuốn là việc cả nhà cùng làm, mỗi người tự cuốn theo ý mình quanh bàn ăn.",
      ingredients: "Bánh tráng, tôm, thịt ba chỉ luộc, bún, xà lách, rau thơm, hẹ, tương đậu phộng",
      tip: "Chấm cuốn vào tương đậu phộng hoặc nước mắm chua ngọt và ăn ngay để bánh tráng còn mềm.",
    },
    en: {
      name: "Fresh Spring Rolls (Gỏi cuốn)",
      summary:
        "Gỏi cuốn are translucent rice-paper rolls filled with shrimp, pork, vermicelli, herbs and chives, dipped in rich peanut sauce.",
      origin:
        "Gỏi cuốn comes from the south, where rivers provide shrimp, fish and fresh herbs year-round. Southerners roll the paper raw rather than frying it, to keep everything fresh and cool.",
      culture:
        "The dish reflects a healthy philosophy of balance between protein, starch and greens. Rolling them is a family activity, each person assembling their own around the table.",
      ingredients: "Rice paper, shrimp, boiled pork belly, vermicelli, lettuce, herbs, chives, peanut sauce",
      tip: "Dip in peanut sauce or sweet-sour fish sauce and eat at once, while the rice paper is still soft.",
    },
  },
  {
    id: "banh-xeo",
    region: "south",
    category: "main",
    image: "/foods/banh-xeo.jpg",
    emoji: "🥞",
    vi: {
      name: "Bánh xèo",
      summary:
        "Bánh xèo là chiếc bánh xếp vàng giòn từ bột gạo và nghệ, nhân tôm, thịt, giá đỗ, cuốn rau sống rồi chấm nước mắm chua ngọt.",
      origin:
        "Tên bánh xuất phát từ tiếng xèo xèo khi đổ bột vào chảo dầu nóng. Bánh phổ biến ở miền Nam và miền Trung, mỗi nơi có một cách làm: bánh miền Tây to và giòn, bánh miền Trung nhỏ hơn.",
      culture:
        "Ăn bánh xèo là cả một nghi thức sum họp: mỗi người tự cuốn bánh với rau rừng, rau thơm trong lá cải xanh. Bánh gắn liền với những buổi tụ họp gia đình ở miền quê sông nước.",
      ingredients: "Bột gạo, nghệ, nước cốt dừa, tôm, thịt ba chỉ, giá đỗ, hành lá, rau sống, nước mắm",
      tip: "Bẻ miếng bánh, cuốn cùng rau cải và rau thơm rồi chấm nước mắm chua ngọt để cảm nhận trọn vị.",
    },
    en: {
      name: "Sizzling Pancake (Bánh xèo)",
      summary:
        "Bánh xèo is a crispy golden folded pancake of rice flour and turmeric, filled with shrimp, pork and bean sprouts, wrapped in fresh greens and dipped in sweet-sour fish sauce.",
      origin:
        "The name comes from the xèo xèo sizzle when the batter hits the hot pan. It is popular in the south and centre, each with its own style: big and crisp in the Mekong Delta, smaller in the centre.",
      culture:
        "Eating bánh xèo is a ritual of togetherness: everyone wraps their own bite with herbs in a mustard leaf. It is tied to family gatherings in the river country.",
      ingredients: "Rice flour, turmeric, coconut milk, shrimp, pork belly, bean sprouts, scallions, fresh herbs, fish sauce",
      tip: "Break off a piece, wrap it with greens and herbs and dip it in sweet-sour fish sauce to taste everything together.",
    },
  },
  {
    id: "che-ba-mau",
    region: "south",
    category: "dessert",
    image: "/foods/che-ba-mau.png",
    emoji: "🍧",
    vi: {
      name: "Chè ba màu",
      summary:
        "Chè ba màu là món tráng miệng mát lạnh gồm các lớp đậu đỏ, đậu xanh, thạch lá dứa, chan nước cốt dừa béo ngậy và đá bào.",
      origin:
        "Chè ba màu là món chè đặc trưng của miền Nam, ra đời trong khí hậu nóng ẩm quanh năm. Ba lớp màu đỏ, vàng, xanh được xếp tầng đẹp mắt trong ly cao.",
      culture:
        "Chè là nét văn hóa ẩm thực quan trọng của người Việt, thường dùng trong các dịp lễ, cúng và buổi tụ họp. Ba màu sắc cũng gợi lên sự hài hòa và may mắn.",
      ingredients: "Đậu đỏ, đậu xanh, thạch lá dứa, nước cốt dừa, đường, đá bào",
      tip: "Khuấy nhẹ cho các lớp hòa vào nhau rồi thưởng thức khi còn lạnh.",
    },
    en: {
      name: "Three-Color Dessert (Chè ba màu)",
      summary:
        "Chè ba màu is a cool dessert with layers of red beans, mung bean paste and pandan jelly, topped with rich coconut milk and shaved ice.",
      origin:
        "Chè ba màu is a southern specialty born in the hot, humid climate. The red, yellow and green layers are stacked beautifully in a tall glass.",
      culture:
        "Chè is an important part of Vietnamese food culture, served at festivals, offerings and gatherings. The three colors also evoke harmony and good luck.",
      ingredients: "Red beans, mung beans, pandan jelly, coconut milk, sugar, shaved ice",
      tip: "Stir gently so the layers blend, and enjoy it while still cold.",
    },
  },
  {
    id: "ca-phe-sua-da",
    region: "south",
    category: "drink",
    image: "/foods/ca-phe-sua-da.png",
    emoji: "☕",
    popular: true,
    vi: {
      name: "Cà phê sữa đá",
      summary:
        "Cà phê sữa đá là ly cà phê pha phin đậm đắng, hòa cùng sữa đặc ngọt béo và đá lạnh, thức uống khởi đầu ngày mới của người Việt.",
      origin:
        "Cà phê được người Pháp đưa vào Việt Nam từ giữa thế kỷ mười chín và phát triển mạnh ở Tây Nguyên. Vì sữa tươi từng khan hiếm, người Việt dùng sữa đặc có đường để pha, tạo nên hương vị riêng.",
      culture:
        "Ngồi quán cà phê vỉa hè là nếp sống của người Việt, nơi trò chuyện, làm việc và nghỉ ngơi. Việt Nam hiện là một trong những quốc gia xuất khẩu cà phê lớn nhất thế giới.",
      ingredients: "Cà phê robusta, sữa đặc có đường, đá viên, nước sôi",
      tip: "Đợi cà phê nhỏ từng giọt qua phin, khuấy đều với sữa đặc rồi rót vào ly đá.",
    },
    en: {
      name: "Vietnamese Iced Milk Coffee (Cà phê sữa đá)",
      summary:
        "Cà phê sữa đá is strong drip coffee blended with sweet, creamy condensed milk and poured over ice, the way many Vietnamese start their day.",
      origin:
        "Coffee was brought to Vietnam by the French in the mid-nineteenth century and flourished in the Central Highlands. Fresh milk was once scarce, so sweetened condensed milk became the standard, creating a flavor all its own.",
      culture:
        "Sitting at a sidewalk café is a way of life, a place to talk, work and rest. Vietnam is now one of the world's largest coffee exporters.",
      ingredients: "Robusta coffee, sweetened condensed milk, ice cubes, hot water",
      tip: "Let the coffee drip slowly through the phin filter, stir it with the condensed milk and pour it over ice.",
    },
  },
  {
    id: "nuoc-mia",
    region: "south",
    category: "drink",
    image: "/foods/nuoc-mia.png",
    emoji: "🎋",
    vi: {
      name: "Nước mía",
      summary:
        "Nước mía là thức uống giải khát được ép tươi từ cây mía, ngọt thanh, mát lạnh, thường thêm chút tắc cho thơm.",
      origin:
        "Cây mía được trồng từ lâu đời ở nhiều vùng của Việt Nam, đặc biệt ở đồng bằng sông Cửu Long. Những xe nước mía đẩy trên vỉa hè là hình ảnh quen thuộc của phố phường.",
      culture:
        "Ly nước mía giản dị gắn với tuổi thơ và những buổi trưa nóng của nhiều thế hệ người Việt. Đây là thức uống bình dân thể hiện sự gần gũi với thiên nhiên.",
      ingredients: "Cây mía, tắc (quất), đá",
      tip: "Uống ngay sau khi ép để giữ vị ngọt thanh và hương thơm tự nhiên của mía.",
    },
    en: {
      name: "Sugarcane Juice (Nước mía)",
      summary:
        "Nước mía is a refreshing drink pressed fresh from sugarcane, lightly sweet and ice-cold, often with a little kumquat for fragrance.",
      origin:
        "Sugarcane has long been grown across Vietnam, especially in the Mekong Delta. Pushcarts pressing cane on the pavement are a familiar sight in towns and cities.",
      culture:
        "A simple glass of sugarcane juice is tied to the childhoods and hot afternoons of generations of Vietnamese. It is a humble drink that expresses closeness to nature.",
      ingredients: "Sugarcane, kumquat, ice",
      tip: "Drink it right after pressing to keep the natural sweetness and aroma of the cane.",
    },
  },
  {
    id: "cha-ca-la-vong",
    region: "north",
    category: "main",
    image: "/foods/cha-ca-la-vong.jpg",
    emoji: "🐟",
    vi: {
      name: "Chả cá Lã Vọng",
      summary:
        "Chả cá Lã Vọng là cá lăng ướp nghệ, riềng, mẻ, nướng than hoa rồi đảo nóng trên chảo mỡ cùng thì là, hành lá ngay tại bàn, ăn với bún, lạc rang và mắm tôm.",
      origin:
        "Món ăn gắn với gia đình họ Đoàn ở phố Hàng Sơn, Hà Nội từ cuối thế kỷ mười chín. Trong nhà có đặt tượng ông Lã Vọng ngồi câu cá nên khách gọi là chả cá Lã Vọng, rồi con phố cũng được đổi tên thành phố Chả Cá.",
      culture:
        "Hiếm có món ăn nào đặt tên cho cả một con phố như chả cá. Món ăn thể hiện sự cầu kỳ của người Hà Nội xưa: từ khâu chọn cá, ướp gia vị đến cách bày rau thơm và pha mắm tôm đều phải đúng điệu.",
      ingredients: "Cá lăng, nghệ, riềng, mẻ, thì là, hành lá, bún, lạc rang, rau thơm, mắm tôm",
      tip: "Gắp cá còn xèo xèo trên chảo cùng thì là, cho vào bát bún, thêm lạc rang và rưới mắm tôm đánh chanh, ớt.",
    },
    en: {
      name: "Turmeric Fish (Chả cá Lã Vọng)",
      summary:
        "Chả cá Lã Vọng is hemibagrus fish marinated in turmeric, galangal and fermented rice, grilled over charcoal and then tossed at the table in a hot pan with dill and scallions, served with rice vermicelli, peanuts and shrimp paste.",
      origin:
        "The dish is linked to the Đoàn family on Hàng Sơn street in Hanoi in the late nineteenth century. They kept a statue of Lã Vọng, a legendary fisherman, in the house, so diners named the dish after him, and the street itself was later renamed Chả Cá (Fish Cake) street.",
      culture:
        "Few dishes have given their name to an entire street. Chả cá shows the refinement of old Hanoi: choosing the fish, marinating it, arranging the herbs and mixing the shrimp paste must all be done just right.",
      ingredients: "Hemibagrus fish, turmeric, galangal, fermented rice, dill, scallions, rice vermicelli, roasted peanuts, herbs, shrimp paste",
      tip: "Take the sizzling fish with dill straight from the pan into a bowl of noodles, add peanuts and a little shrimp paste beaten with lime and chili.",
    },
  },
  {
    id: "bun-thang",
    region: "north",
    category: "main",
    image: "/foods/bun-thang.jpg",
    emoji: "🍲",
    vi: {
      name: "Bún thang",
      summary:
        "Bún thang là món bún cầu kỳ bậc nhất của Hà Nội, với nước dùng gà trong vắt và hàng chục sợi trứng tráng, giò lụa, thịt gà thái chỉ xếp đều trên mặt bát.",
      origin:
        "Tương truyền món ăn ra đời từ những ngày sau Tết, khi các bà nội trợ tận dụng thịt gà, giò lụa còn lại để nấu một bát bún thanh nhẹ. Chữ \"thang\" được hiểu như một thang thuốc bắc, gồm nhiều vị hòa quyện với nhau.",
      culture:
        "Một bát bún thang đẹp phải có đủ màu vàng của trứng, trắng của gà, hồng của giò và xanh của hành. Món ăn thể hiện sự khéo léo, tỉ mỉ và nếp sống thanh lịch của người Tràng An.",
      ingredients: "Bún, gà ta, trứng gà, giò lụa, tôm khô, củ cải khô, nấm hương, hành lá, rau răm, mắm tôm",
      tip: "Chỉ cần thêm chút mắm tôm và một giọt tinh dầu cà cuống nếu có, rồi chan nước dùng thật nóng.",
    },
    en: {
      name: "Hanoi Chicken Noodle Soup (Bún thang)",
      summary:
        "Bún thang is one of Hanoi's most elaborate noodle dishes, with a crystal-clear chicken broth topped with neat rows of finely shredded egg, pork roll and chicken.",
      origin:
        "Legend says it was born in the days after Tết, when cooks used leftover chicken and pork roll to make a light bowl of noodles. The word \"thang\" is understood as a herbal medicine prescription, made of many ingredients in harmony.",
      culture:
        "A beautiful bowl must show the yellow of egg, the white of chicken, the pink of pork roll and the green of scallions. It reflects the skill, patience and elegant lifestyle of old Hanoi families.",
      ingredients: "Rice vermicelli, free-range chicken, eggs, Vietnamese pork roll, dried shrimp, dried radish, shiitake mushrooms, scallions, Vietnamese coriander, shrimp paste",
      tip: "Add only a touch of shrimp paste, and a drop of giant water bug essence if you can find it, then pour on the broth piping hot.",
    },
  },
  {
    id: "com-lang-vong",
    region: "north",
    category: "dessert",
    image: "/foods/com-lang-vong.jpg",
    emoji: "🌾",
    vi: {
      name: "Cốm làng Vòng",
      summary:
        "Cốm là những hạt lúa nếp non được rang và giã dẻo, có màu xanh ngọc và mùi thơm của đồng lúa, được gói trong lá sen mỗi độ thu về.",
      origin:
        "Làng Vòng, nay thuộc quận Cầu Giấy, Hà Nội, nổi tiếng làm cốm từ hàng trăm năm. Lúa nếp được gặt khi hạt còn sữa, rang trên chảo gang rồi giã nhẹ tay nhiều lần cho dẹt và dẻo.",
      culture:
        "Cốm là thức quà mùa thu của Hà Nội, được bọc lá sen, buộc lạt rơm. Hồng đỏ đi với cốm xanh là cặp lễ vật trong lễ ăn hỏi, tượng trưng cho sự đẹp đôi và hòa hợp.",
      ingredients: "Lúa nếp non, lá sen, lạt rơm",
      tip: "Ăn từng nhúm nhỏ để cảm nhận vị ngọt và mùi thơm, có thể ăn kèm chuối chín hoặc hồng đỏ.",
    },
    en: {
      name: "Young Green Rice Flakes (Cốm làng Vòng)",
      summary:
        "Cốm is young glutinous rice that is roasted and pounded into soft, jade-green flakes with the fragrance of rice fields, wrapped in lotus leaves each autumn.",
      origin:
        "Vòng village, now part of Cầu Giấy district in Hanoi, has made cốm for hundreds of years. The rice is harvested while the grains are still milky, roasted in cast-iron pans and gently pounded many times until flat and tender.",
      culture:
        "Cốm is Hanoi's autumn treat, wrapped in a lotus leaf and tied with rice straw. Red persimmons paired with green cốm are a traditional engagement gift, symbolising a well-matched couple.",
      ingredients: "Young glutinous rice, lotus leaves, rice straw ties",
      tip: "Eat it a small pinch at a time to taste its sweetness and aroma, perhaps with a ripe banana or persimmon.",
    },
  },
  {
    id: "banh-troi-banh-chay",
    region: "north",
    category: "festival",
    image: "/foods/banh-troi-banh-chay.jpg",
    emoji: "🍡",
    vi: {
      name: "Bánh trôi, bánh chay",
      summary:
        "Bánh trôi là những viên bột nếp nhỏ nhân đường phên, còn bánh chay to hơn, nhân đậu xanh, ăn cùng nước đường gừng và vừng rang.",
      origin:
        "Đây là món ăn của Tết Hàn thực, mùng ba tháng ba âm lịch. Nhiều làng ở miền Bắc gắn món bánh với lễ dâng cúng các vua Hùng và tổ tiên.",
      culture:
        "Ngày Tết Hàn thực, các gia đình nặn bánh dâng lên bàn thờ để tưởng nhớ cội nguồn. Bánh trôi nước còn đi vào thơ ca qua bài thơ nổi tiếng của nữ sĩ Hồ Xuân Hương, ví với thân phận người phụ nữ.",
      ingredients: "Bột gạo nếp, đường phên, đậu xanh, gừng, vừng rang, nước cốt dừa",
      tip: "Bánh trôi ăn nguội, bánh chay ăn nóng cùng nước đường gừng, rắc vừng rang lên trên.",
    },
    en: {
      name: "Floating Rice Cakes (Bánh trôi, bánh chay)",
      summary:
        "Bánh trôi are small glutinous rice balls filled with cane sugar, while bánh chay are larger and filled with mung bean, served in ginger syrup with toasted sesame.",
      origin:
        "These are the dishes of the Cold Food Festival on the third day of the third lunar month. Many northern villages offer them in memory of the Hùng Kings and their ancestors.",
      culture:
        "On this day families shape the cakes and place them on the altar to remember their roots. The floating cake also lives in poetry through a famous poem by Hồ Xuân Hương, who compared it to the fate of women.",
      ingredients: "Glutinous rice flour, cane sugar, mung beans, ginger, toasted sesame, coconut milk",
      tip: "Bánh trôi are eaten cool, bánh chay warm in ginger syrup, both sprinkled with toasted sesame.",
    },
  },
  {
    id: "xoi-gac",
    region: "north",
    category: "festival",
    image: "/foods/xoi-gac.jpg",
    emoji: "🍚",
    vi: {
      name: "Xôi gấc",
      summary:
        "Xôi gấc là xôi nếp đồ cùng ruột quả gấc, có màu đỏ cam rực rỡ, vị béo nhẹ và ngọt thơm.",
      origin:
        "Cây gấc được trồng khắp các làng quê miền Bắc. Quả gấc chín vào cuối năm nên xôi gấc trở thành món quen thuộc trong mâm cỗ Tết.",
      culture:
        "Màu đỏ của xôi gấc tượng trưng cho may mắn và hạnh phúc. Món xôi có mặt trên mâm cúng giao thừa, trong lễ cưới, lễ đầy tháng và nhiều dịp quan trọng của gia đình Việt.",
      ingredients: "Gạo nếp, ruột gấc, rượu trắng, đường, muối, nước cốt dừa",
      tip: "Ăn khi xôi còn ấm, có thể kèm muối vừng hoặc giò lụa.",
    },
    en: {
      name: "Red Gac Sticky Rice (Xôi gấc)",
      summary:
        "Xôi gấc is glutinous rice steamed with the pulp of the gac fruit, giving it a brilliant red-orange color and a gently rich, sweet flavor.",
      origin:
        "Gac vines grow in villages across northern Vietnam. The fruit ripens at the end of the year, so xôi gấc became a familiar part of the Tết feast.",
      culture:
        "Its red color stands for luck and happiness. Xôi gấc appears on the New Year's Eve altar, at weddings, a baby's one-month celebration and many important family occasions.",
      ingredients: "Glutinous rice, gac fruit pulp, rice wine, sugar, salt, coconut milk",
      tip: "Eat it while still warm, with sesame salt or slices of pork roll.",
    },
  },
  {
    id: "ca-phe-trung",
    region: "north",
    category: "drink",
    image: "/foods/ca-phe-trung.jpg",
    emoji: "☕",
    vi: {
      name: "Cà phê trứng",
      summary:
        "Cà phê trứng là lớp kem lòng đỏ trứng đánh bông với đường và sữa đặc, mịn như bọt, phủ lên trên cà phê đen nóng.",
      origin:
        "Món đồ uống ra đời ở Hà Nội năm 1946, khi sữa tươi khan hiếm. Ông Nguyễn Văn Giảng, khi ấy làm pha chế, đã dùng lòng đỏ trứng đánh bông để thay sữa, rồi mở quán cà phê Giảng nổi tiếng đến nay.",
      culture:
        "Cà phê trứng là minh chứng cho sự sáng tạo của người Hà Nội trong thời khó khăn. Ngày nay, món uống trở thành điểm đến của du khách khi dạo quanh phố cổ.",
      ingredients: "Cà phê phin, lòng đỏ trứng gà, sữa đặc, đường, nước sôi",
      tip: "Tách cà phê thường được đặt trong bát nước nóng để giữ ấm. Hãy dùng thìa nhỏ ăn lớp kem trước rồi mới khuấy đều.",
    },
    en: {
      name: "Egg Coffee (Cà phê trứng)",
      summary:
        "Egg coffee is a layer of egg yolk whipped with sugar and condensed milk until light as foam, spooned over hot black coffee.",
      origin:
        "The drink was created in Hanoi in 1946 when fresh milk was scarce. Nguyễn Văn Giảng, a bartender at the time, used whipped egg yolk instead of milk and later opened the Giảng café, still famous today.",
      culture:
        "Egg coffee shows how Hanoians found creative answers in hard times. Today it is a must-try for visitors strolling through the Old Quarter.",
      ingredients: "Phin-filtered coffee, egg yolks, condensed milk, sugar, boiling water",
      tip: "The cup is often set in a bowl of hot water to keep it warm. Eat some of the cream with a small spoon first, then stir it all together.",
    },
  },
  {
    id: "tra-sen-tay-ho",
    region: "north",
    category: "drink",
    image: "/foods/tra-sen-tay-ho.jpg",
    emoji: "🍵",
    vi: {
      name: "Trà sen Tây Hồ",
      summary:
        "Trà sen Tây Hồ là trà xanh được ướp trong hoa sen Bách Diệp của Hồ Tây, nước trà vàng trong và hương sen thanh khiết, được coi là thức trà quý của người Hà Nội.",
      origin:
        "Nghề ướp trà sen gắn với làng Quảng An bên Hồ Tây. Người ta hái sen lúc sáng sớm, tách lấy gạo sen rồi ướp với trà nhiều lần; cần hàng nghìn bông sen mới ướp được một cân trà.",
      culture:
        "Thưởng trà sen là thú vui tao nhã của người Hà Nội xưa, thường dành để tiếp khách quý hoặc biếu tặng dịp lễ Tết. Nghề ướp trà sen là di sản cần được gìn giữ.",
      ingredients: "Trà xanh Thái Nguyên, gạo sen của hoa sen Bách Diệp",
      tip: "Pha bằng nước nóng vừa phải, khoảng tám mươi độ, rót ra chén nhỏ và nhấp từng ngụm để cảm nhận hương sen.",
    },
    en: {
      name: "West Lake Lotus Tea (Trà sen Tây Hồ)",
      summary:
        "West Lake lotus tea is green tea scented with the Bách Diệp lotus of Hanoi's West Lake, giving a clear golden brew with a pure lotus fragrance. It is one of Hanoi's most prized teas.",
      origin:
        "The craft is tied to Quảng An village beside West Lake. Lotus flowers are picked at dawn, their stamens are removed and layered with tea many times; it takes thousands of flowers to scent one kilogram of tea.",
      culture:
        "Sipping lotus tea was an elegant pastime of old Hanoi, kept for honoured guests or given as a gift at Tết. Lotus tea scenting is a heritage craft worth preserving.",
      ingredients: "Thái Nguyên green tea, stamens of Bách Diệp lotus flowers",
      tip: "Brew with water at about eighty degrees, pour into small cups and sip slowly to enjoy the lotus aroma.",
    },
  },
  {
    id: "com-hen",
    region: "central",
    category: "main",
    image: "/foods/com-hen.jpg",
    emoji: "🐚",
    vi: {
      name: "Cơm hến",
      summary:
        "Cơm hến là món cơm nguội trộn hến xào, tóp mỡ, rau sống, đậu phộng, mắm ruốc và ớt, ăn kèm bát nước hến nóng, vị cay nồng đặc trưng xứ Huế.",
      origin:
        "Món ăn bắt nguồn từ cồn Hến giữa dòng sông Hương, nơi người dân sống bằng nghề cào hến. Cơm hến vốn là món ăn của người lao động nghèo, tận dụng cơm nguội và con hến rẻ tiền.",
      culture:
        "Từ món ăn dân dã, cơm hến trở thành niềm tự hào của ẩm thực Huế. Một bát cơm hến có đến hơn chục thứ nguyên liệu, thể hiện cách người Huế biến những thứ giản dị thành món ngon.",
      ingredients: "Cơm nguội, hến, tóp mỡ, đậu phộng rang, rau sống, khế, bắp chuối, mắm ruốc, ớt, nước hến",
      tip: "Trộn đều các nguyên liệu, nêm ớt tùy sức và húp xen kẽ với nước hến nóng.",
    },
    en: {
      name: "Huế Baby Clam Rice (Cơm hến)",
      summary:
        "Cơm hến is cold rice mixed with stir-fried baby clams, crispy pork crackling, fresh herbs, peanuts, fermented shrimp sauce and chili, served with a bowl of hot clam broth, fiery in true Huế style.",
      origin:
        "The dish comes from Cồn Hến, an islet in the Perfume River where people made a living raking clams. It was food for poor workers, using leftover rice and cheap clams.",
      culture:
        "From humble beginnings, cơm hến became a pride of Huế cuisine. A single bowl holds more than ten ingredients, showing how people in Huế turn simple things into something delicious.",
      ingredients: "Cold rice, baby clams, pork crackling, roasted peanuts, fresh herbs, star fruit, banana blossom, fermented shrimp sauce, chili, clam broth",
      tip: "Mix everything well, add chili to taste and sip the hot clam broth between bites.",
    },
  },
  {
    id: "banh-beo",
    region: "central",
    category: "snack",
    image: "/foods/banh-beo.jpg",
    emoji: "🥟",
    vi: {
      name: "Bánh bèo",
      summary:
        "Bánh bèo là những chiếc bánh bột gạo nhỏ hấp trong chén, trên rắc tôm chấy, tóp mỡ, chan nước mắm ngọt cay.",
      origin:
        "Bánh bèo là món ăn dân gian của xứ Huế và các tỉnh miền Trung. Tên bánh xuất phát từ hình dáng nhỏ, mỏng giống chiếc lá bèo trên mặt nước.",
      culture:
        "Những mâm bánh bèo hàng chục chén nhỏ là hình ảnh quen thuộc trong các buổi chiều ở Huế. Món bánh thể hiện sự tinh tế, nhỏ nhắn đặc trưng của ẩm thực cố đô.",
      ingredients: "Bột gạo, tôm khô, tóp mỡ, hành phi, nước mắm, ớt",
      tip: "Rưới nước mắm vào từng chén rồi dùng thìa nhỏ xúc bánh ra khỏi chén để ăn.",
    },
    en: {
      name: "Steamed Rice Cakes (Bánh bèo)",
      summary:
        "Bánh bèo are small rice-flour cakes steamed in saucers, topped with shredded dried shrimp and crispy pork crackling, and drizzled with sweet and spicy fish sauce.",
      origin:
        "Bánh bèo is a folk dish of Huế and central Vietnam. Its name comes from its small, thin shape, like a water fern leaf floating on a pond.",
      culture:
        "Trays of dozens of tiny saucers are a familiar sight on Huế afternoons. The dish reflects the delicate, small-portioned style of the old imperial capital.",
      ingredients: "Rice flour, dried shrimp, pork crackling, fried shallots, fish sauce, chili",
      tip: "Pour fish sauce into each saucer, then scoop the cake out with a small spoon.",
    },
  },
  {
    id: "nem-lui",
    region: "central",
    category: "snack",
    image: "/foods/nem-lui.jpg",
    emoji: "🍢",
    vi: {
      name: "Nem lụi",
      summary:
        "Nem lụi là thịt heo giã nhuyễn quấn quanh que sả rồi nướng trên than hồng, cuốn bánh tráng với rau sống và chấm nước lèo đậu phộng.",
      origin:
        "Nem lụi là món ăn quen thuộc của Huế. \"Lụi\" là cách gọi việc xiên thịt vào que, ngày nay người ta thường dùng cây sả để thịt thơm hơn khi nướng.",
      culture:
        "Món nem lụi thường xuất hiện trong những buổi tụ họp, khi mọi người cùng ngồi quanh mâm tự cuốn nem. Nước lèo sánh béo là bí quyết riêng của từng gia đình Huế.",
      ingredients: "Thịt heo, mỡ heo, sả, tỏi, bánh tráng, rau sống, khế, chuối chát, đậu phộng, gan heo",
      tip: "Đặt nem lên bánh tráng, thêm rau, khế, chuối chát, rút que sả ra rồi cuốn chặt và chấm nước lèo.",
    },
    en: {
      name: "Lemongrass Pork Skewers (Nem lụi)",
      summary:
        "Nem lụi is pounded pork wrapped around lemongrass stalks and grilled over hot coals, then rolled in rice paper with fresh herbs and dipped in a peanut sauce.",
      origin:
        "Nem lụi is a familiar dish of Huế. \"Lụi\" means skewering meat on a stick, and today lemongrass is often used so the meat becomes fragrant as it grills.",
      culture:
        "Nem lụi is usually served at gatherings, where everyone sits around the tray rolling their own. The thick, rich dipping sauce is a secret recipe in each Huế family.",
      ingredients: "Pork, pork fat, lemongrass, garlic, rice paper, fresh herbs, star fruit, green banana, peanuts, pork liver",
      tip: "Lay the pork on rice paper with herbs, star fruit and green banana, pull out the lemongrass, roll it tight and dip in the sauce.",
    },
  },
  {
    id: "banh-it-la-gai",
    region: "central",
    category: "dessert",
    image: "/foods/banh-it-la-gai.jpg",
    emoji: "🍃",
    vi: {
      name: "Bánh ít lá gai",
      summary:
        "Bánh ít lá gai có vỏ nếp màu đen bóng làm từ lá gai, nhân đậu xanh hoặc dừa, gói trong lá chuối thành hình chóp, dẻo thơm và ngọt bùi.",
      origin:
        "Đây là đặc sản nổi tiếng của Bình Định. Lá gai được nấu nhừ, giã nhuyễn rồi nhồi cùng bột nếp, tạo nên màu đen đặc trưng và mùi thơm riêng.",
      culture:
        "Bánh ít lá gai là lễ vật không thể thiếu trong đám cưới, đám hỏi và ngày giỗ ở Bình Định. Câu ca dao \"Muốn ăn bánh ít lá gai, lấy chồng Bình Định sợ dài đường đi\" đã làm món bánh nổi tiếng khắp nơi.",
      ingredients: "Bột nếp, lá gai, đậu xanh, dừa nạo, đường, lá chuối",
      tip: "Bóc lớp lá chuối và ăn khi bánh còn ấm để cảm nhận độ dẻo và mùi thơm của lá gai.",
    },
    en: {
      name: "Ramie Leaf Sticky Cake (Bánh ít lá gai)",
      summary:
        "Bánh ít lá gai has a glossy black glutinous rice shell made with ramie leaves, filled with mung bean or coconut and wrapped in banana leaves into a pyramid. It is chewy, fragrant and sweet.",
      origin:
        "It is a famous specialty of Bình Định province. Ramie leaves are boiled, pounded and kneaded into glutinous rice flour, giving the cake its black color and unique aroma.",
      culture:
        "The cake is an essential offering at weddings, engagements and death anniversaries in Bình Định. A folk verse says: \"If you want to eat ramie leaf cake, marry a Bình Định man and don't fear the long road\".",
      ingredients: "Glutinous rice flour, ramie leaves, mung beans, grated coconut, sugar, banana leaves",
      tip: "Peel off the banana leaf and eat it warm to enjoy its chewiness and the scent of ramie.",
    },
  },
  {
    id: "hu-tieu-nam-vang",
    region: "south",
    category: "main",
    image: "/foods/hu-tieu-nam-vang.jpg",
    emoji: "🍜",
    vi: {
      name: "Hủ tiếu Nam Vang",
      summary:
        "Hủ tiếu Nam Vang là sợi hủ tiếu dai ăn với nước dùng xương heo ngọt thanh, tôm, thịt bằm, gan, trứng cút, có thể ăn nước hoặc ăn khô.",
      origin:
        "\"Nam Vang\" là tên cũ của Phnôm Pênh. Món ăn bắt nguồn từ cộng đồng người Hoa ở Campuchia rồi theo họ đến Sài Gòn, dần biến đổi theo khẩu vị người miền Nam.",
      culture:
        "Hủ tiếu là bữa sáng quen thuộc của người Sài Gòn, phản ánh sự giao thoa văn hóa Việt, Hoa, Khmer. Tiếng gõ lốc cốc của xe hủ tiếu gõ từng là âm thanh đặc trưng của các con hẻm.",
      ingredients: "Hủ tiếu, xương heo, tôm, thịt heo bằm, gan heo, trứng cút, hẹ, tỏi phi, giá, xà lách",
      tip: "Nếu ăn khô, hãy trộn đều sợi hủ tiếu với nước sốt rồi húp xen kẽ với chén nước dùng riêng.",
    },
    en: {
      name: "Phnom Penh Noodle Soup (Hủ tiếu Nam Vang)",
      summary:
        "Hủ tiếu Nam Vang is chewy rice noodles in a clear, sweet pork bone broth with shrimp, minced pork, liver and quail eggs, served either as soup or dry.",
      origin:
        "\"Nam Vang\" is the old Vietnamese name for Phnom Penh. The dish comes from the Chinese community in Cambodia and followed them to Saigon, where it adapted to southern tastes.",
      culture:
        "Hủ tiếu is a familiar Saigon breakfast that reflects the blend of Vietnamese, Chinese and Khmer cultures. The tapping of wooden sticks by street noodle vendors was once the signature sound of the city's alleys.",
      ingredients: "Rice noodles, pork bones, shrimp, minced pork, pork liver, quail eggs, garlic chives, fried garlic, bean sprouts, lettuce",
      tip: "For the dry version, toss the noodles with the sauce and sip the broth from its separate bowl between bites.",
    },
  },
  {
    id: "canh-chua-ca-loc",
    region: "south",
    category: "main",
    image: "/foods/canh-chua-ca-loc.jpg",
    emoji: "🥘",
    vi: {
      name: "Canh chua cá lóc",
      summary:
        "Canh chua cá lóc là món canh chua ngọt từ me, thơm, cà chua, nấu cùng cá lóc đồng, bạc hà, giá và rau om, rất đưa cơm.",
      origin:
        "Món canh ra đời từ chính sản vật của đồng bằng sông Cửu Long: cá lóc bắt ngoài ruộng, me, thơm và các loại rau mọc quanh vườn nhà.",
      culture:
        "Canh chua có mặt trong mâm cơm hằng ngày của gia đình miền Tây, thể hiện sự trù phú của vùng sông nước và cách người dân hòa hợp với thiên nhiên.",
      ingredients: "Cá lóc, me chua, thơm (dứa), cà chua, bạc hà (dọc mùng), đậu bắp, giá, rau om, ngò gai, ớt",
      tip: "Ăn với cơm trắng nóng, chấm cá với nước mắm ớt và thêm một bát cá kho là đúng điệu miền Tây.",
    },
    en: {
      name: "Sweet and Sour Snakehead Fish Soup (Canh chua cá lóc)",
      summary:
        "Canh chua cá lóc is a sweet and sour soup of tamarind, pineapple and tomato cooked with snakehead fish, taro stems, bean sprouts and rice paddy herb, perfect with rice.",
      origin:
        "The soup is made from the bounty of the Mekong Delta: snakehead fish caught in the rice fields, tamarind, pineapple and vegetables growing around the house.",
      culture:
        "Canh chua is part of daily family meals in the Mekong Delta, showing the richness of the river region and how its people live in harmony with nature.",
      ingredients: "Snakehead fish, tamarind, pineapple, tomato, taro stems, okra, bean sprouts, rice paddy herb, sawtooth coriander, chili",
      tip: "Eat it with hot steamed rice, dip the fish in chili fish sauce and add a clay pot of braised fish for a true southern meal.",
    },
  },
  {
    id: "thit-kho-trung",
    region: "south",
    category: "festival",
    image: "/foods/thit-kho-trung.jpg",
    emoji: "🥚",
    vi: {
      name: "Thịt kho trứng",
      summary:
        "Thịt kho trứng là thịt ba chỉ kho với nước dừa tươi và trứng vịt, nước kho màu cánh gián, thịt mềm, béo mà không ngấy.",
      origin:
        "Đây là món ăn không thể thiếu trong mâm cơm Tết của người miền Nam. Ngày xưa chợ nghỉ nhiều ngày dịp Tết nên các gia đình kho một nồi lớn để ăn dần.",
      culture:
        "Miếng thịt vuông vức tượng trưng cho sự đầy đủ, trứng tròn tượng trưng cho sự viên mãn. Thịt kho thường đi cùng canh khổ qua, với mong ước những khó khăn của năm cũ sẽ qua đi.",
      ingredients: "Thịt ba chỉ, trứng vịt, nước dừa tươi, nước mắm, đường, hành, tỏi",
      tip: "Ăn với cơm trắng, dưa giá hoặc củ kiệu. Thịt kho để qua ngày hôm sau lại càng thấm vị.",
    },
    en: {
      name: "Caramelised Pork and Eggs (Thịt kho trứng)",
      summary:
        "Thịt kho trứng is pork belly braised in fresh coconut water with duck eggs, producing an amber sauce and tender, rich meat that never feels heavy.",
      origin:
        "It is an essential dish on the southern Tết table. In the past markets closed for days during the holiday, so families braised a big pot to eat over several days.",
      culture:
        "The square pieces of pork stand for abundance and the round eggs for completeness. It is often served with bitter melon soup, whose name in the south carries the wish that last year's hardships will pass.",
      ingredients: "Pork belly, duck eggs, fresh coconut water, fish sauce, sugar, shallots, garlic",
      tip: "Eat it with steamed rice and pickled bean sprouts or shallots. It tastes even better the next day.",
    },
  },
  {
    id: "banh-tet",
    region: "south",
    category: "festival",
    image: "/foods/banh-tet.jpg",
    emoji: "🎍",
    vi: {
      name: "Bánh tét",
      summary:
        "Bánh tét là đòn bánh nếp hình trụ gói lá chuối, nhân đậu xanh và thịt mỡ, là món bánh Tết đặc trưng của miền Nam và miền Trung.",
      origin:
        "Bánh tét cùng ý nghĩa với bánh chưng của miền Bắc nhưng được gói tròn dài. Tên bánh được cho là từ cách dùng sợi lạt \"tét\" bánh ra thành từng khoanh khi ăn.",
      culture:
        "Những ngày cuối năm, cả nhà quây quần gói bánh và thức canh nồi bánh suốt đêm. Bánh tét được bày lên bàn thờ tổ tiên và mang biếu họ hàng, thể hiện sự sum vầy.",
      ingredients: "Gạo nếp, đậu xanh, thịt ba chỉ, lá chuối, lạt, muối, tiêu",
      tip: "Dùng sợi lạt cắt bánh thành từng khoanh, ăn cùng dưa món hoặc củ kiệu. Bánh chiên giòn cũng rất ngon.",
    },
    en: {
      name: "Cylindrical Sticky Rice Cake (Bánh tét)",
      summary:
        "Bánh tét is a cylinder of glutinous rice wrapped in banana leaves with a filling of mung bean and pork belly, the signature Tết cake of southern and central Vietnam.",
      origin:
        "Bánh tét shares the meaning of the north's square bánh chưng but is rolled into a long cylinder. Its name is thought to come from using a string to \"tét\", or slice, the cake into rounds.",
      culture:
        "In the last days of the year, families gather to wrap the cakes and stay up all night watching the pot. Bánh tét is placed on the ancestral altar and given to relatives as a sign of togetherness.",
      ingredients: "Glutinous rice, mung beans, pork belly, banana leaves, ties, salt, pepper",
      tip: "Slice it into rounds with a string and eat it with pickled vegetables or shallots. Pan-fried slices are delicious too.",
    },
  },
  {
    id: "banh-da-lon",
    region: "south",
    category: "dessert",
    image: "/foods/banh-da-lon.jpg",
    emoji: "🍮",
    vi: {
      name: "Bánh da lợn",
      summary:
        "Bánh da lợn là món bánh hấp nhiều lớp xen kẽ màu xanh lá dứa và vàng đậu xanh, dai mềm, béo mùi nước cốt dừa.",
      origin:
        "Đây là món bánh dân gian của Nam Bộ, làm từ bột năng, bột gạo và nước cốt dừa. Tên bánh xuất phát từ độ dai, mỏng của từng lớp bánh.",
      culture:
        "Trẻ con miền Nam thường thích bóc từng lớp bánh ra ăn. Các lớp bánh chồng lên nhau còn được hiểu là lời chúc cho cuộc sống ngày càng đi lên.",
      ingredients: "Bột năng, bột gạo, nước cốt dừa, lá dứa, đậu xanh, đường",
      tip: "Để bánh nguội hẳn rồi mới cắt miếng, dùng dao thoa chút dầu để lát cắt đẹp.",
    },
    en: {
      name: "Layered Steamed Cake (Bánh da lợn)",
      summary:
        "Bánh da lợn is a steamed cake of alternating green pandan and yellow mung bean layers, chewy, soft and rich with coconut milk.",
      origin:
        "It is a folk cake of southern Vietnam made from tapioca starch, rice flour and coconut milk. The name, literally \"pig skin cake\", comes from its thin, chewy layers.",
      culture:
        "Southern children love to peel the cake apart one layer at a time. The stacked layers are also seen as a wish for a life that keeps rising.",
      ingredients: "Tapioca starch, rice flour, coconut milk, pandan leaves, mung beans, sugar",
      tip: "Let the cake cool completely before cutting, using a lightly oiled knife for clean slices.",
    },
  },
  {
    id: "bun-rieu-cua",
    region: "north",
    category: "main",
    image: "/foods/bun-rieu-cua.jpg",
    emoji: "🦀",
    vi: {
      name: "Bún riêu cua",
      summary:
        "Bún riêu cua là bún ăn với nước dùng chua thanh từ cua đồng giã nhỏ, gạch cua đóng thành từng mảng riêu vàng nổi trên mặt, thêm cà chua, đậu phụ rán.",
      origin:
        "Món ăn bắt nguồn từ các làng quê đồng bằng Bắc Bộ, nơi cua đồng có sẵn ngoài ruộng lúa. Người ta giã cua, lọc lấy nước rồi đun nhỏ lửa để gạch cua kết lại thành riêu.",
      culture:
        "Bún riêu gắn với hình ảnh làng quê và những bữa cơm đạm bạc mà đậm tình. Từ món ăn nhà nông, bún riêu trở thành món ăn sáng được yêu thích ở khắp ba miền.",
      ingredients: "Bún, cua đồng, cà chua, đậu phụ, giấm bỗng hoặc me, hành lá, mắm tôm, rau sống, chuối cây, tía tô",
      tip: "Thêm chút mắm tôm và ớt, ăn kèm rau sống thái nhỏ và chuối cây để vị chua thanh hài hòa hơn.",
    },
    en: {
      name: "Crab Noodle Soup (Bún riêu cua)",
      summary:
        "Bún riêu cua is rice vermicelli in a tangy broth made from pounded paddy crabs, whose roe forms golden clusters floating on top, with tomatoes and fried tofu.",
      origin:
        "The dish comes from villages of the Red River Delta, where crabs live in the rice fields. Crabs are pounded, strained and simmered gently so the crab roe gathers into soft clusters.",
      culture:
        "Bún riêu evokes the countryside and simple yet warm family meals. From a farmer's dish it became a favorite breakfast across all three regions.",
      ingredients: "Rice vermicelli, paddy crabs, tomatoes, tofu, fermented rice vinegar or tamarind, scallions, shrimp paste, fresh herbs, banana stem, perilla",
      tip: "Add a little shrimp paste and chili, and eat it with shredded greens and banana stem to balance the sour broth.",
    },
  },
  {
    id: "bun-dau-mam-tom",
    region: "north",
    category: "main",
    image: "/foods/bun-dau-mam-tom.jpg",
    emoji: "🍢",
    vi: {
      name: "Bún đậu mắm tôm",
      summary:
        "Bún đậu mắm tôm gồm bún lá, đậu phụ rán vàng, chả cốm, thịt luộc và rau kinh giới, tía tô, chấm cùng mắm tôm đánh bông với chanh, ớt.",
      origin:
        "Món ăn là thức quà dân dã của người Hà Nội. Đậu phụ làng Mơ từng nổi tiếng nhất vì miếng đậu mịn, thơm, rán lên giòn vỏ mà vẫn mềm bên trong.",
      culture:
        "Mẹt bún đậu bày trên chiếc ghế nhựa thấp ven đường là nét quen thuộc của phố phường Hà Nội. Mắm tôm có mùi nồng nhưng lại là hồn cốt của món ăn và thử thách thú vị với du khách.",
      ingredients: "Bún lá, đậu phụ, chả cốm, thịt chân giò luộc, dồi, mắm tôm, chanh hoặc quất, ớt, kinh giới, tía tô",
      tip: "Vắt chanh vào mắm tôm, thêm chút đường và dầu nóng rồi đánh cho sủi bọt trước khi chấm.",
    },
    en: {
      name: "Tofu and Noodles with Shrimp Paste (Bún đậu mắm tôm)",
      summary:
        "Bún đậu mắm tôm is pressed rice vermicelli, golden fried tofu, green rice pork patties, boiled pork and herbs, dipped in shrimp paste whipped with lime and chili.",
      origin:
        "It is a humble Hanoi street dish. Tofu from Mơ village was once the most famous, smooth and fragrant, crispy outside and soft inside when fried.",
      culture:
        "A tray of bún đậu on a low plastic stool by the roadside is a familiar sight in Hanoi. The shrimp paste has a strong smell but is the soul of the dish and a fun challenge for visitors.",
      ingredients: "Pressed rice vermicelli, tofu, green rice pork patties, boiled pork knuckle, sausage, shrimp paste, lime or kumquat, chili, Vietnamese balm, perilla",
      tip: "Squeeze lime into the shrimp paste, add a little sugar and hot oil, and whisk until foamy before dipping.",
    },
  },
  {
    id: "thang-co",
    region: "north",
    category: "main",
    image: "/foods/thang-co.jpg",
    emoji: "🥘",
    vi: {
      name: "Thắng cố",
      summary:
        "Thắng cố là món hầm từ thịt và nội tạng ngựa hoặc bò, nấu trong chảo lớn với thảo quả, quế, hồi, sả, gừng, là món ăn đặc trưng của người H'Mông vùng cao.",
      origin:
        "Món ăn gắn với những phiên chợ vùng cao như Bắc Hà (Lào Cai), Đồng Văn (Hà Giang). Chảo thắng cố sôi lục bục từ sáng sớm để phục vụ người đi chợ từ khắp các bản làng.",
      culture:
        "Với người H'Mông, chợ phiên không chỉ để mua bán mà còn là nơi gặp gỡ. Bên chảo thắng cố và chén rượu ngô, người ta trò chuyện, kết bạn, thể hiện tinh thần cộng đồng của vùng núi.",
      ingredients: "Thịt và nội tạng ngựa hoặc bò, thảo quả, quế, hoa hồi, sả, gừng, lá chanh, muối",
      tip: "Ăn nóng giữa tiết trời se lạnh vùng cao, chấm muối ớt và thử cùng chén rượu ngô nếu bạn muốn.",
    },
    en: {
      name: "H'Mông Highland Stew (Thắng cố)",
      summary:
        "Thắng cố is a stew of horse or beef meat and offal, cooked in a huge pan with black cardamom, cinnamon, star anise, lemongrass and ginger. It is the signature dish of the H'Mông people of the northern highlands.",
      origin:
        "The dish is tied to highland markets such as Bắc Hà in Lào Cai and Đồng Văn in Hà Giang. Pans of thắng cố bubble from early morning to feed people arriving from villages all around.",
      culture:
        "For the H'Mông, market day is for meeting people as much as trading. Around the stew pan and cups of corn wine, people chat and make friends, showing the community spirit of the mountains.",
      ingredients: "Horse or beef meat and offal, black cardamom, cinnamon, star anise, lemongrass, ginger, lime leaves, salt",
      tip: "Eat it hot in the cool mountain air, dipped in chili salt, with a cup of corn wine if you like.",
    },
  },
  {
    id: "banh-dau-xanh",
    region: "north",
    category: "dessert",
    image: "/foods/banh-dau-xanh.jpg",
    emoji: "🟨",
    vi: {
      name: "Bánh đậu xanh Hải Dương",
      summary:
        "Bánh đậu xanh là những thỏi bánh vuông nhỏ làm từ đậu xanh, đường và mỡ, gói trong giấy bạc, tan ngay trong miệng với vị ngọt bùi.",
      origin:
        "Hải Dương nổi tiếng làm bánh đậu xanh từ đầu thế kỷ hai mươi. Đậu xanh được đồ chín, tán mịn, sên với đường và mỡ rồi ép khuôn.",
      culture:
        "Bánh đậu xanh là món quà biếu quen thuộc khi đi qua đất Hải Dương. Người Việt thường ăn bánh cùng chén trà nóng để vị ngọt của bánh và vị chát của trà hòa quyện.",
      ingredients: "Đậu xanh, đường, mỡ lợn hoặc dầu thực vật, hương bưởi",
      tip: "Cắn một miếng nhỏ, để bánh tan dần rồi nhấp một ngụm trà xanh nóng.",
    },
    en: {
      name: "Hải Dương Mung Bean Cake (Bánh đậu xanh)",
      summary:
        "Bánh đậu xanh are small square cakes of mung bean, sugar and fat wrapped in foil, melting in the mouth with a sweet, nutty taste.",
      origin:
        "Hải Dương has been famous for these cakes since the early twentieth century. Mung beans are steamed, mashed, cooked with sugar and fat and then pressed into moulds.",
      culture:
        "The cakes are a classic gift to bring back from Hải Dương. Vietnamese people usually enjoy them with hot tea, so the sweetness of the cake meets the slight bitterness of the tea.",
      ingredients: "Mung beans, sugar, lard or vegetable oil, pomelo flower essence",
      tip: "Take a small bite, let it melt slowly, then sip some hot green tea.",
    },
  },
  {
    id: "thit-dong",
    region: "north",
    category: "festival",
    image: "/foods/thit-dong.jpg",
    emoji: "🧊",
    vi: {
      name: "Thịt đông",
      summary:
        "Thịt đông là thịt chân giò, bì lợn nấu cùng mộc nhĩ, nấm hương rồi để nguội cho nước đông lại thành khối trong veo.",
      origin:
        "Món ăn xuất hiện trong mâm cỗ Tết của người miền Bắc, nơi tiết trời mùa đông lạnh giá giúp nước thịt tự đông lại mà không cần tủ lạnh.",
      culture:
        "Câu đối \"Thịt mỡ, dưa hành, câu đối đỏ\" nói về Tết miền Bắc, và đĩa thịt đông là món quen thuộc bên cạnh dưa hành. Món ăn gợi không khí sum họp những ngày giá rét cuối năm.",
      ingredients: "Chân giò lợn, bì lợn, mộc nhĩ, nấm hương, hạt tiêu, hành khô, nước mắm",
      tip: "Ăn lạnh cùng cơm nóng hoặc bánh chưng, thêm chút dưa hành để đỡ ngấy.",
    },
    en: {
      name: "Pork Aspic (Thịt đông)",
      summary:
        "Thịt đông is pork knuckle and skin cooked with wood ear and shiitake mushrooms, then left to cool until the broth sets into a clear jelly.",
      origin:
        "It belongs to the northern Tết feast, where the cold winter makes the broth set naturally without a refrigerator.",
      culture:
        "A northern saying sums up Tết as \"fatty pork, pickled onions and red couplets\", and a plate of thịt đông sits beside the pickles. It recalls family gatherings in the cold last days of the year.",
      ingredients: "Pork knuckle, pork skin, wood ear mushrooms, shiitake mushrooms, black pepper, shallots, fish sauce",
      tip: "Eat it cold with hot rice or bánh chưng, with pickled onions to cut the richness.",
    },
  },
  {
    id: "bun-cha-ca",
    region: "central",
    category: "main",
    image: "/foods/bun-cha-ca.jpg",
    emoji: "🐠",
    vi: {
      name: "Bún chả cá",
      summary:
        "Bún chả cá là bún ăn với chả cá biển chiên hoặc hấp, nước dùng ninh từ xương cá ngọt thanh, có bí đỏ, thơm và cà chua.",
      origin:
        "Món ăn phổ biến ở các thành phố biển miền Trung như Đà Nẵng, Quy Nhơn, Nha Trang. Chả được quết từ cá thu, cá mối, cá chuồn đánh bắt ngay ở vùng biển địa phương.",
      culture:
        "Bún chả cá phản ánh cuộc sống gắn bó với biển của người miền Trung. Mỗi thành phố có cách làm chả và nấu nước dùng riêng, tạo nên niềm tự hào địa phương.",
      ingredients: "Bún, chả cá, xương cá, bí đỏ, thơm (dứa), cà chua, hành lá, ớt, rau sống, mắm ruốc",
      tip: "Thêm chút ớt xay và mắm ruốc, ăn kèm bắp chuối và rau sống thái nhỏ.",
    },
    en: {
      name: "Fish Cake Noodle Soup (Bún chả cá)",
      summary:
        "Bún chả cá is rice vermicelli with fried or steamed sea fish cakes in a light, sweet broth simmered from fish bones with pumpkin, pineapple and tomato.",
      origin:
        "It is popular in central coastal cities such as Đà Nẵng, Quy Nhơn and Nha Trang. The fish cakes are pounded from mackerel, lizardfish or flying fish caught in local waters.",
      culture:
        "Bún chả cá reflects how closely people in central Vietnam live with the sea. Each city has its own fish cake and broth recipe, a source of local pride.",
      ingredients: "Rice vermicelli, fish cakes, fish bones, pumpkin, pineapple, tomato, scallions, chili, fresh herbs, fermented shrimp sauce",
      tip: "Add some ground chili and fermented shrimp sauce, and eat it with shredded banana blossom and herbs.",
    },
  },
  {
    id: "com-ga-hoi-an",
    region: "central",
    category: "main",
    image: "/foods/com-ga-hoi-an.jpg",
    emoji: "🍗",
    vi: {
      name: "Cơm gà Hội An",
      summary:
        "Cơm gà Hội An có hạt cơm vàng ươm nấu bằng nước luộc gà và nghệ, ăn cùng gà ta xé phay trộn hành tây, rau răm và đu đủ bóp.",
      origin:
        "Món cơm gà nổi tiếng ở phố cổ Hội An, Quảng Nam. Gà ta được luộc vừa chín, nước luộc dùng để nấu cơm cho hạt cơm tơi, thơm và béo.",
      culture:
        "Cơm gà là món ăn bình dị nhưng thể hiện sự khéo léo của người Quảng. Du khách đến Hội An thường tìm ăn cơm gà như một trải nghiệm không thể bỏ qua cùng cao lầu và mì Quảng.",
      ingredients: "Gạo, gà ta, nghệ, mỡ gà, hành tây, rau răm, đu đủ xanh, nước tương ớt",
      tip: "Trộn đều gà với rau răm, hành tây, ăn cùng cơm nóng và một chén canh đu đủ hoặc canh lòng gà.",
    },
    en: {
      name: "Hội An Chicken Rice (Cơm gà Hội An)",
      summary:
        "Cơm gà Hội An has golden rice cooked in chicken broth with turmeric, served with shredded free-range chicken tossed with onion, Vietnamese coriander and green papaya salad.",
      origin:
        "This chicken rice is famous in the old town of Hội An in Quảng Nam. The chicken is poached just until done, and the broth cooks the rice so it is fluffy, fragrant and rich.",
      culture:
        "It is a simple dish that shows the skill of Quảng Nam cooks. Visitors to Hội An seek it out together with cao lầu and mì Quảng.",
      ingredients: "Rice, free-range chicken, turmeric, chicken fat, onion, Vietnamese coriander, green papaya, chili soy sauce",
      tip: "Mix the chicken with herbs and onion, and eat with hot rice and a small bowl of chicken broth.",
    },
  },
  {
    id: "banh-bot-loc",
    region: "central",
    category: "snack",
    image: "/foods/banh-bot-loc.jpg",
    emoji: "🥟",
    vi: {
      name: "Bánh bột lọc",
      summary:
        "Bánh bột lọc có vỏ bột năng trong suốt, dai dai, bên trong là tôm đỏ và thịt ba chỉ rim mặn ngọt, gói lá chuối hoặc luộc trần.",
      origin:
        "Đây là món bánh quen thuộc của xứ Huế. Vỏ bánh làm từ bột sắn lọc nên có tên bánh bột lọc, nhìn xuyên thấy con tôm bên trong.",
      culture:
        "Bánh bột lọc cùng bánh bèo, bánh nậm tạo nên bộ ba bánh Huế nổi tiếng. Món bánh nhỏ nhắn, tinh tế đúng với phong cách ẩm thực cố đô.",
      ingredients: "Bột năng, tôm, thịt ba chỉ, hành, nước mắm, ớt, lá chuối",
      tip: "Chấm với nước mắm ớt ngọt cay, ăn khi bánh còn ấm để vỏ bánh dẻo và trong.",
    },
    en: {
      name: "Clear Tapioca Dumplings (Bánh bột lọc)",
      summary:
        "Bánh bột lọc have a clear, chewy tapioca skin around shrimp and pork belly simmered sweet and salty, either wrapped in banana leaf or boiled bare.",
      origin:
        "It is a familiar Huế snack. The skin is made from filtered cassava starch, which gives the cake its name, and you can see the red shrimp through it.",
      culture:
        "Together with bánh bèo and bánh nậm, it forms Huế's famous trio of rice cakes. These small, delicate bites match the style of the old imperial capital.",
      ingredients: "Tapioca starch, shrimp, pork belly, shallots, fish sauce, chili, banana leaves",
      tip: "Dip in sweet and spicy fish sauce, and eat while warm so the skin stays soft and clear.",
    },
  },
  {
    id: "banh-can",
    region: "central",
    category: "snack",
    image: "/foods/banh-can.jpg",
    emoji: "🍳",
    vi: {
      name: "Bánh căn",
      summary:
        "Bánh căn là những chiếc bánh bột gạo nhỏ nướng trong khuôn đất nung có nắp đậy, bên trên có trứng, tôm hoặc mực, ăn với nước mắm và mỡ hành.",
      origin:
        "Món bánh phổ biến ở vùng Nam Trung Bộ như Ninh Thuận, Khánh Hòa và lan lên Đà Lạt. Khuôn bánh bằng đất nung đặt trên bếp than là dụng cụ không thể thiếu.",
      culture:
        "Quây quần bên lò bánh căn nóng hổi vào buổi chiều là thú vui giản dị của người dân miền biển. Món bánh gắn với nghề gốm và nghề biển của địa phương.",
      ingredients: "Bột gạo, trứng, tôm, mực, hành lá, mỡ hành, nước mắm, xoài xanh, rau sống",
      tip: "Ăn ngay khi vừa lấy khỏi khuôn, chấm nước mắm hoặc nước xíu mại kèm xoài xanh bào sợi.",
    },
    en: {
      name: "Mini Rice Pancakes (Bánh căn)",
      summary:
        "Bánh căn are small rice-flour pancakes cooked in lidded clay moulds, topped with egg, shrimp or squid and served with fish sauce and scallion oil.",
      origin:
        "They are popular in south-central provinces such as Ninh Thuận and Khánh Hòa, and spread up to Đà Lạt. The clay mould set over a charcoal stove is essential.",
      culture:
        "Gathering around a hot bánh căn stove in the afternoon is a simple pleasure for coastal people. The dish is tied to local pottery and fishing.",
      ingredients: "Rice flour, eggs, shrimp, squid, scallions, scallion oil, fish sauce, green mango, fresh herbs",
      tip: "Eat them straight from the mould, dipped in fish sauce or meatball sauce with shredded green mango.",
    },
  },
  {
    id: "me-xung-hue",
    region: "central",
    category: "dessert",
    image: "/foods/me-xung-hue.jpg",
    emoji: "🍬",
    vi: {
      name: "Mè xửng Huế",
      summary:
        "Mè xửng là kẹo dẻo làm từ mạch nha, đường, đậu phộng và phủ mè rang, ngọt thơm, dai mà không dính răng.",
      origin:
        "Mè xửng là đặc sản lâu đời của Huế. Kẹo được nấu từ mạch nha, bột lọc và đường, cán mỏng, rắc mè rồi cắt thành từng miếng nhỏ.",
      culture:
        "Mè xửng là món quà quen thuộc mà du khách mang về sau chuyến đi Huế, thường được dùng để thưởng trà cùng gia đình và bạn bè.",
      ingredients: "Mạch nha, đường, bột năng, đậu phộng, mè rang",
      tip: "Ăn cùng chén trà nóng để cảm nhận vị ngọt thơm của mè và mạch nha.",
    },
    en: {
      name: "Huế Sesame Candy (Mè xửng)",
      summary:
        "Mè xửng is a chewy candy made from malt syrup, sugar and peanuts and coated in toasted sesame, sweet and fragrant without sticking to your teeth.",
      origin:
        "Mè xửng is a long-standing specialty of Huế. Malt, starch and sugar are cooked together, rolled thin, sprinkled with sesame and cut into small pieces.",
      culture:
        "It is a classic gift for visitors to bring home from Huế, often enjoyed with tea among family and friends.",
      ingredients: "Malt syrup, sugar, tapioca starch, peanuts, toasted sesame",
      tip: "Enjoy it with a cup of hot tea to bring out the aroma of sesame and malt.",
    },
  },
  {
    id: "banh-to-hoi-an",
    region: "central",
    category: "festival",
    image: "/foods/banh-to-hoi-an.jpg",
    emoji: "🎑",
    vi: {
      name: "Bánh tổ",
      summary:
        "Bánh tổ là bánh nếp hấp với đường mía, gừng và mè, có màu nâu cánh gián, dẻo ngọt, là bánh Tết đặc trưng của Quảng Nam và Hội An.",
      origin:
        "Bột nếp trộn với đường mía nấu chảy, đổ vào khuôn lót lá chuối rồi hấp nhiều giờ. Bánh có thể để được rất lâu nên phù hợp với những ngày Tết.",
      culture:
        "Tên bánh gợi nhớ đến tổ tiên, vì bánh được dâng lên bàn thờ trong những ngày Tết để tưởng nhớ ông bà. Người Quảng còn dùng bánh tổ làm quà biếu đầu năm.",
      ingredients: "Bột nếp, đường mía, gừng, mè trắng, lá chuối",
      tip: "Cắt lát mỏng ăn trực tiếp, hoặc nhúng qua bột rồi chiên giòn ăn kèm bánh tráng.",
    },
    en: {
      name: "Quảng Nam Tết Cake (Bánh tổ)",
      summary:
        "Bánh tổ is a steamed glutinous rice cake with cane sugar, ginger and sesame, amber in color, chewy and sweet. It is the signature Tết cake of Quảng Nam and Hội An.",
      origin:
        "Glutinous rice flour is mixed with melted cane sugar, poured into moulds lined with banana leaves and steamed for hours. The cake keeps for a long time, perfect for the Tết holiday.",
      culture:
        "Its name recalls the ancestors (tổ), as the cakes are placed on the altar during Tết in their memory. People in Quảng Nam also give bánh tổ as a New Year gift.",
      ingredients: "Glutinous rice flour, cane sugar, ginger, white sesame, banana leaves",
      tip: "Eat thin slices as they are, or dip them in batter and fry until crispy, served with rice crackers.",
    },
  },
  {
    id: "ruou-can",
    region: "central",
    category: "drink",
    image: "/foods/ruou-can.jpg",
    emoji: "🏺",
    vi: {
      name: "Rượu cần Tây Nguyên",
      summary:
        "Rượu cần là rượu ủ từ gạo, nếp hoặc ngô với men lá rừng trong ché sành, uống bằng những chiếc cần tre dài cắm vào miệng ché.",
      origin:
        "Rượu cần là thức uống truyền thống của các dân tộc Tây Nguyên như Ê Đê, M'Nông, Ba Na, Gia Rai. Mỗi dân tộc có bí quyết riêng về loại men lá và cách ủ.",
      culture:
        "Rượu cần luôn có mặt trong lễ hội cồng chiêng, lễ mừng lúa mới và khi đón khách quý. Mọi người cùng ngồi quanh ché, uống chung bằng cần tre, thể hiện tinh thần đoàn kết của buôn làng.",
      ingredients: "Gạo, nếp hoặc ngô, men lá rừng, nước suối, ché sành, cần tre",
      tip: "Khi được mời, hãy uống theo lượt cùng mọi người và uống có chừng mực. Người chưa đủ tuổi không nên uống rượu.",
    },
    en: {
      name: "Central Highlands Straw Wine (Rượu cần)",
      summary:
        "Rượu cần is wine fermented from rice, sticky rice or corn with forest-leaf yeast in earthenware jars, drunk through long bamboo straws placed in the jar.",
      origin:
        "It is the traditional drink of Central Highlands peoples such as the Ê Đê, M'Nông, Ba Na and Gia Rai. Each group has its own secret yeast and brewing method.",
      culture:
        "Rượu cần is always present at gong festivals, new rice celebrations and when welcoming honoured guests. Everyone sits around the jar and drinks from shared straws, expressing village unity.",
      ingredients: "Rice, sticky rice or corn, forest-leaf yeast, spring water, earthenware jar, bamboo straws",
      tip: "When invited, drink in turn with everyone and in moderation. Minors should not drink alcohol.",
    },
  },
  {
    id: "banh-pia",
    region: "south",
    category: "snack",
    image: "/foods/banh-pia.jpg",
    emoji: "🥮",
    vi: {
      name: "Bánh pía Sóc Trăng",
      summary:
        "Bánh pía có vỏ nhiều lớp mỏng xốp, nhân đậu xanh, sầu riêng và lòng đỏ trứng muối, ngọt béo, là đặc sản nổi tiếng của Sóc Trăng.",
      origin:
        "Bánh pía bắt nguồn từ cách làm bánh của người Hoa Triều Châu định cư ở Sóc Trăng. Qua thời gian, người dân thêm sầu riêng miền Tây để tạo nên hương vị riêng.",
      culture:
        "Bánh pía là minh chứng cho sự giao thoa văn hóa Việt, Hoa, Khmer ở Sóc Trăng. Món bánh thường được làm quà biếu và dùng trong các dịp lễ.",
      ingredients: "Bột mì, mỡ heo, đậu xanh, sầu riêng, trứng vịt muối, đường",
      tip: "Cắt bánh thành miếng nhỏ, ăn cùng trà nóng để cân bằng vị ngọt béo.",
    },
    en: {
      name: "Sóc Trăng Flaky Pastry (Bánh pía)",
      summary:
        "Bánh pía has a flaky, multi-layered crust filled with mung bean, durian and salted egg yolk, sweet and rich. It is a famous specialty of Sóc Trăng.",
      origin:
        "It comes from the baking traditions of Teochew Chinese settlers in Sóc Trăng. Over time locals added Mekong durian to create a flavor of their own.",
      culture:
        "Bánh pía shows the blend of Vietnamese, Chinese and Khmer cultures in Sóc Trăng. It is a popular gift and is served on festive occasions.",
      ingredients: "Wheat flour, lard, mung beans, durian, salted duck egg yolk, sugar",
      tip: "Cut it into small pieces and enjoy with hot tea to balance the richness.",
    },
  },
  {
    id: "ca-loc-nuong-trui",
    region: "south",
    category: "main",
    image: "/foods/ca-loc-nuong-trui.jpg",
    emoji: "🔥",
    vi: {
      name: "Cá lóc nướng trui",
      summary:
        "Cá lóc nướng trui là cá lóc đồng xiên que, cắm xuống đất rồi phủ rơm đốt cháy, lớp da cháy đen bên ngoài nhưng thịt bên trong trắng ngọt.",
      origin:
        "Món ăn ra đời trên những cánh đồng miền Tây mùa gặt. Người nông dân bắt cá ngoài ruộng và nướng ngay bằng rơm, không cần bếp hay gia vị.",
      culture:
        "Cá lóc nướng trui thể hiện lối sống mộc mạc, phóng khoáng của người miền Tây. Ngày nay, món ăn có mặt trong các nhà hàng như một cách giữ lại hương vị đồng quê.",
      ingredients: "Cá lóc đồng, rơm, bánh tráng, rau sống, dưa leo, khế, mắm me hoặc nước mắm me",
      tip: "Cạo bỏ lớp vảy cháy, gỡ thịt cá cuốn bánh tráng với rau sống rồi chấm mắm me.",
    },
    en: {
      name: "Straw-Grilled Snakehead Fish (Cá lóc nướng trui)",
      summary:
        "Cá lóc nướng trui is snakehead fish skewered on a stick, planted in the ground and covered with burning straw. The skin chars black while the flesh inside stays white and sweet.",
      origin:
        "The dish was born in Mekong Delta fields at harvest time. Farmers caught fish in the paddies and grilled them right there over straw, without a stove or seasoning.",
      culture:
        "It reflects the rustic, easy-going lifestyle of the Mekong Delta. Today it is served in restaurants as a way to keep the taste of the countryside.",
      ingredients: "Snakehead fish, rice straw, rice paper, fresh herbs, cucumber, star fruit, tamarind fish sauce",
      tip: "Scrape off the charred scales, flake the fish into rice paper with herbs, roll and dip in tamarind sauce.",
    },
  },
  {
    id: "bun-nuoc-leo",
    region: "south",
    category: "main",
    image: "/foods/bun-nuoc-leo.jpg",
    emoji: "🍲",
    vi: {
      name: "Bún nước lèo Sóc Trăng",
      summary:
        "Bún nước lèo có nước dùng màu vàng nhạt, nấu từ mắm bò hóc và cá lóc, thơm mùi ngải bún và sả, ăn kèm heo quay, tôm và rau sống.",
      origin:
        "Món bún bắt nguồn từ người Khmer ở Sóc Trăng và Trà Vinh. Mắm bò hóc là loại mắm cá đặc trưng của người Khmer, tạo nên hương vị riêng của nước lèo.",
      culture:
        "Bún nước lèo là món ăn kết tinh văn hóa của ba dân tộc Kinh, Hoa, Khmer cùng sinh sống ở vùng đất Sóc Trăng. Món bún thường có mặt trong các dịp lễ hội của đồng bào Khmer.",
      ingredients: "Bún, mắm bò hóc, cá lóc, ngải bún, sả, heo quay, tôm, giá, bắp chuối, rau muống chẻ",
      tip: "Thêm rau sống, bắp chuối bào và vắt chanh, ớt rồi chan nước lèo thật nóng.",
    },
    en: {
      name: "Khmer Fish Noodle Soup (Bún nước lèo)",
      summary:
        "Bún nước lèo has a pale golden broth made from Khmer fermented fish paste and snakehead fish, fragrant with fingerroot and lemongrass, served with roast pork, shrimp and fresh greens.",
      origin:
        "The dish comes from the Khmer people of Sóc Trăng and Trà Vinh. Their fermented fish paste, mắm bò hóc, gives the broth its distinctive flavor.",
      culture:
        "Bún nước lèo brings together the cultures of the Kinh, Chinese and Khmer peoples who live side by side in Sóc Trăng. It is often served at Khmer festivals.",
      ingredients: "Rice vermicelli, Khmer fermented fish paste, snakehead fish, fingerroot, lemongrass, roast pork, shrimp, bean sprouts, banana blossom, shredded water spinach",
      tip: "Add fresh greens, shredded banana blossom, lime and chili, then ladle over the piping hot broth.",
    },
  },
]

export const getDish = (id: string) => DISHES.find((d) => d.id === id)

/** Địa điểm gắn với món ăn (nơi khởi nguồn, phố/chợ nổi tiếng), dùng làm truy vấn Google Maps ở trang bản đồ */
export const DISH_PLACES: Record<string, string> = {
  "pho-bo": "Làng Vân Cù, Nam Trực, Nam Định",
  "bun-cha": "Phố Hàng Mành, Hà Nội",
  "nem-ran": "Phố cổ Hà Nội",
  "banh-cuon": "Thanh Trì, Hà Nội",
  "banh-chung": "Làng Tranh Khúc, Thanh Trì, Hà Nội",
  "bun-bo-hue": "Chợ Đông Ba, Huế",
  "mi-quang": "Làng Phú Chiêm, Điện Bàn, Quảng Nam",
  "cao-lau": "Phố cổ Hội An",
  "banh-mi": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "com-tam": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "goi-cuon": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "banh-xeo": "Ninh Kiều, Cần Thơ",
  "che-ba-mau": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "ca-phe-sua-da": "Buôn Ma Thuột, Đắk Lắk",
  "nuoc-mia": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "cha-ca-la-vong": "Phố Chả Cá, Hà Nội",
  "bun-thang": "Phố cổ Hà Nội",
  "com-lang-vong": "Làng Vòng, Cầu Giấy, Hà Nội",
  "banh-troi-banh-chay": "Đền Hùng, Phú Thọ",
  "xoi-gac": "Chợ Đồng Xuân, Hà Nội",
  "ca-phe-trung": "Cà phê Giảng, Nguyễn Hữu Huân, Hà Nội",
  "tra-sen-tay-ho": "Quảng An, Tây Hồ, Hà Nội",
  "com-hen": "Cồn Hến, Huế",
  "banh-beo": "Chợ Đông Ba, Huế",
  "nem-lui": "Chợ Đông Ba, Huế",
  "banh-it-la-gai": "Quy Nhơn, Bình Định",
  "hu-tieu-nam-vang": "Chợ Lớn, TP. Hồ Chí Minh",
  "canh-chua-ca-loc": "Ninh Kiều, Cần Thơ",
  "thit-kho-trung": "Bến Tre",
  "banh-tet": "Trà Cuôn, Cầu Kè, Trà Vinh",
  "banh-da-lon": "Chợ Bến Thành, TP. Hồ Chí Minh",
  "bun-rieu-cua": "Chợ Đồng Xuân, Hà Nội",
  "bun-dau-mam-tom": "Phố cổ Hà Nội",
  "thang-co": "Chợ Bắc Hà, Lào Cai",
  "banh-dau-xanh": "Hải Dương",
  "thit-dong": "Chợ Đồng Xuân, Hà Nội",
  "bun-cha-ca": "Chợ Cồn, Đà Nẵng",
  "com-ga-hoi-an": "Phố cổ Hội An",
  "banh-bot-loc": "Chợ Đông Ba, Huế",
  "banh-can": "Phan Rang, Ninh Thuận",
  "me-xung-hue": "Chợ Đông Ba, Huế",
  "banh-to-hoi-an": "Phố cổ Hội An",
  "ruou-can": "Buôn Đôn, Đắk Lắk",
  "banh-pia": "Vũng Thơm, Sóc Trăng",
  "ca-loc-nuong-trui": "Cao Lãnh, Đồng Tháp",
  "bun-nuoc-leo": "Sóc Trăng",
}

const REGION_FALLBACK: Record<Region, string> = { north: "Hà Nội", central: "Huế", south: "TP. Hồ Chí Minh" }
export const getDishPlace = (dish: Dish) => DISH_PLACES[dish.id] ?? REGION_FALLBACK[dish.region]

/**
 * Tọa độ gần đúng (vĩ độ, kinh độ) của các địa điểm trong DISH_PLACES, dùng để gợi ý món ăn gần người dùng.
 * Chỉ chính xác cỡ vài trăm mét đến vài km (khu phố, chợ, xã); khi thêm địa điểm mới vào DISH_PLACES hãy thêm vào đây.
 */
const PLACE_COORDS: Record<string, [number, number]> = {
  "Làng Vân Cù, Nam Trực, Nam Định": [20.37, 106.2],
  "Phố Hàng Mành, Hà Nội": [21.034, 105.8505],
  "Phố cổ Hà Nội": [21.0343, 105.851],
  "Thanh Trì, Hà Nội": [20.94, 105.85],
  "Làng Tranh Khúc, Thanh Trì, Hà Nội": [20.933, 105.857],
  "Chợ Đông Ba, Huế": [16.4695, 107.587],
  "Làng Phú Chiêm, Điện Bàn, Quảng Nam": [15.892, 108.23],
  "Phố cổ Hội An": [15.8794, 108.335],
  "Chợ Bến Thành, TP. Hồ Chí Minh": [10.7725, 106.698],
  "Ninh Kiều, Cần Thơ": [10.034, 105.788],
  "Buôn Ma Thuột, Đắk Lắk": [12.667, 108.038],
  "Phố Chả Cá, Hà Nội": [21.035, 105.849],
  "Làng Vòng, Cầu Giấy, Hà Nội": [21.042, 105.796],
  "Đền Hùng, Phú Thọ": [21.346, 105.315],
  "Chợ Đồng Xuân, Hà Nội": [21.038, 105.849],
  "Cà phê Giảng, Nguyễn Hữu Huân, Hà Nội": [21.033, 105.853],
  "Quảng An, Tây Hồ, Hà Nội": [21.069, 105.824],
  "Cồn Hến, Huế": [16.478, 107.606],
  "Quy Nhơn, Bình Định": [13.7765, 109.2237],
  "Chợ Lớn, TP. Hồ Chí Minh": [10.75, 106.662],
  "Bến Tre": [10.243, 106.375],
  "Trà Cuôn, Cầu Kè, Trà Vinh": [9.87, 106.06],
  "Chợ Bắc Hà, Lào Cai": [22.538, 104.288],
  "Hải Dương": [20.94, 106.33],
  "Chợ Cồn, Đà Nẵng": [16.068, 108.214],
  "Phan Rang, Ninh Thuận": [11.564, 108.988],
  "Buôn Đôn, Đắk Lắk": [12.91, 107.78],
  "Vũng Thơm, Sóc Trăng": [9.6, 105.98],
  "Cao Lãnh, Đồng Tháp": [10.46, 105.633],
  "Sóc Trăng": [9.603, 105.974],
  "Hà Nội": [21.0285, 105.8542],
  Huế: [16.4637, 107.5909],
  "TP. Hồ Chí Minh": [10.7769, 106.7009],
}

export const getDishCoords = (dish: Dish): [number, number] | null => PLACE_COORDS[getDishPlace(dish)] ?? null

/** Khoảng cách theo đường chim bay (km) giữa hai điểm */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h =
    Math.sin(rad(b[0] - a[0]) / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(rad(b[1] - a[1]) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}