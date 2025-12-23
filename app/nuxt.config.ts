// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appMode: process.env.NUXT_PUBLIC_APP_MODE ?? process.env.APP_MODE ?? "private",
    },
  },
  app: {
    head: {
      titleTemplate: "%s · LogosMap",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/brand/logosmap-icon.svg" },
      ],
      meta: [
        { name: "application-name", content: "LogosMap" },
        { name: "apple-mobile-web-app-title", content: "LogosMap" },
        { property: "og:site_name", content: "LogosMap" },
      ],
    },
  },

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
    colors: {
      barBackground: "var(--ui-bg)",
      barTextColor: "var(--ui-text)",
      barButtonBackground: "var(--ui-primary)",
      barButtonColor: "#fff",
      barButtonHoverBackground: "var(--ui-color-primary-600)",
      barButtonHoverColor: "#fff",
      checkboxActiveBackground: "var(--ui-primary)",
      checkboxActiveCircleBackground: "#fff",
      checkboxInactiveBackground: "var(--ui-color-neutral-300)",
      checkboxInactiveCircleBackground: "#fff",
      checkboxDisabledBackground: "var(--ui-color-neutral-200)",
      checkboxDisabledCircleBackground: "var(--ui-color-neutral-50)",
      modalBackground: "var(--ui-bg)",
      modalTextColor: "var(--ui-text)",
      modalButtonBackground: "var(--ui-primary)",
      modalButtonColor: "#fff",
      modalButtonHoverBackground: "var(--ui-color-primary-600)",
      modalButtonHoverColor: "#fff",
      controlButtonBackground: "var(--ui-bg)",
      controlButtonHoverBackground: "var(--ui-primary)",
      controlButtonIconColor: "var(--ui-text)",
      controlButtonIconHoverColor: "#fff",
      focusRingColor: "var(--ui-primary)",
      modalOverlay: "#000",
      modalOverlayOpacity: 0.6,
    },
    cookies: {
      necessary: [
        {
          id: "cookie-control",
          name: { en: "Cookie preferences", de: "Cookie-Einstellungen" },
          description: {
            en: "Stores your cookie consent choices.",
            de: "Speichert deine Cookie-Einstellungen.",
          },
          targetCookieIds: ["ncc_c", "ncc_e"],
        },
        {
          id: "i18n",
          name: { en: "Language", de: "Sprache" },
          description: {
            en: "Stores your language preference for redirects.",
            de: "Speichert deine Spracheinstellung für Weiterleitungen.",
          },
          targetCookieIds: ["i18n_redirected"],
        },
        {
          id: "auth-redirect",
          name: { en: "Login redirect", de: "Login-Weiterleitung" },
          description: {
            en: "Stores where to return after login.",
            de: "Speichert, wohin nach dem Login zurückgekehrt werden soll.",
          },
          targetCookieIds: ["redirect"],
        },
      ],
      optional: [],
    },
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
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "http://localhost:1337", "data:"],
        "worker-src":
          process.env.NODE_ENV === "development"
            ? ["'self'", "blob:"]
            : ["'self'"],
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
