# OnePage Vehículos — README

Una **One-Page** para publicar vehículos y que los visitantes vean la ficha y contacten al vendedor directamente por **WhatsApp** (click‑to‑chat).

> **Stack elegido**
>
> * **Next.js 14 (App Router)** + **React** + **TypeScript**
> * **TailwindCSS** para estilos
> * **PostgreSQL en Supabase** (gratis/low‑cost) + **Prisma** ORM
> * **Vercel** para deploy
> * **Supabase Storage** para imágenes
>
> Motivos: setup simple, free tier generoso, DX rápida y costo casi cero.

---

## 1) Features

* Landing de una sola página con listado de vehículos.
* Card por vehículo: fotos, marca/modelo/año, precio, km, ubicación, combustible, caja, descripción.
* Filtro/orden simple (marca, precio, año, km).
* CTA **“Hablar por WhatsApp”** por vehículo (vendedor específico).
* Panel mínimo de carga (ruta protegida vía token) para crear/editar vehículos.
* Upload de imágenes a Supabase Storage.
* SEO básico (title/description por vehículo, OpenGraph para compartir).
* Paleta de colores tomada del logo vía CSS variables.

---

## 2) Estructura

```
onepage-autos/
├─ app/
│  ├─ (site)/page.tsx               # Listado principal
│  ├─ api/vehicles/route.ts         # GET/POST (lista y crear)
│  ├─ admin/route.ts                # Protección auth mínima (edge)
│  ├─ admin/page.tsx                # Form de alta/edición
│  └─ vehicle/[slug]/page.tsx       # Detalle SEO shareable (opcional)
├─ components/                      # UI (Cards, Filters, Uploader)
├─ lib/
│  ├─ db.ts                         # Prisma Client
│  ├─ whatsapp.ts                   # Helpers de WhatsApp
│  └─ config.ts                     # Colors del logo, etc.
├─ prisma/
│  └─ schema.prisma
├─ public/                          # Íconos, fallback images, logo
├─ styles/globals.css
├─ .env.local
├─ package.json
└─ README.md
```

---

## 3) Modelo de datos (Prisma)

```prisma
// prisma/schema.prisma
 datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
 }

 generator client {
  provider = "prisma-client-js"
 }

 model Seller {
  id        String  @id @default(cuid())
  name      String
  phoneE164 String  // +54911XXXXXXXX
  waPreset  String? // mensaje prellenado opcional
  vehicles  Vehicle[]
  active    Boolean @default(true)
 }

 model Vehicle {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  slug        String   @unique
  title       String   // "Ford Fiesta 1.6 SE"
  brand       String
  model       String
  year        Int
  priceARS    Int?
  km          Int?
  fuel        String?  // nafta, diesel, híbrido, eléctrico
  gearbox     String?  // manual, automática
  location    String?
  description String?
  images      String[] // URLs de Supabase Storage
  sellerId    String
  seller      Seller   @relation(fields: [sellerId], references: [id])
  published   Boolean  @default(true)
 }
```

### Semilla rápida (opcional)

```ts
// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const martin = await db.seller.upsert({
    where: { phoneE164: process.env.SELLER_MARTIN_PHONE! },
    update: {},
    create: {
      name: "Martin",
      phoneE164: process.env.SELLER_MARTIN_PHONE!,
      waPreset: "Hola! Vi el auto publicado y quiero más info.",
    },
  });
  const owner = await db.seller.upsert({
    where: { phoneE164: process.env.SELLER_OWNER_PHONE! },
    update: {},
    create: {
      name: process.env.SELLER_OWNER_NAME ?? "Vendedor",
      phoneE164: process.env.SELLER_OWNER_PHONE!,
    },
  });

  await db.vehicle.create({
    data: {
      slug: "fiesta-16-se-2017",
      title: "Ford Fiesta 1.6 SE 2017",
      brand: "Ford",
      model: "Fiesta",
      year: 2017,
      priceARS: 9500000,
      km: 82000,
      fuel: "nafta",
      gearbox: "manual",
      location: "Córdoba",
      images: [],
      sellerId: martin.id,
    },
  });
}

main().finally(() => db.$disconnect());
```

---

## 4) WhatsApp click‑to‑chat

Formato oficial:

```
https://wa.me/<E164>?text=<URLEncoded>
```

* **<E164>**: número con prefijo país sin "+" ni ceros. Ej: **5493511234567** (AR +54, móvil con 9).
* Mensaje sugerido por vehículo:

```ts
const makeWAUrl = (phoneE164: string, v: Vehicle) => {
  const base = `https://wa.me/${phoneE164.replace("+", "")}`;
  const msg = encodeURIComponent(
    `Hola! Me interesa el ${v.title} (${v.year}). ¿Sigue disponible?`
  );
  return `${base}?text=${msg}`;
};
```

> **Tip**: guardar `waPreset` en `Seller` para personalizar saludo.

---

## 5) Variables de entorno (.env.local)

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Supabase Storage (opcional si usas el SDK del proyecto)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE=...
SUPABASE_BUCKET=vehicles

# Admin
ADMIN_TOKEN=poneme-un-token-largo

# Vendedores
SELLER_MARTIN_PHONE=+5493511111111
SELLER_OWNER_NAME=Gero
SELLER_OWNER_PHONE=+5493512222222

# Theming a partir del logo
NEXT_PUBLIC_PRIMARY=#123456
NEXT_PUBLIC_SECONDARY=#ABCDEF
```

---

## 6) API mínima (App Router)

### `GET /api/vehicles`

* Query: `q`, `brand`, `yearMin`, `yearMax`, `priceMin`, `priceMax`.
* Respuesta: JSON con lista paginada.

### `POST /api/vehicles`

* Header: `Authorization: Bearer ${ADMIN_TOKEN}`
* Body:

```json
{
  "title": "Ford Fiesta 1.6 SE 2017",
  "brand": "Ford",
  "model": "Fiesta",
  "year": 2017,
  "priceARS": 9500000,
  "km": 82000,
  "fuel": "nafta",
  "gearbox": "manual",
  "location": "Córdoba",
  "images": ["https://..."],
  "sellerId": "<id>"
}
```

---

## 7) UI/UX

* **Hero** con claim + filtro rápido.
* **Grid de cards** con CTA WhatsApp por ítem.
* **Badge** de año/kms, **precio** destacado, **ubicación**.
* **Tema**: leer `NEXT_PUBLIC_PRIMARY/SECONDARY` y aplicarlo como `--color-primary` en Tailwind.
* **Responsive** (mobile‑first), imágenes con `next/image`.

---

## 8) Setup & Scripts

```bash
# 1) Clonar e instalar
pnpm i

# 2) Variables
cp .env.example .env.local  # crea y completa

# 3) Prisma
pnpm prisma generate
pnpm prisma migrate dev
pnpm tsx scripts/seed.ts    # opcional

# 4) Dev server
pnpm dev
```

### Deploy

* **DB**: crear proyecto en **Supabase**, volcar `DATABASE_URL`.
* **Storage**: bucket `vehicles` con política pública de lectura.
* **Web**: conectar repo a **Vercel** y setear las envs.

---

## 9) Seguridad mínima

* Alta/edición solo con `ADMIN_TOKEN` (Bearer).
* Sanitizar uploads y limitar tamaño/formatos.
* Evitar datos sensibles en el cliente (no exponer Service Role de Supabase).

---

## 10) Endpoints/Helpers de WhatsApp

```ts
// lib/whatsapp.ts
export const toE164 = (raw: string) => raw.replace(/\D/g, "");
export const waHref = (phoneE164: string, text?: string) =>
  `https://wa.me/${toE164(phoneE164)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
```

Uso en la Card:

```tsx
<Link href={waHref(seller.phoneE164, `Hola! Me interesa el ${v.title}.`) }>
  Hablar por WhatsApp
</Link>
```

---

## 11) Form de carga (admin)

Campos: `title, brand, model, year, priceARS, km, fuel, gearbox, location, seller, images[]`.

* Imágenes: drag&drop → sube a Supabase Storage → guarda URLs.
* Slug automático `kebabCase(brand, model, year)`.

---

## 12) Paleta desde el logo

Pegar colores en `.env` o editar `styles/globals.css`:

```css
:root{ --color-primary: var(--tw-color-[NEXT_PUBLIC_PRIMARY]); }
```

O directamente Tailwind config usando `NEXT_PUBLIC_PRIMARY`.

---

## 13) Roadmap corto

* Favoritos en localStorage.
* Paginación infinita.
* Exportar a CSV.
* Feed RSS/JSON para portales.
* Microcopys para WhatsApp por vehículo.

---

## 14) QA Checklist

* [ ] WhatsApp abre con número correcto y mensaje prellenado.
* [ ] Imágenes cargan desde Storage en mobile/desktop.
* [ ] Filtros funcionan y persisten en querystring.
* [ ] SEO: título por página/vehículo, OG tags.
* [ ] Admin requiere `ADMIN_TOKEN`.

---

## 15) Notas

* Si el proyecto requiere **costo cero absoluto**, se puede cambiar a **SQLite** en `Vercel KV + Turso** o **Neon Free**; este README asume Supabase por simplicidad.
* Los teléfonos deben ir en formato **E.164** con prefijo país (Argentina: `+54` y para móviles `+549`).
