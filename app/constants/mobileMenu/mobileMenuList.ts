import type { MobileMenuItem } from "~/types";

export const MOBILE_MENU_LIST: MobileMenuItem[] = [
  {
    to: "/",
    iconName: "i-heroicons-home",
    linkLabel: "mobileMenu.list.main",
  },
  {
    to: "/catalog",
    iconName: "i-heroicons-magnifying-glass-circle",
    linkLabel: "mobileMenu.list.buy",
  },
  {
    to: "/sell",
    iconName: "i-heroicons-plus-circle",
    linkLabel: "mobileMenu.list.sell",
  },
  {
    to: "/profile",
    iconName: "i-heroicons-user",
    linkLabel: "mobileMenu.list.profile",
  },
];
