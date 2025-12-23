export default defineNuxtRouteMiddleware((to) => {
  const { public: publicConfig } = useRuntimeConfig();
  const appMode = (publicConfig.appMode || "private").toString();

  if (appMode !== "private") return;

  const user = useStrapiUser();

  const publicPaths = new Set([
    "/login",
    "/register",
    "/impressum",
    "/datenschutz",
    "/contact",
  ]);

  if (!user.value && !publicPaths.has(to.path)) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }

  if (user.value) {
    const hiddenInPrivate = new Set(["/", "/feed", "/docs"]);
    if (hiddenInPrivate.has(to.path)) return navigateTo("/account");
  }
});

