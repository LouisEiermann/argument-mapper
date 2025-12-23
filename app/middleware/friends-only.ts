export default defineNuxtRouteMiddleware((to) => {
  const { public: publicConfig } = useRuntimeConfig();
  const appMode = (publicConfig.appMode || "private").toString();
  if (appMode !== "private") return;

  const user = useStrapiUser();
  const friends = (user.value as any)?.friends;

  const rawTarget =
    (to.params as any)?.id ?? (to.params as any)?.user ?? (to.query as any)?.userId;
  const targetId = Array.isArray(rawTarget) ? rawTarget[0] : rawTarget;

  if (!targetId) return;

  const isFriend = Array.isArray(friends)
    ? friends.some((f: any) => String(f?.id) === String(targetId))
    : false;

  if (!isFriend) return navigateTo("/account");
});

