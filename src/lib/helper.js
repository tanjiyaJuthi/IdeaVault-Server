export const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/(^-|-$)/g, "");

export const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();

    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
            ? "nd"
            : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    const month = date.toLocaleString("en-US", {
        month: "long",
    });

    const year = date.getFullYear();

    return `${day}${suffix} ${month}, ${year}`;
};