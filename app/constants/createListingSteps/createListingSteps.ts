import type { StepperItem } from "@nuxt/ui";

const items = [
  {
    slot: "uploadPhoto" as const,
    title: "Завантажити Фото",
    description: "",
    icon: "i-lucide-image-up",
  },
  {
    slot: "shipping" as const,
    title: "Shipping",
    description: "Set your preferred shipping method",
    icon: "i-lucide-truck",
  },
  {
    slot: "checkout" as const,
    title: "Checkout",
    description: "Confirm your order",
  },
] satisfies StepperItem[];
