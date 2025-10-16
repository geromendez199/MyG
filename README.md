# MG Automotores — One Page de vehículos

Landing responsive con catálogo de vehículos usados, filtros básicos, detalle por unidad y panel de administración protegido por token. Construido con **Next.js 14**, **TypeScript**, **TailwindCSS**, **Prisma** y **Supabase** (PostgreSQL + Storage).

## 🚗 Características

- Landing "one-page" con hero, filtros y grilla de cards.
- Cards con precio, datos clave, vendedor y CTA **Hablar por WhatsApp** (formato E.164 + mensaje sugerido).
- Filtros por búsqueda libre, marca, año mínimo/máximo y rango de precio.
- Paginación simple (querystring `page`).
- Página de detalle por `slug` con metadatos SEO/OG.
- Panel de alta/edición protegido por `ADMIN_TOKEN`, con subida de imágenes a Supabase Storage.
- API REST (`/api/vehicles`, `/api/vehicles/[id]`, `/api/uploads`, `/api/admin/*`).
- Seed inicial con vendedores y placeholders seguros (sin datos reales).
- Theming dinámico desde variables de entorno (`NEXT_PUBLIC_PRIMARY`, `NEXT_PUBLIC_SECONDARY`).

## 🗂️ Estructura principal

```
app/
├─ (site)/page.tsx           # Landing pública
├─ admin/
│  ├─ page.tsx               # Panel de gestión (token gate)
│  └─ route.ts               # Protección mínima (HEAD + token)
├─ api/
│  ├─ vehicles/route.ts      # GET/POST con filtros
│  ├─ vehicles/[id]/route.ts # GET/PATCH
│  ├─ admin/session/route.ts # Verificación de token
│  ├─ admin/sellers/route.ts # Listado de vendedores (protegido)
│  └─ uploads/route.ts       # Upload a Supabase Storage
└─ vehicle/[slug]/page.tsx   # Detalle SEO por unidad
components/
├─ hero.tsx, filters.tsx, vehicle-card.tsx, pagination.tsx
└─ admin/*                   # Dashboard, formularios, uploader
lib/
├─ config.ts, db.ts, slug.ts, whatsapp.ts, format.ts, supabase.ts, validators.ts
prisma/schema.prisma         # Modelos Seller y Vehicle
scripts/seed.ts              # Semilla inicial
styles/globals.css           # Tailwind + theming
```

## ⚙️ Variables de entorno

Crear `.env.local` a partir de `.env.example` y completar:

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
SUPABASE_BUCKET=vehicles
ADMIN_TOKEN=
SELLER_MARTIN_PHONE=
SELLER_OWNER_NAME=
SELLER_OWNER_PHONE=
NEXT_PUBLIC_PRIMARY=
NEXT_PUBLIC_SECONDARY=
NEXT_PUBLIC_SITE_URL=
```

> **Nota:** El `SUPABASE_SERVICE_ROLE` solo se usa en el backend (rutas protegidas) para subir imágenes. No exponerlo en el cliente.

## 🛠️ Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Ejecuta el modo desarrollo (Next.js). |
| `pnpm build` | Build de producción. |
| `pnpm start` | Arranca el servidor en modo producción. |
| `pnpm lint` | Linting con ESLint. |
| `pnpm prisma:generate` | Genera el cliente Prisma. |
| `pnpm prisma:migrate` | Ejecuta `prisma migrate dev`. |
| `pnpm seed` | Corre `scripts/seed.ts` con `tsx`. |

## 🚀 Setup local

1. Instalar dependencias:
   ```bash
   pnpm i
   ```
2. Copiar variables de entorno:
   ```bash
   cp .env.example .env.local
   # Completar valores (DB, Supabase, tokens, colores)
   ```
3. Preparar Prisma:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```
4. Ejecutar semilla inicial (opcional recomendado):
   ```bash
   pnpm seed
   ```
5. Correr el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

La app queda disponible en `http://localhost:3000`.

## 🚘 Cómo cargar autos

> Si no configurás `DATABASE_URL`, la landing mostrará un catálogo de demostración **con placeholders** para que nadie confunda la demo con stock real. Una vez conectada la base de datos, toda la información vendrá de tu inventario real.

1. **Ingresar al panel**: visitá `/admin`, introducí el `ADMIN_TOKEN` y guardalo. Si la base está conectada verás el dashboard con el listado actual.
2. **Crear vendedores**: desde el panel, agregá los vendedores con nombre y teléfono (formato E.164). Son los contactos que aparecerán en las fichas.
3. **Publicar vehículos**: completá marca, modelo, año, precio, kilometraje, descripción y subí las fotos. Elegí el vendedor y dejá marcada la opción “Publicado” para que aparezca en la landing.
4. **Edición rápida**: en el mismo panel podés pausar (despublicar) o actualizar datos sin perder el histórico.
5. **Carga vía API (opcional)**: enviá un `POST` a `/api/vehicles` con el token en el header `Authorization: Bearer ADMIN_TOKEN` y un body que cumpla con `vehicleInputSchema`. Ideal para integraciones externas.

> Tip: ejecutá `pnpm seed` para crear un vendedor y un vehículo de ejemplo en tu propia base.

## 🗄️ Base de datos y Storage

- **Supabase (PostgreSQL):** crear proyecto, copiar el `DATABASE_URL` y configurarlo en `.env.local`.
- **Migrations:** usar `pnpm prisma:migrate` en desarrollo. Para producción, ejecutar `prisma migrate deploy` (Vercel → comando custom o `pnpm prisma migrate deploy`).
- **Storage:** crear bucket `vehicles` con lectura pública. El upload se realiza desde `/api/uploads` usando el `SUPABASE_SERVICE_ROLE` en el backend.

## 🔐 Seguridad mínima

- Las rutas mutables (`POST /api/vehicles`, `PATCH /api/vehicles/[id]`, `/api/uploads`, `/api/admin/*`) exigen encabezado `Authorization: Bearer ADMIN_TOKEN`.
- El panel (`/admin`) solicita token y lo guarda en `localStorage` del navegador.
- No se exponen secretos del lado cliente.

## 🧪 QA / Checklist

- [x] Cards con CTA de WhatsApp (`waHref`).
- [x] Filtros funcionales con querystring.
- [x] Upload de imágenes a Supabase Storage.
- [x] Slug automático `kebab-case` (`brand-model-year`).
- [x] SEO básico + OG en landing y detalle.
- [x] Panel protegido con token.

## ☁️ Deploy en Vercel

1. Crear proyecto nuevo en Vercel y conectar el repositorio.
2. Configurar las variables de entorno (mismas que `.env.local`).
3. Configurar Supabase (DB + Storage) accesible desde Vercel.
4. Opcional: agregar script `pnpm prisma migrate deploy` en “Build & Development Settings → Post-install Command”.
5. Deploy automático en cada push a la rama principal.

¡Listo! El sitio queda listo para publicar inventario de vehículos y gestionarlo con un panel simple.
