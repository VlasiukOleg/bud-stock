export const APP_ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PROFILE: {
    ROOT: '/profile',
    LISTINGS: '/profile/listings',
    PURCHASES: '/profile/purchases',
    CHATS: '/profile/chats',
    INFORMATION: '/profile/information',
    SECURITY: '/profile/security',
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  CREATE_LISTING: '/sell',
} as const;
