export default defineNuxtRouteMiddleware((to, from) => {
  const user = useStrapiUser();
  const { public: publicConfig } = useRuntimeConfig();
  const appMode = (publicConfig.appMode || "private").toString();

  if (user.value) {
    return navigateTo(appMode === "private" ? "/account" : "/feed");
  }
});
