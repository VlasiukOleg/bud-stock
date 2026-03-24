import type { Product } from "~/types";

const titles = [
  "Ламінат SPC",
  "Керамограніт",
  "Гіпсокартон Knauf",
  "Фарба Aura",
  "Цемент М-500",
];
const sellers = ["Олег В.", "Марія К.", "Дмитро С.", "Анна П."];

export const generateMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Випадкові координати в межах Києва
    const lat = 50.45 + (Math.random() - 0.5) * 0.2;
    const lng = 30.52 + (Math.random() - 0.5) * 0.3;

    return {
      id: i + 1,
      title: `${titles[Math.floor(Math.random() * titles.length)]} #${i + 1}`,
      price: Math.floor(Math.random() * 2000) + 300,
      images: [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
      ],
      quantity: Math.floor(Math.random() * 50) + 1,
      unit: "м²",
      status: Math.random() > 0.5 ? "Нове" : "Залишки",
      location: {
        address: "Київ, район",
        lat,
        lng,
      },
      sellerName: sellers[Math.floor(Math.random() * sellers.length)],
      sellerRating: 4.5 + Math.random() * 0.5,
    };
  });
};

export const MOCK_PRODUCTS = generateMockProducts(100);
