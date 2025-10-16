export const formatCurrency = (value?: number | null) => {
  if (!value) return "Consultar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatKm = (value?: number | null) => {
  if (value == null) return "-";
  return `${new Intl.NumberFormat("es-AR").format(value)} km`;
};

export const formatPhoneDisplay = (phone?: string | null) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (!trimmed) return "";

  const normalized = trimmed.replace(/\s+/g, "");
  // Intentamos agrupar un número en formato E.164 para hacerlo más legible.
  const formatted = normalized.replace(/(\+\d{2})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4");
  return formatted || normalized;
};
