import type { Product } from "~/types";

const mockItems = [
  { title: "Ламінат SPC 33 клас", category: "c4-5", unit: "м²" },
  { title: "Керамограніт 60х60", category: "c4-2", unit: "м²" },
  { title: "Гіпсокартон Knauf стіновий 12.5мм", category: "c2-1", unit: "лист" },
  { title: "Фарба Aura Mattlatex біла", category: "c5-1", unit: "л" },
  { title: "Цемент М-500 ПЦ I-500", category: "c1-6", unit: "мішок" },
  { title: "Шпаклівка Knauf Multi-Finish 25кг", category: "c1-2", unit: "мішок" },
  { title: "Штукатурка Knauf MP-75 гіпсова", category: "c1-1", unit: "мішок" },
  { title: "Клей для плитки Ceresit CM 117", category: "c1-3", unit: "мішок" },
  { title: "Профіль CD-60 для гіпсокартону 3м", category: "c2-2", unit: "шт" },
  { title: "Мінеральна вата Isover Профі 50мм", category: "c3-1", unit: "рулон" },
  { title: "Кабель ВВГ-Пнг 3х2.5 Одескабель", category: "c6-1", unit: "м" },
  { title: "Труба поліпропіленова PPR 20мм", category: "c7-1", unit: "м" },
  { title: "Газоблок Стоунлайт 600х200х300", category: "c8-1", unit: "шт" },
  { title: "Плита OSB-3 Kronospan 10мм", category: "c9-1", unit: "лист" },
  { title: "Саморізи по металу 3.5х25 (1000 шт)", category: "c10-1", unit: "упак" },
  { title: "Монтажна піна Ceresit TS 62 Pro", category: "c5-6", unit: "балон" },
];

const sellers = ["Олег В.", "Марія К.", "Дмитро С.", "Анна П."];

export const generateMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Випадкові координати в межах Києва
    const lat = 50.45 + (Math.random() - 0.5) * 0.2;
    const lng = 30.52 + (Math.random() - 0.5) * 0.3;
    const item = mockItems[Math.floor(Math.random() * mockItems.length)];

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
      sellerName: sellers[Math.floor(Math.random() * sellers.length)],
      sellerRating: 4.5 + Math.random() * 0.5,
    };
  });
};

export const MOCK_PRODUCTS = generateMockProducts(5000);
