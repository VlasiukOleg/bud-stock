import type { MobileMenuItem } from "~/types";

export const MOBILE_MENU_LIST: MobileMenuItem[] = [
  {
    to: APP_ROUTES.HOME,
    iconName: "i-heroicons-home",
    linkLabel: "mobileMenu.list.main",
  },
  {
    to: APP_ROUTES.CATALOG,
    iconName: "i-heroicons-magnifying-glass-circle",
    linkLabel: "mobileMenu.list.buy",
  },
  {
    to: APP_ROUTES.CREATE_LISTING,
    iconName: "i-heroicons-plus-circle",
    linkLabel: "mobileMenu.list.sell",
  },
  {
    to: APP_ROUTES.PROFILE.ROOT,
    iconName: "i-heroicons-user",
    linkLabel: "mobileMenu.list.profile",
  },
];
