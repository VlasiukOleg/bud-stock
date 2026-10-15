import type { Product } from "~/types";

const mockItems = [
  // Суміші та цемент
  { title: "Штукатурка Knauf MP-75 гіпсова 30кг", category: "c1-1", unit: "мішок" },
  { title: "Шпаклівка Knauf Multi-Finish 25кг", category: "c1-2", unit: "мішок" },
  { title: "Шпаклівка фінішна Semin Fibrelastic 5кг", category: "c1-2", unit: "відро" },
  { title: "Клей для плитки Ceresit CM 117 25кг", category: "c1-3", unit: "мішок" },
  { title: "Клей для газоблоку Стоунлайт Літо 20кг", category: "c1-5", unit: "мішок" },
  { title: "Стяжка підлоги Siltek F-20 25кг", category: "c1-4", unit: "мішок" },
  { title: "Самовирівнювальна підлога Ceresit CN 69 25кг", category: "c1-4", unit: "мішок" },
  { title: "Цемент М-500 Дікергофф ПЦ I-500 25кг", category: "c1-6", unit: "мішок" },

  // Гіпсокартон, профілі, стелі
  { title: "Гіпсокартон Knauf стіновий 12.5мм 1.2х2.5м", category: "c2-1", unit: "лист" },
  { title: "Гіпсокартон Knauf вологостійкий 12.5мм 1.2х2.5м", category: "c2-1", unit: "лист" },
  { title: "Профіль CD-60 Knauf 0.6мм 3м", category: "c2-2", unit: "шт" },
  { title: "Профіль UD-27 Knauf 0.6мм 3м", category: "c2-2", unit: "шт" },
  { title: "Профіль стієчний CW-75 3м", category: "c2-2", unit: "шт" },
  { title: "Підвіс прямий ЕС 60/125 0.8мм (пешка)", category: "c2-3", unit: "шт" },
  { title: "З'єднувач однорівневий КРАБ 60х27", category: "c2-3", unit: "шт" },
  { title: "Маяк штукатурний 6мм оцинкований 3м", category: "c2-4", unit: "шт" },
  { title: "Кутник перфорований алюмінієвий 25х25 3м", category: "c2-4", unit: "шт" },
  { title: "Склополотно Wellton паутинка W40 50м²", category: "c2-5", unit: "рулон" },
  { title: "Стрічка для швів паперова Knauf Kurt 75м", category: "c2-5", unit: "рулон" },
  { title: "Стрічка армуюча серп'янка 45мм х 90м", category: "c2-5", unit: "рулон" },
  { title: "Плита підвісної стелі Armstrong Bajkal 600х600", category: "c2-6", unit: "упак" },
  { title: "Профіль підвісної стелі Kraft Fortis T-24 3.6м", category: "c2-6", unit: "шт" },

  // Ізоляція, мембрани, покрівля
  { title: "Мінеральна вата Izovat 30 100мм 3м²", category: "c3-1", unit: "упак" },
  { title: "Базальтова вата Rockwool Frontrock Super 100мм", category: "c3-1", unit: "упак" },
  { title: "Мінеральна вата Knauf Insulation Теплорулон 041 18м²", category: "c3-1", unit: "рулон" },
  { title: "Пінопласт Hirsch EPS 60 1000х500х50мм", category: "c3-2", unit: "упак" },
  { title: "Екструдований пінополістирол Penoboard XPS 50мм", category: "c3-2", unit: "лист" },
  { title: "Екструдований пінополістирол Карболекс Еко XPS 30мм", category: "c3-2", unit: "лист" },
  { title: "Гідроізоляція мастика Knauf Flachendicht 5кг", category: "c3-3", unit: "відро" },
  { title: "Бітумна мастика Nexler Askowil Gont 10кг", category: "c3-3", unit: "відро" },
  { title: "Супердифузійна мембрана Mastermax 3 Classic 135г 75м²", category: "c3-4", unit: "рулон" },
  { title: "Паробар'єр армований Juta H110 75м²", category: "c3-4", unit: "рулон" },
  { title: "Гідробар'єр підпокрівельний Juta Д90 75м²", category: "c3-4", unit: "рулон" },
  { title: "Шиповидна геомембрана Drainfol 400 2х20м", category: "c3-4", unit: "рулон" },
  { title: "Звукоізоляційна стрічка Knauf Діхтунгсбанд 50мм 30м", category: "c3-5", unit: "рулон" },

  // Плитка, підлога, ламінат
  { title: "Керамограніт Gres Cersanit 60х60 сірий", category: "c4-2", unit: "м²" },
  { title: "Плитка для ванної Golden Tile 30х60 біла", category: "c4-1", unit: "м²" },
  { title: "Ламінат SPC 33 клас дуб натуральний", category: "c4-5", unit: "м²" },
  { title: "Затирка для плитки Ceresit CE 40 антрацит 2кг", category: "c4-4", unit: "відро" },
  { title: "Підкладка під ламінат полотно ППЕ 3мм 50м²", category: "c4-6", unit: "рулон" },
  { title: "Система вирівнювання плитки СВП основа 1.5мм 500шт", category: "c4-7", unit: "упак" },
  { title: "Клин для вирівнювання плитки СВП Нова 200шт", category: "c4-7", unit: "упак" },
  { title: "Хрестики для плитки 2мм Hardex (200 шт)", category: "c4-7", unit: "упак" },

  // Фарби, емалі, хімія
  { title: "Фарба інтер'єрна Dufa Mattlatex D100 біла 10л", category: "c5-1", unit: "відро" },
  { title: "Фарба шовковисто-матова Caparol Samtex 7 10л", category: "c5-1", unit: "відро" },
  { title: "Фарба фасадна акрилова Ceresit CT 42 15л", category: "c5-2", unit: "відро" },
  { title: "Фарба гумова Farbex Rubber Farba графіт RAL 7024 12кг", category: "c5-2", unit: "відро" },
  { title: "Ґрунтовка глибокопроникна Ceresit CT 17 10л", category: "c5-3", unit: "каністра" },
  { title: "Ґрунтовка бетоноконтакт Knauf Betokontakt 15кг", category: "c5-3", unit: "відро" },
  { title: "Емаль алкідна ПФ-115 Zebra біла 2.6кг", category: "c5-4", unit: "банка" },
  { title: "Емаль-ґрунт антикорозійна 3в1 Kompozit графіт 2.7кг", category: "c5-4", unit: "банка" },
  { title: "Лак паркетний акриловий Zebra глянсовий 2.5л", category: "c5-5", unit: "банка" },
  { title: "Монтажна піна професійна Tytan 65 пістолетна", category: "c5-6", unit: "балон" },
  { title: "Силіконовий герметик санітарний Soudal білий 280мл", category: "c5-7", unit: "туба" },
  { title: "Клей рідкі цвяхи Lacrysil Сумасшедшая Липучка 1кг", category: "c5-7", unit: "відро" },

  // Електрика
  { title: "Кабель ВВГ-Пнгд 3х2.5 ЗЗКМ мідний моноліт", category: "c6-1", unit: "м" },
  { title: "Кабель ВВГ-Пнгд 3х1.5 Гал-Кат плаский", category: "c6-1", unit: "м" },
  { title: "Провід ПВС 3х2.5 Одескабель круглий гнучкий", category: "c6-1", unit: "м" },
  { title: "Вита пара UTP cat.5e ЗЗКМ 4х2х0.51 305м", category: "c6-1", unit: "бухта" },
  { title: "Гофротруба ПВХ з протяжкою 20мм Sokol сіра 100м", category: "c6-2", unit: "бухта" },
  { title: "Кабель-канал 25х16 Sokol білий 2м", category: "c6-2", unit: "шт" },
  { title: "Автоматичний вимикач 1P 16A Hager MCN116 6kA", category: "c6-3", unit: "шт" },
  { title: "Автоматичний вимикач 1P 25A Schneider Resi9 6kA", category: "c6-3", unit: "шт" },
  { title: "Диференційний автомат 2P 16A 30mA Hager", category: "c6-3", unit: "шт" },
  { title: "ПЗВ пристрій захисного відключення 2P 40A 30mA Eaton", category: "c6-3", unit: "шт" },
  { title: "Реле контролю напруги ZUBR D2-40 red", category: "c6-3", unit: "шт" },
  { title: "Щит вбудований на 24 модулі Hager Golf білі двері", category: "c6-4", unit: "шт" },
  { title: "Підрозетник монтажний Schneider для бетону набірний", category: "c6-5", unit: "шт" },
  { title: "Розетка із заземленням Schneider Asfora біла", category: "c6-6", unit: "шт" },
  { title: "Вимикач 2-клавішний прохідний Schneider Sedna Design алюміній", category: "c6-6", unit: "шт" },
  { title: "Клема швидкого монтажу WAGO 221-413 3-провідна", category: "c6-6", unit: "упак" },
  { title: "Світлодіодна LED стрічка Lebron 12V 120LED 4200K 5м", category: "c6-7", unit: "бухта" },

  // Сантехніка, каналізація, опалення
  { title: "Труба каналізаційна Ostendorf HTsafe 110х1000мм", category: "c7-2", unit: "шт" },
  { title: "Труба каналізаційна Ostendorf HTsafe 50х500мм", category: "c7-2", unit: "шт" },
  { title: "Коліно каналізаційне Ostendorf 110х87°", category: "c7-2", unit: "шт" },
  { title: "Труба поліпропіленова VSplast PPR Fiber 20мм 4м", category: "c7-1", unit: "шт" },
  { title: "Труба для теплої підлоги PERT-EVOH 16х2.0 VSplast", category: "c7-4", unit: "м" },
  { title: "Кран кульовий 1/2 з американкою Solomon посилений", category: "c7-3", unit: "шт" },
  { title: "Фільтр грубої очистки води Solomon 3/4 косий латунний", category: "c7-3", unit: "шт" },
  { title: "Сифон для умивальника Waterstal з гофрою 32мм", category: "c7-5", unit: "шт" },
  { title: "Ринва водостічна RainWay 130мм біла 3м", category: "c7-1", unit: "шт" },
  { title: "Труба водостічна RainWay 100мм біла 3м", category: "c7-1", unit: "шт" },

  // Кладочні матеріали
  { title: "Газоблок Стоунлайт D500 600х200х300мм паз-гребінь", category: "c8-1", unit: "шт" },
  { title: "Газоблок перегородковий Стоунлайт 600х200х100мм", category: "c8-1", unit: "шт" },
  { title: "Керамічний блок Кератерм 380 248х380х238мм", category: "c8-2", unit: "шт" },
  { title: "Цегла рядова повнотіла М-100 керамічна червона", category: "c8-2", unit: "шт" },
  { title: "Сітка кладочна армопояс 50х50 2.5мм 1х2м", category: "c8-3", unit: "карта" },
  { title: "Арматура сталева рифлена А500С Ø12мм 3м", category: "c8-4", unit: "м" },

  // Пиломатеріали
  { title: "Плита OSB-3 Kronospan вологостійка 10мм 2500х1250", category: "c9-1", unit: "лист" },
  { title: "Плита OSB-3 Kronospan 15мм 2500х1250мм", category: "c9-1", unit: "лист" },
  { title: "Фанера вологостійка березова ФК 12мм 1525х1525", category: "c9-2", unit: "лист" },
  { title: "Брус монтажний дерев'яний сухий сосна 50х50 3м", category: "c9-3", unit: "шт" },
  { title: "Рейка дерев'яна монтажна сосна 20х40 3м", category: "c9-3", unit: "шт" },
  { title: "Дошка обрізна сосна 25х100 4м", category: "c9-4", unit: "шт" },

  // Кріплення (метизи)
  { title: "Саморізи по металу 3.5х25 Knauf TN (1000 шт)", category: "c10-1", unit: "упак" },
  { title: "Саморізи по дереву 3.5х35 фосфатовані (1000 шт)", category: "c10-1", unit: "упак" },
  { title: "Саморізи з пресшайбою гострі 4.2х16 оцинковані (1000 шт)", category: "c10-1", unit: "упак" },
  { title: "Саморізи покрівельні 4.8х35 RAL 7024 графіт EPDM (250 шт)", category: "c10-1", unit: "упак" },
  { title: "Дюбель швидкий монтаж 6х40 гриб Wkret-Met (100 шт)", category: "c10-2", unit: "упак" },
  { title: "Дюбель для теплоізоляції 10х160 з металевим цвяхом та термоголовкою (50 шт)", category: "c10-2", unit: "упак" },
  { title: "Дюбель для гіпсокартону Моллі 4х38 металевий (100 шт)", category: "c10-2", unit: "упак" },
  { title: "Анкер-клин стельовий 6х40 Bierbach оцинкований (100 шт)", category: "c10-2", unit: "упак" },
  { title: "Шпилька різьбова DIN 975 М10 оцинкована 1м", category: "c10-3", unit: "шт" },
  { title: "Гайка шестигранна DIN 934 М10 оцинкована (100 шт)", category: "c10-3", unit: "упак" },
  { title: "Шайба збільшена кузовна DIN 9021 М10 (100 шт)", category: "c10-3", unit: "упак" },
  { title: "Кутник перфорований посилений 105х105х90 2.0мм", category: "c10-4", unit: "шт" },
  { title: "Стрічка монтажна перфорована оцинкована 18х0.55мм 25м", category: "c10-4", unit: "рулон" },
  { title: "Цвяхи будівельні 100х4.0мм (5 кг)", category: "c10-5", unit: "упак" },

  // Інструменти та витратні матеріали
  { title: "Шпатель фасадний нержавіючий 350мм 2K Hardex", category: "c11-1", unit: "шт" },
  { title: "Шпатель малярний нержавіючий 100мм Olejnik", category: "c11-1", unit: "шт" },
  { title: "Правило-трапеція з ребром жорсткості 2.0м Сталь", category: "c11-1", unit: "шт" },
  { title: "Валик малярний мікрофібра 250мм ворс 12мм Hardex", category: "c11-1", unit: "шт" },
  { title: "Кельма штукатурна нержавіюча трикутна 180мм", category: "c11-1", unit: "шт" },
  { title: "Диск відрізний по металу 125х1.2х22.2 Klingspor Extra", category: "c11-2", unit: "шт" },
  { title: "Диск алмазний Distar 1A1R 125мм Hard Ceramics для плитки", category: "c11-2", unit: "шт" },
  { title: "Бур по бетону SDS-Plus 6х160мм Bosch", category: "c11-2", unit: "шт" },
  { title: "Коронка алмазна по керамограніту 68мм Distar", category: "c11-2", unit: "шт" },
  { title: "Ніж будівельний сегментний 18мм Stanley Interlock", category: "c11-3", unit: "шт" },
  { title: "Рулетка вимірювальна 5м магнітна прогумована Haisser", category: "c11-3", unit: "шт" },
  { title: "Рівень будівельний алюмінієвий 3 вічка 100см Kapro", category: "c11-3", unit: "шт" },
  { title: "Пістолет для монтажної піни професійний тефлон Polax", category: "c11-3", unit: "шт" },
  { title: "Пістолет для герметика скелетний посилений", category: "c11-3", unit: "шт" },
  { title: "Міксер для сухих сумішей SDS-Plus 100х600мм", category: "c11-3", unit: "шт" },
  { title: "Плівка захисна малярна 4х5м 20мкм Polax", category: "c11-5", unit: "шт" },
  { title: "Скотч малярний паперовий 48мм х 50м Polax", category: "c11-5", unit: "рулон" },
  { title: "Скотч армований універсальний Duct Tape 50мм х 25м", category: "c11-5", unit: "рулон" },
  { title: "Стрічка демпферна для стяжки Sanpol 150мм 50м", category: "c11-5", unit: "рулон" },
  { title: "Мішки для будівельного сміття поліпропіленові 55х105см", category: "c11-5", unit: "шт" },
  { title: "Рукавички робочі трикотажні з нітриловим покриттям", category: "c11-5", unit: "пара" },
  { title: "Респіратор захисний з клапаном FFP2 Мікрон", category: "c11-5", unit: "шт" },
];

const sellers = ["Олег В.", "Марія К.", "Дмитро С.", "Анна П."];

export const generateMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Випадкові координати в межах Києва
    const lat = 50.45 + (Math.random() - 0.5) * 0.2;
    const lng = 30.52 + (Math.random() - 0.5) * 0.3;
    const item = mockItems[Math.floor(Math.random() * mockItems.length)]!;

    return {
      id: i + 1,
      title: `${item.title} #${i + 1}`,
      category: item.category,
      price: Math.floor(Math.random() * 2000) + 300,
      images: [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
      ],
      quantity: Math.floor(Math.random() * 50) + 1,
      unit: item.unit,
      status: Math.random() > 0.5 ? "Новий" : "Залишок",
      is_exact_location: Math.random() > 0.2, // 20% товарів матимуть неточну локацію
      location: {
        address: "Київ, район",
        lat,
        lng,
      },
      latitude: lat,
      longitude: lng,
      sellerName: sellers[Math.floor(Math.random() * sellers.length)] ?? sellers[0],
      sellerRating: 4.5 + Math.random() * 0.5,
    };
  });
};

export const MOCK_PRODUCTS = generateMockProducts(5000);
