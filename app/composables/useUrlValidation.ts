export const useUrlValidation = () => {
  const urlPattern = new RegExp(
    "^https?:\\/\\/" + // protocol
      "(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+" + // domain name
      "([a-z]{2,})" + // TLD (e.g., .com, .de)
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // optional port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // optional query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // optional fragment locator

  const isUrlValid = (sourceUrl: string) => {
    return urlPattern.test(sourceUrl);
  };

  return {
    isUrlValid,
  };
};
