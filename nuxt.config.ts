// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/tailwindcss", "@pinia/nuxt",'@formkit/auto-animate/nuxt',"nuxt-lodash"],
  plugins: ["~/plugins/api.ts"],
});
