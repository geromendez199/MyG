export function slugify(...parts: (string | number | undefined | null)[]) {
  return parts
    .filter((part) => part != null)
    .map((part) => `${part}`.trim())
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
