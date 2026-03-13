// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/google-fonts", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  googleFonts: {
    families: {
      Nunito: [400, 700, 900], // 900 — для тих самих жирних заголовків
    },
    display: "swap",
    download: true, // Завантажує шрифт локально при збірці (краще для швидкості)
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
});
