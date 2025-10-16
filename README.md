# MG Automotores — One Page de vehículos

Landing responsive con catálogo de vehículos usados, filtros básicos, detalle por unidad y panel de administración protegido por token. Construido con **Next.js 14**, **TypeScript**, **TailwindCSS**, **Prisma** y **Supabase** (PostgreSQL + Storage).

## 🚗 Características

- Landing "one-page" con hero, filtros y grilla de cards.
- Cards con precio, datos clave, vendedor y CTA **Hablar por WhatsApp** (formato E.164 + mensaje sugerido).
- Filtros por búsqueda libre, marca, año mínimo/máximo y rango de precio.
- Paginación simple (querystring `page`).
- Página de detalle por `slug` con metadatos SEO/OG.
- Panel de alta/edición protegido por `ADMIN_TOKEN`, con subida de imágenes a Supabase Storage.
- Badge en `/admin` que monitorea la conexión real con Supabase y avisa si el modo demo está activo.
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
├─ config.ts, prisma.ts, retry.ts, slug.ts, whatsapp.ts, format.ts, supabase.ts, validators.ts
prisma/schema.prisma         # Modelos Seller y Vehicle
scripts/seed.ts              # Semilla inicial
styles/globals.css           # Tailwind + theming
```

## ⚙️ Variables de entorno

Copiá `.env.example` a `.env.local` y completá los placeholders con tus credenciales reales:

```env
# --- Base de datos (Supabase / Postgres)

# Usa SIEMPRE el POOLER (PgBouncer) en producción (Vercel)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Para migraciones locales (puerto 5432 SIN pgbouncer)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres?sslmode=require"

# --- Supabase (API + Storage)

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE="YOUR_SERVICE_ROLE_KEY"
SUPABASE_BUCKET="vehicles"

# --- Admin + datos del vendedor

ADMIN_TOKEN="cambiame_por_un_token_largo_unico"
SELLER_OWNER_NAME="Gerónimo Mendez"
SELLER_OWNER_PHONE="+54911XXXXXXXX"

# --- Proveedor
DB_PROVIDER="supabase"
```

Variables adicionales opcionales:

- `SELLER_MARTIN_PHONE`: teléfono E.164 de Martin Alloatti para que el seed cree su usuario automáticamente.
- `NEXT_PUBLIC_PRIMARY`, `NEXT_PUBLIC_SECONDARY`, `NEXT_PUBLIC_SITE_URL`: theming y metadatos de la landing.

> **Importante:** El `SUPABASE_SERVICE_ROLE` solo se usa en el backend. Nunca lo expongas en componentes cliente ni en el explorador.

📘 Encontrás un checklist completo de Supabase + Vercel en [`README_SUPABASE.md`](./README_SUPABASE.md).

## 🛠️ Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Ejecuta el modo desarrollo (Next.js). |
| `npm run build` | Build de producción (valida envs, corre `prisma generate` y `next build`). |
| `npm run start` | Arranca el servidor en modo producción. |
| `npm run lint` | Linting con ESLint. |
| `npm run db:generate` | Genera el cliente Prisma para entornos con pooler. |
| `npm run db:migrate` | Ejecuta `prisma migrate deploy` (usa `DIRECT_URL`). |
| `npm run db:smoke` | Ejecuta `SELECT 1` contra la base para confirmar conectividad. |
| `npm run diag` | Diagnóstico completo (envs + DB + Storage). |
| `npm run diag:supabase` | Verifica formato del `DATABASE_URL` (pgBouncer) y presencia de claves de Supabase. |
| `npm run env:check` | Valida variables críticas (usa `ALLOW_DEMO_MODE=true` para omitir temporalmente). |
| `npm run test:upload` | Sube un archivo dummy a Supabase Storage y muestra la URL pública. |
| `npm run prisma:migrate` | Ejecuta `prisma migrate dev` en desarrollo local. |
| `npm run seed` | Corre `scripts/seed.ts` con `tsx`. |

## 🚀 Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar variables de entorno:
   ```bash
   cp .env.example .env.local
   # Completar valores (DB, Supabase, tokens, colores)
   ```
3. Preparar Prisma:
   ```bash
   npm run db:generate
   npm run prisma:migrate
   ```
4. Diagnosticar conectividad (opcional recomendado):
   ```bash
   npm run env:check
   npm run diag:supabase
   npm run diag
   npm run test:upload
   ```
5. Ejecutar semilla inicial (opcional):
   ```bash
   npm run seed
   ```
6. Correr el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La app queda disponible en `http://localhost:3000`.

## 🤝 Gestión de inventario

> Si no configurás `DATABASE_URL`, la landing mostrará un catálogo de demostración **con placeholders** para que nadie confunda la demo con stock real. Una vez conectada la base de datos, toda la información vendrá de tu inventario real.

Las publicaciones se gestionan internamente por el equipo comercial. Los clientes interesados se contactan con Martin o Gerónimo y nosotros mismos cargamos cada unidad desde Supabase para mantener la consistencia del catálogo público y privado.

- El panel `/admin` y las APIs permanecen activos para uso interno.
- El seed (`npm run seed`) crea vendedores y vehículos de ejemplo en entornos de prueba.

## 🗄️ Base de datos y Storage

- **Supabase (PostgreSQL):** crear proyecto, copiar el `DATABASE_URL` y configurarlo en `.env.local`. Seguí el checklist de [`README_SUPABASE.md`](./README_SUPABASE.md) para PgBouncer, policies y variables en Vercel.
- **Migrations:** usar `npm run prisma:migrate` en desarrollo. Para producción, ejecutar `npm run db:migrate` (equivale a `prisma migrate deploy`).
- **Healthcheck:** `/api/health/db` ejecuta `SELECT 1` y alimenta el `ConnectionBadge` del panel para mostrar el estado en tiempo real.
- **Storage:** crear bucket `vehicles` con lectura pública. El upload se realiza desde `/api/uploads` usando el `SUPABASE_SERVICE_ROLE` en el backend.

### 📦 Políticas de Storage

Ejecutá este SQL en el editor de Supabase para asegurarte de que el bucket sea público:

```sql
-- Hacer público el bucket si no existe (cambiar 'vehicles' si usas otro)
insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do update set public = true;

-- Permitir lectura pública
create policy if not exists "Public read" on storage.objects
for select using ( bucket_id = 'vehicles' );

-- Escritura: service_role la hace por RLS bypass (no se requiere policy extra).
```

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

## ✅ Checklist de verificación

1. **Local**
   - Copiar `.env.example` a `.env.local` y completar credenciales reales.
   - `npm install`
   - `npm run db:generate` y `npm run prisma:migrate`
   - `npm run env:check` → valida que no falte ninguna variable crítica.
   - `npm run diag:supabase` → revisa formato del `DATABASE_URL` (PgBouncer) y presencia de claves.
   - `npm run diag` → debería mostrar `✅ DB OK` y, si faltan claves, indicarlas.
   - `npm run test:upload` → imprime la URL pública generada por Supabase Storage.
2. **Supabase**
   - Proyecto activo con Postgres accesible desde internet.
   - Bucket `vehicles` (o el definido en `SUPABASE_BUCKET`) marcado como **Public**.
   - SQL de políticas ejecutado y sin errores.
3. **Vercel**
   - En `Project → Settings → Environment Variables`, cargar los mismos valores de `.env.local` para los entornos **Production**, **Preview** y **Development**.
   - Redeploy manual tras actualizar las variables.
   - Verificar `/admin`: ingresar `ADMIN_TOKEN`, confirmar que desaparece el aviso de demo y que la edición/ subida de imágenes responde 200.

## ☁️ Deploy en Vercel

1. Crear proyecto nuevo en Vercel y conectar el repositorio.
2. En `Project → Settings → Environment Variables`, cargar los mismos valores de `.env.local` para los entornos **Production**, **Preview** y **Development** (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_BUCKET`, `ADMIN_TOKEN`, `SELLER_OWNER_NAME`, `SELLER_OWNER_PHONE`, `SELLER_MARTIN_PHONE`, `DB_PROVIDER`, colores opcionales).
3. Configurar Supabase (DB + Storage) accesible desde Vercel.
4. Opcional: agregar script `npm run db:migrate` en “Build & Development Settings → Post-install Command” para aplicar migraciones automáticamente.
5. Deploy automático en cada push a la rama principal.

¡Listo! El sitio queda listo para publicar inventario de vehículos y gestionarlo con un panel simple.
