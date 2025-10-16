import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  if (!process.env.SELLER_MARTIN_PHONE || !process.env.SELLER_OWNER_PHONE) {
    throw new Error("Seed requires SELLER_MARTIN_PHONE and SELLER_OWNER_PHONE envs");
  }

  const martin = await db.seller.upsert({
    where: { phoneE164: process.env.SELLER_MARTIN_PHONE },
    update: {},
    create: {
      // Persistimos el nombre completo para que coincida con el catálogo público.
      name: "Martin Alloatti",
      phoneE164: process.env.SELLER_MARTIN_PHONE,
      waPreset: "Hola! Vi el auto publicado y quiero más info.",
    },
  });

  const owner = await db.seller.upsert({
    where: { phoneE164: process.env.SELLER_OWNER_PHONE },
    update: {
      name: process.env.SELLER_OWNER_NAME ?? "Gerónimo Mendez",
    },
    create: {
      name: process.env.SELLER_OWNER_NAME ?? "Gerónimo Mendez",
      phoneE164: process.env.SELLER_OWNER_PHONE,
    },
  });

  await db.vehicle.upsert({
    where: { slug: "ford-fiesta-2017" },
    update: {},
    create: {
      title: "Ford Fiesta 1.6 SE",
      brand: "Ford",
      model: "Fiesta",
      year: 2017,
      priceARS: 9500000,
      km: 82000,
      fuel: "nafta",
      gearbox: "manual",
      location: "Córdoba",
      description:
        "Ford Fiesta en excelente estado, único dueño, todos los servicios oficiales realizados.",
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      ],
      sellerId: owner.id,
      slug: "ford-fiesta-2017",
    },
  });

  console.log("Seed completed");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
