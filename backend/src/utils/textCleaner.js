export const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
};
