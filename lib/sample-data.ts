import type { SellerProfile, VehicleWithSeller } from "./types";

const PLACEHOLDER_IMAGE = "https://placehold.co/1200x800?text=Foto+pendiente";

// Inventario base 100% placeholder para que nadie confunda demo con datos reales.

export const SAMPLE_VEHICLES: ReadonlyArray<VehicleWithSeller> = [
  {
    id: "sample-vehicle-1",
    slug: "vehiculo-demo-1",
    title: "Vehículo demo — en preparación",
    brand: "Marca a definir",
    model: "Modelo demo",
    year: new Date().getFullYear(),
    priceARS: null,
    km: null,
    fuel: null,
    gearbox: null,
    location: null,
    description: "Coordiná con el equipo comercial para completar los datos reales de esta unidad.",
    images: [PLACEHOLDER_IMAGE],
    sellerId: "sample-seller-owner",
    published: true,
    createdAt: new Date("2024-01-05T10:00:00.000Z"),
    updatedAt: new Date("2024-03-01T12:00:00.000Z"),
    seller: {
      id: "sample-seller-owner",
      // Mantener nombres reales ayuda a identificar responsables una vez que la base esté activa.
      name: "Martin Alloatti",
      phoneE164: "+5490000000000",
      waPreset: "Hola! Estoy configurando el catálogo.",
      active: true,
      createdAt: new Date("2024-01-05T10:00:00.000Z"),
      updatedAt: new Date("2024-01-05T10:00:00.000Z"),
    },
  },
  {
    id: "sample-vehicle-2",
    slug: "vehiculo-demo-2",
    title: "Vehículo demo — aguardando fotos reales",
    brand: "Marca pendiente",
    model: "Modelo pendiente",
    year: new Date().getFullYear() - 1,
    priceARS: null,
    km: null,
    fuel: null,
    gearbox: null,
    location: null,
    description: "El equipo cargará fotos y descripción reales cuando la unidad esté publicada.",
    images: [PLACEHOLDER_IMAGE],
    sellerId: "sample-seller-secondary",
    published: true,
    createdAt: new Date("2024-02-10T09:00:00.000Z"),
    updatedAt: new Date("2024-02-22T16:30:00.000Z"),
    seller: {
      id: "sample-seller-secondary",
      // Usamos el nombre del administrador que continuará cargando contenido real.
      name: "Gerónimo Mendez",
      phoneE164: "+5490000000000",
      waPreset: "Hola! Estoy interesad@ en este vehículo.",
      active: true,
      createdAt: new Date("2024-02-10T09:00:00.000Z"),
      updatedAt: new Date("2024-02-10T09:00:00.000Z"),
    },
  },
].map((vehicle) =>
  // Congelamos cada objeto para evitar mutaciones accidentales durante los fallback en memoria.
  Object.freeze({
    ...vehicle,
    seller: Object.freeze({ ...vehicle.seller }),
  }),
);

// Mapas cacheados para no recalcular búsquedas en cada request de fallback.
const SAMPLE_VEHICLE_BY_SLUG = new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.slug, vehicle]));
const SAMPLE_VEHICLE_BY_ID = new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));

export const SAMPLE_SELLERS: SellerProfile[] = Array.from(
  new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.seller.id, vehicle.seller])).values(),
);

export function findSampleVehicleBySlug(slug: string) {
  return SAMPLE_VEHICLE_BY_SLUG.get(slug) ?? null;
}

export function findSampleVehicleById(id: string) {
  return SAMPLE_VEHICLE_BY_ID.get(id) ?? null;
}
