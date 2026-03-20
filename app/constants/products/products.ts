import type { Product } from "~/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Ламінат SPC Afirmax Freemont Oak",
    price: 850,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
    ],
    quantity: 15,
    unit: "м²",
    status: "Нове",
    location: { address: "Київ, Оболонь" },
    sellerName: "Олег В.",
    sellerRating: 4.9,
  },
  {
    id: 2,
    title: "Керамограніт під мармур 60х60",
    price: 1200,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
    ],
    quantity: 40,
    unit: "м²",
    status: "Залишки",
    location: { address: "Київ, Позняки" },
    sellerName: "Марія К.",
    sellerRating: 5.0,
  },
  {
    id: 3,
    title: "Ламінат SPC Afirmax Freemont Oak",
    price: 850,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
    ],
    quantity: 15,
    unit: "м²",
    status: "Нове",
    location: { address: "Київ, Оболонь" },
    sellerName: "Олег В.",
    sellerRating: 4.9,
  },
  {
    id: 4,
    title: "Керамограніт під мармур 60х60",
    price: 1200,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500",
    ],
    quantity: 40,
    unit: "м²",
    status: "Залишки",
    location: { address: "Київ, Позняки" },
    sellerName: "Марія К.",
    sellerRating: 5.0,
  },
];