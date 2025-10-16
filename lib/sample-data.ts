import type { SellerProfile, VehicleWithSeller } from "./types";

const PLACEHOLDER_IMAGE = "https://placehold.co/1200x800?text=Foto+pendiente";

// Inventario base 100% placeholder para que nadie confunda demo con datos reales.

export const SAMPLE_VEHICLES: VehicleWithSeller[] = [
  {
    id: "sample-vehicle-1",
    slug: "vehiculo-demo-1",
    title: "Vehículo demo — completá desde el panel",
    brand: "Marca a definir",
    model: "Modelo demo",
    year: new Date().getFullYear(),
    priceARS: null,
    km: null,
    fuel: null,
    gearbox: null,
    location: null,
    description: "Carga la descripción real desde /admin para reemplazar este placeholder.",
    images: [PLACEHOLDER_IMAGE],
    sellerId: "sample-seller-owner",
    published: true,
    createdAt: new Date("2024-01-05T10:00:00.000Z"),
    updatedAt: new Date("2024-03-01T12:00:00.000Z"),
    seller: {
      id: "sample-seller-owner",
      name: "Vendedor demo",
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
    title: "Vehículo demo — agrega fotos reales",
    brand: "Marca pendiente",
    model: "Modelo pendiente",
    year: new Date().getFullYear() - 1,
    priceARS: null,
    km: null,
    fuel: null,
    gearbox: null,
    location: null,
    description: "Sustituí este texto con los datos reales del vehículo.",
    images: [PLACEHOLDER_IMAGE],
    sellerId: "sample-seller-secondary",
    published: true,
    createdAt: new Date("2024-02-10T09:00:00.000Z"),
    updatedAt: new Date("2024-02-22T16:30:00.000Z"),
    seller: {
      id: "sample-seller-secondary",
      name: "Concesionario demo",
      phoneE164: "+5490000000000",
      waPreset: "Hola! Estoy interesad@ en este vehículo.",
      active: true,
      createdAt: new Date("2024-02-10T09:00:00.000Z"),
      updatedAt: new Date("2024-02-10T09:00:00.000Z"),
    },
  },
];

export const SAMPLE_SELLERS: SellerProfile[] = Array.from(
  new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.seller.id, vehicle.seller])).values(),
);
