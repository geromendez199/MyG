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
