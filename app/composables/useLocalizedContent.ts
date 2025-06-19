export const useLocalizedContent = () => {
  const { locale } = useI18n();

  const localizedVersion = (field: string, content: any) => {
    if (locale.value === "en") {
      return content[field];
    } else {
      return content.localizations.find((e: { locale: string }) => {
        return e.locale === locale.value;
      })[field];
    }
  };

  return {
    localizedVersion,
  };
};
