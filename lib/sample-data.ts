import type { SellerProfile, VehicleWithSeller } from "./types";

const SELLER_FIXTURES: SellerProfile[] = [
  {
    id: "sample-seller-martin",
    name: "Martin Alloatti",
    phoneE164: "+5493492303811",
    waPreset: "Hola Martin, me gustaría coordinar para publicar o conocer un vehículo.",
    active: true,
    createdAt: new Date("2024-01-05T10:00:00.000Z"),
    updatedAt: new Date("2024-01-05T10:00:00.000Z"),
  },
  {
    id: "sample-seller-geronimo",
    name: "Gerónimo Mendez",
    phoneE164: "+5493492680779",
    waPreset: "Hola Gerónimo, quiero más información sobre los vehículos disponibles.",
    active: true,
    createdAt: new Date("2024-02-10T09:00:00.000Z"),
    updatedAt: new Date("2024-02-10T09:00:00.000Z"),
  },
];

export const SAMPLE_SELLERS: ReadonlyArray<SellerProfile> = SELLER_FIXTURES.map((seller) =>
  Object.freeze({ ...seller }),
);

// Inventario vacío: en modo demo mostramos un listado limpio y orientamos al contacto directo con los vendedores.
export const SAMPLE_VEHICLES: ReadonlyArray<VehicleWithSeller> = Object.freeze(
  [] as VehicleWithSeller[],
);

// Mapas cacheados para no recalcular búsquedas en cada request de fallback.
const SAMPLE_VEHICLE_BY_SLUG = new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.slug, vehicle]));
const SAMPLE_VEHICLE_BY_ID = new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));

export function findSampleVehicleBySlug(slug: string) {
  return SAMPLE_VEHICLE_BY_SLUG.get(slug) ?? null;
}

export function findSampleVehicleById(id: string) {
  return SAMPLE_VEHICLE_BY_ID.get(id) ?? null;
}
