export const useLocalizedContent = () => {
    const { locale } = useI18n();

    const localizedVersion = (field: string, content: any) => {
        if (locale.value === "en") {
            return content.attributes[field]
        } else {
            return content.attributes.localizations.data.find((e: { attributes: { locale: string; }; }) => { return e.attributes.locale === locale.value }).attributes[field]
        }
    };

    return {
        localizedVersion
    };
};