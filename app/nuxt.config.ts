// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "nuxt-anchorscroll",
    "nuxt-security",
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
  },
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", "http://localhost:1337", "data:"],
        'connect-src': ["'self'", "http://localhost:1337"],
      }
    },
  },
});