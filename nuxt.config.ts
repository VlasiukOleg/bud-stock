// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
    "@nuxtjs/leaflet",
  ],
  css: ["~/assets/css/main.css"],
  googleFonts: {
    families: {
      Nunito: [400, 700, 900],
      "Public Sans": [400, 700, 900],
    },
    display: "swap",
    download: true,
  },
  i18n: {
    langDir: "locales",
    locales: [
      { code: "uk", file: "uk.json" },
      { code: "en", file: "en.json" },
      { code: "ru", file: "ru.json" },
    ],
    defaultLocale: "uk",
    strategy: "no_prefix",
  },
  routeRules: {
    // Якщо твоя сторінка називається pages/catalog.vue
    "/catalog": { ssr: false },
  },
  leaflet: {
    markerCluster: true,
  },
});
