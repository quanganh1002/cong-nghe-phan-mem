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
]

export const getDish = (id: string) => DISHES.find((d) => d.id === id)
