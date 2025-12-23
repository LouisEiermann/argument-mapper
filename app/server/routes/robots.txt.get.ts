export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const appMode = (config.public.appMode || "private").toString();

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");

  if (appMode === "private") {
    return ["User-agent: *", "Disallow: /"].join("\n") + "\n";
  }

  return ["User-agent: *", "Allow: /"].join("\n") + "\n";
});

