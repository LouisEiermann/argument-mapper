// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
    "nuxt-anchorscroll",
    '@pinia/nuxt'
  ],
  colorMode: {
    preference: "light",
  },
  i18n: {
    vueI18n: "./i18n.config.ts",
  },
  strapi: {
    auth: {
      populate: {
        userProgress: true,
        questionSession: {
          populate: ["currentQuestion"]
        }
      }
    },
  },
  cookieControl: {
    locales: ['en', 'de'],
  }
});



