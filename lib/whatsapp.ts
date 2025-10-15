export const toE164 = (raw: string) => raw.replace(/\D/g, "");

export const waHref = (phoneE164: string, text?: string) => {
  const clean = toE164(phoneE164);
  if (!clean) return "#";
  const encoded = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${clean}${encoded}`;
};
