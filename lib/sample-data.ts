import type { Prisma } from "@prisma/client";

export type VehicleWithSeller = Prisma.VehicleGetPayload<{
  include: { seller: true };
}>;

export const SAMPLE_VEHICLES: VehicleWithSeller[] = [
  {
    id: "sample-ford-fiesta-2017",
    slug: "ford-fiesta-2017",
    title: "Ford Fiesta 1.6 SE",
    brand: "Ford",
    model: "Fiesta",
    year: 2017,
    priceARS: 9500000,
    km: 82000,
    fuel: "Nafta",
    gearbox: "Manual",
    location: "Córdoba",
    description:
      "Ford Fiesta en excelente estado, único dueño y servicios oficiales al día. Perfecto para ciudad y viajes cortos.",
    images: [
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    ],
    sellerId: "sample-seller-owner",
    published: true,
    createdAt: new Date("2024-01-05T10:00:00.000Z"),
    updatedAt: new Date("2024-03-01T12:00:00.000Z"),
    seller: {
      id: "sample-seller-owner",
      name: "Ana Pérez",
      phoneE164: "+5493515550000",
      waPreset: "Hola! Me gustaría saber más del vehículo.",
      active: true,
      createdAt: new Date("2024-01-05T10:00:00.000Z"),
      updatedAt: new Date("2024-01-05T10:00:00.000Z"),
    },
  },
  {
    id: "sample-peugeot-208-2021",
    slug: "peugeot-208-2021",
    title: "Peugeot 208 Feline",
    brand: "Peugeot",
    model: "208",
    year: 2021,
    priceARS: 18200000,
    km: 32000,
    fuel: "Nafta",
    gearbox: "Automática",
    location: "Rosario",
    description:
      "Peugeot 208 Feline con techo panorámico, pantalla 10'' y ayuda al estacionamiento. Ideal para quien busca confort y tecnología.",
    images: [
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    ],
    sellerId: "sample-seller-martin",
    published: true,
    createdAt: new Date("2024-02-10T09:00:00.000Z"),
    updatedAt: new Date("2024-02-22T16:30:00.000Z"),
    seller: {
      id: "sample-seller-martin",
      name: "Martín Gómez",
      phoneE164: "+5493414440000",
      waPreset: "Hola! Vi el auto publicado y quiero más información.",
      active: true,
      createdAt: new Date("2024-02-10T09:00:00.000Z"),
      updatedAt: new Date("2024-02-10T09:00:00.000Z"),
    },
  },
  {
    id: "sample-toyota-corolla-2019",
    slug: "toyota-corolla-2019",
    title: "Toyota Corolla XEi",
    brand: "Toyota",
    model: "Corolla",
    year: 2019,
    priceARS: 21500000,
    km: 61000,
    fuel: "Híbrido",
    gearbox: "Automática",
    location: "Buenos Aires",
    description:
      "Corolla híbrido con mantenimiento realizado en concesionario oficial. Consumo súper eficiente y gran confort de marcha.",
    images: [
      "https://images.unsplash.com/photo-1589396572781-44c1476ee712?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0c1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80",
    ],
    sellerId: "sample-seller-juana",
    published: true,
    createdAt: new Date("2024-03-18T14:15:00.000Z"),
    updatedAt: new Date("2024-03-20T08:45:00.000Z"),
    seller: {
      id: "sample-seller-juana",
      name: "Juana López",
      phoneE164: "+5491122334455",
      waPreset: "Hola! Estoy interesado en el Corolla.",
      active: true,
      createdAt: new Date("2024-03-18T14:15:00.000Z"),
      updatedAt: new Date("2024-03-18T14:15:00.000Z"),
    },
  },
];

export const SAMPLE_SELLERS = Array.from(
  new Map(SAMPLE_VEHICLES.map((vehicle) => [vehicle.seller.id, vehicle.seller])).values(),
);
