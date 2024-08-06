// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/strapi",
    "@nuxt/ui",
    "@dargmuesli/nuxt-cookie-control",
    "@nuxtjs/i18n",
    "nuxt-anchorscroll",
  ],
  colorMode: {
    preference: "light",
  },
  i18n: {
    vueI18n: "./i18n.config.ts",
  },
});
