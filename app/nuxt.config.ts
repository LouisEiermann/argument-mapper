// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
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
        friends: true,
        created: { populate: { opponent: true, tags: true } },
        isOpponent: true,
        avatar: true,
        achievements: { populate: { image: true, localizations: true } },
      },
    },
  },

  cookieControl: {
    locales: ["en", "de"],
  },

  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "de", name: "Deutsch", file: "de.json" },
    ],
    defaultLocale: "de",
  },

  security: {
    // `nuxt-security` defaults to `sri: true`, which adds `integrity` to some `<link rel="preload">` tags.
    // Chromium-based browsers log a noisy warning for preload destinations that don't support SRI (e.g. some fonts).
    sri: process.env.NODE_ENV !== "development",
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
        "frame-src": process.env.NODE_ENV === "development"
          ? ["'self'", "blob:", "data:"]
          : ["'self'"],
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
