// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "nuxt-anchorscroll",
    "nuxt-security",
    "@nuxt/devtools",
  ],

  css: ["~/assets/css/main.css"],

  strapi: {
    auth: {
      populate: {
        userProgress: true,
        questionSession: {
          populate: ["currentQuestion"],
        },
      },
    },
  },

  cookieControl: {
    locales: ["en", "de"],
  },

  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "de", name: "German", file: "de.json" },
    ],
    defaultLocale: "en",
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === "development" ? "unsafe-none" : "require-corp",
      contentSecurityPolicy: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "img-src": ["'self'", "http://localhost:1337", "data:"],
        "connect-src": [
          "'self'",
          "http://localhost:1337",
          "ws://localhost:1337",
        ],
      },
    },
  },

  compatibilityDate: "2024-10-12",

  // Use Nuxt's built-in preloading
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    asyncContext: true,
  },
});
