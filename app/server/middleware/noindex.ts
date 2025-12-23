export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const appMode = (config.public.appMode || "private").toString();

  if (appMode === "private") {
    setHeader(event, "X-Robots-Tag", "noindex, nofollow, noarchive");
  }
});

