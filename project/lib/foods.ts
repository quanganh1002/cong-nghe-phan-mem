import type { LangCode } from "./languages"

export type Category = "main" | "drink" | "dessert" | "snack"

export interface FoodText {
  name: string
  description: string
}

export interface Food {
  id: string
  category: Category
  price: number
  image: string
  rating: number
  popular?: boolean
  isNew?: boolean
  t: Record<LangCode, FoodText>
}

/**
 * The TTS narration reads the localized name followed by its description,
 * so translations only need a name + description per language.
 */
export const FOODS: Food[] = [
  {
    id: "pho-bo",
    category: "main",
    price: 45000,
    image: "/foods/pho-bo.png",
    rating: 4.9,
    popular: true,
    t: {
      vi: {
        name: "Phở bò",
        description:
          "Phở bò là món ăn truyền thống tinh túy của ẩm thực Việt Nam, gồm bánh phở dai mềm, thịt bò tươi ngon cùng nước dùng thanh ngọt được ninh liên tục suốt 12 tiếng từ xương ống bò cùng quế, hồi và thảo quả.",
      },
      en: {
        name: "Beef Pho",
        description:
          "Beef pho is a beloved traditional Vietnamese dish made with soft rice noodles, tender slices of beef and a fragrant broth simmered for twelve hours with beef bones, cinnamon, star anise and cardamom.",
      },
      ja: {
        name: "牛肉フォー",
        description:
          "牛肉フォーはベトナムを代表する伝統料理で、柔らかい米麺、新鮮な牛肉、そして牛骨とシナモン・八角・カルダモンを12時間煮込んだ香り高いスープが特徴です。",
      },
      zh: {
        name: "牛肉河粉",
        description:
          "牛肉河粉是越南的经典传统美食，选用柔软的米粉、鲜嫩的牛肉，以及用牛骨与桂皮、八角、豆蔻熬煮十二小时的清甜高汤。",
      },
      es: {
        name: "Pho de ternera",
        description:
          "El pho de ternera es un plato tradicional vietnamita hecho con fideos de arroz suaves, tiernas rodajas de ternera y un caldo aromático cocido a fuego lento durante doce horas con huesos de res, canela y anís estrellado.",
      },
      fr: {
        name: "Pho au bœuf",
        description:
          "Le pho au bœuf est un plat vietnamien traditionnel composé de nouilles de riz moelleuses, de fines tranches de bœuf et d'un bouillon parfumé mijoté douze heures avec des os de bœuf, de la cannelle et de l'anis étoilé.",
      },
      ar: {
        name: "فو باللحم",
        description:
          "فو اللحم طبق فيتنامي تقليدي محبوب مكوّن من نودلز الأرز الطرية وشرائح اللحم الطري ومرق عطري يُطهى لمدة اثنتي عشرة ساعة مع عظام البقر والقرفة واليانسون النجمي.",
      },
      pt: {
        name: "Pho de carne",
        description:
          "O pho de carne é um prato tradicional vietnamita feito com macarrão de arroz macio, fatias tenras de carne e um caldo aromático cozido por doze horas com ossos, canela e anis-estrelado.",
      },
      ru: {
        name: "Фо с говядиной",
        description:
          "Фо с говядиной — традиционное вьетнамское блюдо из мягкой рисовой лапши, нежных ломтиков говядины и ароматного бульона, который варят двенадцать часов с говяжьими костями, корицей и бадьяном.",
      },
      hi: {
        name: "बीफ़ फो",
        description:
          "बीफ़ फो एक प्रिय पारंपरिक वियतनामी व्यंजन है जिसमें नरम चावल के नूडल्स, कोमल बीफ़ के टुकड़े और बारह घंटे तक हड्डियों, दालचीनी व चक्रफूल के साथ पकाया गया सुगंधित शोरबा होता है।",
      },
    },
  },
  {
    id: "com-tam",
    category: "main",
    price: 40000,
    image: "/foods/com-tam.png",
    rating: 4.8,
    popular: true,
    t: {
      vi: {
        name: "Cơm tấm",
        description:
          "Cơm tấm sườn nướng là đặc sản Sài Gòn với hạt cơm tấm thơm dẻo, sườn heo nướng đậm đà, trứng ốp la và đồ chua ăn kèm nước mắm chua ngọt.",
      },
      en: {
        name: "Broken Rice",
        description:
          "Broken rice with grilled pork is a Saigon specialty featuring fragrant rice, savoury marinated pork chop, a fried egg and pickles served with sweet-and-sour fish sauce.",
      },
      ja: {
        name: "コムタム",
        description:
          "コムタムはサイゴンの名物で、香り高い砕き米に味付けした焼き豚、目玉焼き、漬物を添え、甘酸っぱいヌクマムでいただきます。",
      },
      zh: {
        name: "越南碎米饭",
        description:
          "烤猪排碎米饭是西贡特色，香糯的碎米配上入味的烤猪排、煎蛋和腌菜，佐以酸甜鱼露。",
      },
      es: {
        name: "Arroz partido",
        description:
          "El arroz partido con cerdo a la parrilla es una especialidad de Saigón con arroz aromático, chuleta de cerdo marinada, un huevo frito y encurtidos con salsa de pescado agridulce.",
      },
      fr: {
        name: "Riz brisé",
        description:
          "Le riz brisé au porc grillé est une spécialité de Saïgon avec du riz parfumé, une côte de porc marinée, un œuf au plat et des légumes marinés servis avec une sauce de poisson aigre-douce.",
      },
      ar: {
        name: "أرز مكسور",
        description:
          "الأرز المكسور مع لحم الخنزير المشوي طبق شهير من سايغون يتكوّن من أرز عطري وشريحة لحم متبّلة وبيضة مقلية ومخللات تُقدّم مع صلصة السمك الحلوة الحامضة.",
      },
      pt: {
        name: "Arroz quebrado",
        description:
          "O arroz quebrado com porco grelhado é uma especialidade de Saigon com arroz aromático, costeleta de porco marinada, ovo frito e picles servidos com molho de peixe agridoce.",
      },
      ru: {
        name: "Дроблёный рис",
        description:
          "Дроблёный рис со свининой-гриль — фирменное блюдо Сайгона: ароматный рис, маринованная свиная отбивная, жареное яйцо и пикули с кисло-сладким рыбным соусом.",
      },
      hi: {
        name: "ब्रोकन राइस",
        description:
          "ग्रिल्ड पोर्क के साथ ब्रोकन राइस साइगॉन की खासियत है, जिसमें सुगंधित चावल, मसालेदार पोर्क चॉप, तला अंडा और अचार खट्टी-मीठी फिश सॉस के साथ परोसे जाते हैं।",
      },
    },
  },
  {
    id: "bun-cha",
    category: "main",
    price: 50000,
    image: "/foods/bun-cha.png",
    rating: 4.9,
    popular: true,
    t: {
      vi: {
        name: "Bún chả",
        description:
          "Bún chả Hà Nội gồm thịt heo nướng than hoa thơm lừng, ăn kèm bún tươi, rau sống và bát nước chấm chua ngọt đặc trưng của thủ đô.",
      },
      en: {
        name: "Bun Cha",
        description:
          "Hanoi bun cha features charcoal-grilled pork patties served with fresh rice vermicelli, herbs and the capital's signature sweet-and-sour dipping sauce.",
      },
      ja: {
        name: "ブンチャー",
        description:
          "ハノイのブンチャーは炭火で焼いた香ばしい豚肉に、米麺・生野菜・首都特有の甘酸っぱいつけダレを合わせた一品です。",
      },
      zh: {
        name: "烤肉米线",
        description:
          "河内烤肉米线以炭火烤制的香嫩猪肉配上新鲜米线、生菜和首都特色的酸甜蘸汁。",
      },
      es: {
        name: "Bun Cha",
        description:
          "El bun cha de Hanói ofrece albóndigas de cerdo a la brasa servidas con fideos de arroz frescos, hierbas y la típica salsa agridulce de la capital.",
      },
      fr: {
        name: "Bun Cha",
        description:
          "Le bun cha de Hanoï propose des boulettes de porc grillées au charbon, servies avec des vermicelles de riz frais, des herbes et la sauce aigre-douce emblématique de la capitale.",
      },
      ar: {
        name: "بون تشا",
        description:
          "بون تشا الهانوية أقراص لحم خنزير مشوية على الفحم تُقدّم مع شعيرية الأرز الطازجة والأعشاب وصلصة الغمس الحلوة الحامضة الشهيرة في العاصمة.",
      },
      pt: {
        name: "Bun Cha",
        description:
          "O bun cha de Hanói traz almôndegas de porco grelhadas na brasa servidas com macarrão de arroz fresco, ervas e o molho agridoce típico da capital.",
      },
      ru: {
        name: "Бун ча",
        description:
          "Ханойский бун ча — котлеты из свинины на углях с рисовой вермишелью, зеленью и фирменным кисло-сладким соусом столицы.",
      },
      hi: {
        name: "बुन चा",
        description:
          "हनोई बुन चा में कोयले पर ग्रिल किए पोर्क पैटीज़ को ताज़ा राइस वर्मिसेली, जड़ी-बूटियों और राजधानी की खास खट्टी-मीठी डिपिंग सॉस के साथ परोसा जाता है।",
      },
    },
  },
  {
    id: "nem-ran",
    category: "snack",
    price: 35000,
    image: "/foods/nem-ran.png",
    rating: 4.7,
    isNew: true,
    t: {
      vi: {
        name: "Nem rán Hà Nội",
        description:
          "Nem rán giòn rụm với nhân thịt heo, mộc nhĩ, miến và rau củ, cuốn trong bánh đa nem rồi chiên vàng, chấm cùng nước mắm chua ngọt.",
      },
      en: {
        name: "Fried Spring Rolls",
        description:
          "Crispy fried spring rolls filled with pork, wood ear mushrooms, glass noodles and vegetables, wrapped in rice paper and fried golden, served with sweet-and-sour fish sauce.",
      },
      ja: {
        name: "揚げ春巻き",
        description:
          "豚肉・きくらげ・春雨・野菜を米の皮で包んで黄金色に揚げたサクサクの春巻き。甘酸っぱいヌクマムでどうぞ。",
      },
      zh: {
        name: "炸春卷",
        description:
          "酥脆的炸春卷内含猪肉、木耳、粉丝和蔬菜，用米纸包裹后炸至金黄，搭配酸甜鱼露享用。",
      },
      es: {
        name: "Rollitos fritos",
        description:
          "Crujientes rollitos fritos rellenos de cerdo, hongos, fideos de cristal y verduras, envueltos en papel de arroz y fritos hasta dorar, con salsa de pescado agridulce.",
      },
      fr: {
        name: "Nems frits",
        description:
          "Nems croustillants garnis de porc, champignons noirs, vermicelles et légumes, roulés dans une galette de riz et frits jusqu'à dorer, servis avec une sauce aigre-douce.",
      },
      ar: {
        name: "لفائف مقلية",
        description:
          "لفائف مقرمشة محشوة باللحم والفطر والشعيرية الزجاجية والخضار، ملفوفة بورق الأرز ومقلية حتى تذهب، تُقدّم مع صلصة السمك الحلوة الحامضة.",
      },
      pt: {
        name: "Rolinhos fritos",
        description:
          "Rolinhos fritos crocantes recheados com porco, cogumelos, macarrão de vidro e legumes, enrolados em papel de arroz e fritos até dourar, com molho de peixe agridoce.",
      },
      ru: {
        name: "Жареные спринг-роллы",
        description:
          "Хрустящие жареные роллы с начинкой из свинины, древесных грибов, стеклянной лапши и овощей в рисовой бумаге, обжаренные до золотистого цвета, с кисло-сладким соусом.",
      },
      hi: {
        name: "फ्राइड स्प्रिंग रोल",
        description:
          "कुरकुरे तले स्प्रिंग रोल जिनमें पोर्क, मशरूम, ग्लास नूडल्स और सब्ज़ियाँ भरी होती हैं, राइस पेपर में लपेटकर सुनहरा तला जाता है, खट्टी-मीठी फिश सॉस के साथ।",
      },
    },
  },
  {
    id: "banh-mi",
    category: "snack",
    price: 25000,
    image: "/foods/banh-mi.png",
    rating: 4.8,
    popular: true,
    t: {
      vi: {
        name: "Bánh mì",
        description:
          "Bánh mì Việt Nam với vỏ bánh giòn tan, kẹp pate, thịt nguội, đồ chua, dưa leo và rau mùi, rưới chút nước sốt đậm đà.",
      },
      en: {
        name: "Banh Mi",
        description:
          "The Vietnamese banh mi has a crispy baguette filled with pâté, cold cuts, pickled vegetables, cucumber and cilantro, finished with a savoury sauce.",
      },
      ja: {
        name: "バインミー",
        description:
          "外はカリッとしたバゲットにパテ、ハム、なます、きゅうり、パクチーを挟み、コクのあるソースを効かせたベトナムのサンドイッチです。",
      },
      zh: {
        name: "越式法包",
        description:
          "越南法包外皮酥脆，夹入肝酱、冷切肉、腌菜、黄瓜和香菜，再淋上浓郁的酱汁。",
      },
      es: {
        name: "Banh Mi",
        description:
          "El banh mi vietnamita es una baguette crujiente rellena de paté, fiambres, verduras encurtidas, pepino y cilantro, con una salsa sabrosa.",
      },
      fr: {
        name: "Banh Mi",
        description:
          "Le banh mi vietnamien est une baguette croustillante garnie de pâté, charcuterie, légumes marinés, concombre et coriandre, relevée d'une sauce savoureuse.",
      },
      ar: {
        name: "بان مي",
        description:
          "البان مي الفيتنامي رغيف مقرمش محشو بالباتيه واللحوم الباردة والخضار المخللة والخيار والكزبرة مع صلصة لذيذة.",
      },
      pt: {
        name: "Banh Mi",
        description:
          "O banh mi vietnamita é uma baguete crocante recheada com patê, frios, legumes em conserva, pepino e coentro, com um molho saboroso.",
      },
      ru: {
        name: "Бань ми",
        description:
          "Вьетнамский бань ми — хрустящий багет с паштетом, мясной нарезкой, маринованными овощами, огурцом и кинзой под насыщенным соусом.",
      },
      hi: {
        name: "बान मी",
        description:
          "वियतनामी बान मी एक कुरकुरी बैगेट है जिसमें पाटे, कोल्ड कट्स, अचारी सब्ज़ियाँ, खीरा और धनिया भरा होता है, ऊपर से स्वादिष्ट सॉस के साथ।",
      },
    },
  },
  {
    id: "goi-cuon",
    category: "snack",
    price: 30000,
    image: "/foods/goi-cuon.png",
    rating: 4.6,
    isNew: true,
    t: {
      vi: {
        name: "Gỏi cuốn",
        description:
          "Gỏi cuốn tươi mát với tôm, thịt, bún, rau sống cuốn trong bánh tráng mỏng, chấm cùng tương đậu phộng béo ngậy.",
      },
      en: {
        name: "Fresh Spring Rolls",
        description:
          "Refreshing fresh spring rolls with shrimp, pork, vermicelli and herbs wrapped in thin rice paper, served with a creamy peanut dipping sauce.",
      },
      ja: {
        name: "生春巻き",
        description:
          "エビ・豚肉・米麺・生野菜を薄いライスペーパーで包んださっぱりとした生春巻き。濃厚なピーナッツソースでどうぞ。",
      },
      zh: {
        name: "越式春卷",
        description:
          "清爽的越式鲜春卷，用薄米纸包裹虾仁、猪肉、米粉和生菜，搭配香浓花生酱。",
      },
      es: {
        name: "Rollitos frescos",
        description:
          "Refrescantes rollitos frescos con camarón, cerdo, fideos y hierbas envueltos en papel de arroz fino, con una cremosa salsa de cacahuete.",
      },
      fr: {
        name: "Rouleaux de printemps",
        description:
          "Rouleaux de printemps frais et légers avec crevettes, porc, vermicelles et herbes enroulés dans une fine galette de riz, servis avec une sauce crémeuse aux cacahuètes.",
      },
      ar: {
        name: "لفائف طازجة",
        description:
          "لفائف طازجة منعشة بالروبيان ولحم الخنزير والشعيرية والأعشاب ملفوفة بورق أرز رقيق، تُقدّم مع صلصة الفول السوداني الكريمية.",
      },
      pt: {
        name: "Rolinhos frescos",
        description:
          "Rolinhos frescos e leves com camarão, porco, macarrão e ervas enrolados em papel de arroz fino, servidos com um cremoso molho de amendoim.",
      },
      ru: {
        name: "Свежие спринг-роллы",
        description:
          "Освежающие роллы с креветками, свининой, вермишелью и зеленью в тонкой рисовой бумаге, с нежным арахисовым соусом.",
      },
      hi: {
        name: "फ्रेश स्प्रिंग रोल",
        description:
          "ताज़गी भरे फ्रेश स्प्रिंग रोल जिनमें झींगा, पोर्क, वर्मिसेली और जड़ी-बूटियाँ पतले राइस पेपर में लिपटी होती हैं, मलाईदार पीनट सॉस के साथ।",
      },
    },
  },
  {
    id: "ca-phe-sua-da",
    category: "drink",
    price: 20000,
    image: "/foods/ca-phe-sua-da.png",
    rating: 4.9,
    popular: true,
    t: {
      vi: {
        name: "Cà phê sữa đá",
        description:
          "Cà phê sữa đá đậm đà pha phin truyền thống, hòa quyện cùng sữa đặc ngọt béo và đá mát lạnh, thức uống biểu tượng của Việt Nam.",
      },
      en: {
        name: "Iced Milk Coffee",
        description:
          "Bold Vietnamese iced milk coffee brewed with a traditional phin filter, blended with sweet condensed milk and plenty of ice — an iconic Vietnamese drink.",
      },
      ja: {
        name: "ベトナムアイスミルクコーヒー",
        description:
          "伝統的なフィンで淹れた濃厚なコーヒーに、甘い練乳とたっぷりの氷を合わせたベトナムを象徴するドリンクです。",
      },
      zh: {
        name: "越南冰牛奶咖啡",
        description:
          "用传统滴滤壶冲泡的浓郁咖啡，加入香甜炼乳与冰块调和，是越南的标志性饮品。",
      },
      es: {
        name: "Café con leche helado",
        description:
          "Intenso café vietnamita helado preparado con un filtro phin tradicional, mezclado con leche condensada dulce y mucho hielo, una bebida icónica de Vietnam.",
      },
      fr: {
        name: "Café glacé au lait",
        description:
          "Café vietnamien glacé et corsé préparé avec un filtre phin traditionnel, mêlé de lait concentré sucré et de glaçons, une boisson emblématique du Vietnam.",
      },
      ar: {
        name: "قهوة مثلجة بالحليب",
        description:
          "قهوة فيتنامية مثلجة غنية تُحضَّر بمرشّح الفِن التقليدي وتُمزج بالحليب المكثّف المحلّى والكثير من الثلج، مشروب فيتنامي أيقوني.",
      },
      pt: {
        name: "Café gelado com leite",
        description:
          "Café vietnamita gelado e intenso preparado com o filtro phin tradicional, misturado com leite condensado doce e bastante gelo, uma bebida icônica do Vietnã.",
      },
      ru: {
        name: "Кофе со льдом и молоком",
        description:
          "Насыщенный вьетнамский кофе со льдом, заваренный в традиционном фильтре фин, со сгущённым молоком и большим количеством льда — культовый напиток Вьетнама.",
      },
      hi: {
        name: "आइस्ड मिल्क कॉफ़ी",
        description:
          "पारंपरिक फिन फ़िल्टर से बनी गाढ़ी वियतनामी आइस्ड कॉफ़ी, मीठे कंडेंस्ड मिल्क और खूब बर्फ़ के साथ — वियतनाम का प्रतीक पेय।",
      },
    },
  },
  {
    id: "tra-dao",
    category: "drink",
    price: 30000,
    image: "/foods/tra-dao.png",
    rating: 4.7,
    t: {
      vi: {
        name: "Trà đào",
        description:
          "Trà đào cam sả thơm mát với những miếng đào giòn ngọt, hương trà thanh nhẹ và chút sả cam sảng khoái, giải nhiệt tuyệt vời.",
      },
      en: {
        name: "Peach Tea",
        description:
          "Refreshing peach lemongrass tea with crunchy sweet peach slices, light tea aroma and a hint of citrus lemongrass — perfectly cooling.",
      },
      ja: {
        name: "ピーチティー",
        description:
          "甘くてシャキッとした桃の果肉に、軽やかな紅茶の香りとレモングラスの爽やかさを合わせた、清涼感あふれるピーチティーです。",
      },
      zh: {
        name: "蜜桃茶",
        description:
          "清爽的香茅蜜桃茶，配上香甜爽脆的桃块，淡淡茶香与柠檬香茅的清新，消暑怡人。",
      },
      es: {
        name: "Té de melocotón",
        description:
          "Refrescante té de melocotón y hierba limón con trozos de melocotón dulces y crujientes, un ligero aroma a té y un toque cítrico, perfecto para refrescar.",
      },
      fr: {
        name: "Thé à la pêche",
        description:
          "Thé rafraîchissant à la pêche et à la citronnelle avec des morceaux de pêche sucrés et croquants, un arôme de thé léger et une touche d'agrumes.",
      },
      ar: {
        name: "شاي الخوخ",
        description:
          "شاي الخوخ المنعش بعشب الليمون مع شرائح خوخ حلوة ومقرمشة ونكهة شاي خفيفة ولمسة حمضية، مثالي للانتعاش.",
      },
      pt: {
        name: "Chá de pêssego",
        description:
          "Refrescante chá de pêssego com capim-limão, pedaços de pêssego doces e crocantes, leve aroma de chá e um toque cítrico, perfeito para refrescar.",
      },
      ru: {
        name: "Персиковый чай",
        description:
          "Освежающий персиковый чай с лемонграссом, сладкими хрустящими дольками персика, лёгким чайным ароматом и цитрусовой ноткой.",
      },
      hi: {
        name: "पीच टी",
        description:
          "ताज़गी भरी पीच लेमनग्रास चाय जिसमें मीठे कुरकुरे आड़ू के टुकड़े, हल्की चाय की खुशबू और सिट्रस लेमनग्रास का स्पर्श होता है।",
      },
    },
  },
  {
    id: "nuoc-mia",
    category: "drink",
    price: 15000,
    image: "/foods/nuoc-mia.png",
    rating: 4.5,
    t: {
      vi: {
        name: "Nước mía",
        description:
          "Nước mía nguyên chất ép tươi, ngọt thanh tự nhiên, thêm chút tắc chua nhẹ và đá lạnh, giải khát dân dã quen thuộc.",
      },
      en: {
        name: "Sugarcane Juice",
        description:
          "Freshly pressed pure sugarcane juice, naturally sweet with a squeeze of kumquat and plenty of ice — a beloved everyday thirst quencher.",
      },
      ja: {
        name: "サトウキビジュース",
        description:
          "搾りたての純粋なサトウキビジュース。自然な甘さにキンカンの酸味と氷を加えた、庶民に愛される定番ドリンクです。",
      },
      zh: {
        name: "甘蔗汁",
        description:
          "现榨纯甘蔗汁，天然清甜，加入少许金桔和冰块，是深受喜爱的日常解渴饮品。",
      },
      es: {
        name: "Jugo de caña",
        description:
          "Jugo de caña de azúcar recién prensado, naturalmente dulce con un toque de kumquat y mucho hielo, un refresco cotidiano muy querido.",
      },
      fr: {
        name: "Jus de canne",
        description:
          "Jus de canne à sucre fraîchement pressé, naturellement sucré avec une pointe de kumquat et beaucoup de glace, une boisson désaltérante très appréciée.",
      },
      ar: {
        name: "عصير قصب",
        description:
          "عصير قصب السكر الطازج النقي، حلو بشكل طبيعي مع رشّة من الكمكوات والكثير من الثلج، مشروب منعش محبوب يومياً.",
      },
      pt: {
        name: "Caldo de cana",
        description:
          "Caldo de cana puro e prensado na hora, naturalmente doce com um toque de kumquat e bastante gelo, uma bebida refrescante muito querida.",
      },
      ru: {
        name: "Сок сахарного тростника",
        description:
          "Свежевыжатый чистый сок сахарного тростника, естественно сладкий, с кумкватом и льдом — любимый повседневный освежающий напиток.",
      },
      hi: {
        name: "गन्ने का रस",
        description:
          "ताज़ा निचोड़ा शुद्ध गन्ने का रस, प्राकृतिक रूप से मीठा, थोड़े कमक्वाट और खूब बर्फ़ के साथ — एक प्रिय रोज़मर्रा का ताज़गी भरा पेय।",
      },
    },
  },
  {
    id: "che-ba-mau",
    category: "dessert",
    price: 25000,
    image: "/foods/che-ba-mau.png",
    rating: 4.6,
    t: {
      vi: {
        name: "Chè ba màu",
        description:
          "Chè ba màu mát lạnh với đậu đỏ bùi, thạch xanh dai, đậu xanh mịn, phủ nước cốt dừa béo ngậy và đá bào.",
      },
      en: {
        name: "Three-Color Dessert",
        description:
          "A cooling three-color sweet soup with nutty red beans, chewy green jelly, smooth mung bean and rich coconut milk over shaved ice.",
      },
      ja: {
        name: "三色チェー",
        description:
          "小豆・緑のゼリー・緑豆に濃厚なココナッツミルクとかき氷を合わせた、ひんやり爽やかな三色スイーツです。",
      },
      zh: {
        name: "三色甜品",
        description:
          "清凉的三色甜品，有香浓红豆、爽滑绿色果冻、细腻绿豆，浇上香浓椰浆和刨冰。",
      },
      es: {
        name: "Postre tres colores",
        description:
          "Un refrescante postre de tres colores con frijoles rojos, gelatina verde masticable, judía mungo suave y cremosa leche de coco sobre hielo picado.",
      },
      fr: {
        name: "Dessert tricolore",
        description:
          "Un dessert tricolore rafraîchissant avec haricots rouges, gelée verte moelleuse, haricot mungo onctueux et lait de coco crémeux sur glace pilée.",
      },
      ar: {
        name: "حلوى ثلاثية الألوان",
        description:
          "حلوى منعشة ثلاثية الألوان بالفاصولياء الحمراء والهلام الأخضر المطاطي وفول المونغ الناعم وحليب جوز الهند الغني فوق الثلج المجروش.",
      },
      pt: {
        name: "Sobremesa três cores",
        description:
          "Uma refrescante sobremesa de três cores com feijão vermelho, geleia verde, feijão mungo cremoso e leite de coco sobre gelo picado.",
      },
      ru: {
        name: "Трёхцветный десерт",
        description:
          "Освежающий трёхцветный десерт с красной фасолью, тягучим зелёным желе, нежным машем и насыщенным кокосовым молоком со льдом.",
      },
      hi: {
        name: "तीन-रंग मिठाई",
        description:
          "ठंडी तीन-रंग वाली मिठाई जिसमें लाल बीन्स, चबाने वाली हरी जेली, मुलायम मूंग और गाढ़ा नारियल दूध बर्फ़ के ऊपर होता है।",
      },
    },
  },
  {
    id: "banh-flan",
    category: "dessert",
    price: 20000,
    image: "/foods/banh-flan.png",
    rating: 4.8,
    t: {
      vi: {
        name: "Bánh flan",
        description:
          "Bánh flan mềm mịn tan trong miệng, vị trứng sữa béo ngậy phủ lớp caramel đắng nhẹ, món tráng miệng kinh điển.",
      },
      en: {
        name: "Caramel Flan",
        description:
          "Silky smooth caramel flan that melts in your mouth, with a rich egg-and-milk custard topped by a lightly bitter caramel — a classic dessert.",
      },
      ja: {
        name: "カラメルプリン",
        description:
          "口の中でとろけるなめらかなプリン。濃厚な卵と牛乳のカスタードに、ほろ苦いカラメルをかけた定番デザートです。",
      },
      zh: {
        name: "焦糖布丁",
        description:
          "入口即化的顺滑焦糖布丁，浓郁的蛋奶布丁淋上微苦焦糖，是经典甜点。",
      },
      es: {
        name: "Flan de caramelo",
        description:
          "Flan de caramelo suave y sedoso que se derrite en la boca, con un cremoso flan de huevo y leche coronado por un caramelo ligeramente amargo.",
      },
      fr: {
        name: "Flan au caramel",
        description:
          "Flan au caramel onctueux qui fond en bouche, avec une crème aux œufs et au lait nappée d'un caramel légèrement amer, un dessert classique.",
      },
      ar: {
        name: "فلان بالكراميل",
        description:
          "فلان كراميل ناعم ينساب في الفم، بكاسترد غني من البيض والحليب يعلوه كراميل مرّ قليلاً، حلوى كلاسيكية.",
      },
      pt: {
        name: "Pudim de caramelo",
        description:
          "Pudim de caramelo sedoso que derrete na boca, com um creme rico de ovos e leite coberto por um caramelo levemente amargo, uma sobremesa clássica.",
      },
      ru: {
        name: "Карамельный флан",
        description:
          "Нежный карамельный флан, тающий во рту: насыщенный яично-молочный крем под слегка горьковатой карамелью — классический десерт.",
      },
      hi: {
        name: "कैरमल फ्लैन",
        description:
          "मुँह में घुल जाने वाला रेशमी कैरमल फ्लैन, गाढ़े अंडा-दूध कस्टर्ड पर हल्की कड़वी कैरमल की परत — एक क्लासिक मिठाई।",
      },
    },
  },
  {
    id: "kem-chuoi",
    category: "dessert",
    price: 18000,
    image: "/foods/kem-chuoi.png",
    rating: 4.5,
    isNew: true,
    t: {
      vi: {
        name: "Kem chuối",
        description:
          "Kem chuối mát lạnh với chuối chín ngọt, nước cốt dừa béo, rắc đậu phộng rang giòn và dừa nạo, món vặt tuổi thơ.",
      },
      en: {
        name: "Frozen Banana",
        description:
          "A cooling frozen banana treat with sweet ripe banana, creamy coconut milk, crushed roasted peanuts and shredded coconut — a childhood favourite.",
      },
      ja: {
        name: "バナナアイス",
        description:
          "熟した甘いバナナに濃厚なココナッツミルク、香ばしいピーナッツとココナッツを散らした、懐かしい冷たいおやつです。",
      },
      zh: {
        name: "香蕉冰",
        description:
          "清凉的香蕉冰，用香甜熟香蕉配上浓郁椰浆，撒上香脆花生和椰丝，是童年最爱的小吃。",
      },
      es: {
        name: "Plátano helado",
        description:
          "Un refrescante plátano helado con plátano maduro dulce, cremosa leche de coco, cacahuetes tostados y coco rallado, un favorito de la infancia.",
      },
      fr: {
        name: "Banane glacée",
        description:
          "Une banane glacée rafraîchissante avec banane bien mûre, lait de coco crémeux, cacahuètes grillées concassées et noix de coco râpée, un régal d'enfance.",
      },
      ar: {
        name: "موز مثلّج",
        description:
          "حلوى موز مثلّجة منعشة بالموز الناضج الحلو وحليب جوز الهند الكريمي والفول السوداني المحمّص وجوز الهند المبشور، من حلويات الطفولة المفضلة.",
      },
      pt: {
        name: "Banana congelada",
        description:
          "Uma refrescante banana congelada com banana madura doce, leite de coco cremoso, amendoim torrado e coco ralado, uma delícia da infância.",
      },
      ru: {
        name: "Замороженный банан",
        description:
          "Освежающий десерт из замороженного банана со спелым сладким бананом, кокосовым молоком, жареным арахисом и кокосовой стружкой — любимое лакомство детства.",
      },
      hi: {
        name: "फ्रोज़न बनाना",
        description:
          "ठंडा फ्रोज़न बनाना ट्रीट जिसमें मीठा पका केला, मलाईदार नारियल दूध, भुनी मूंगफली और कद्दूकस नारियल होता है — बचपन का पसंदीदा।",
      },
    },
  },
]

export const CATEGORIES: { key: Category; icon: string }[] = [
  { key: "main", icon: "🍜" },
  { key: "drink", icon: "🥤" },
  { key: "dessert", icon: "🍰" },
  { key: "snack", icon: "🍟" },
]

export function getFood(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id)
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫"
}
