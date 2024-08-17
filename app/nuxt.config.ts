// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "nuxt-anchorscroll"
  ],
  colorMode: {
    preference: "light",
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
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en-US.json' },
      { code: 'de', iso: 'de-DE', file: 'de-DE.json' }
    ],
    defaultLocale: "de",
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
  }
});