# Supabase + Vercel checklist

Esta guía complementa al README principal y resume los pasos para sacar el proyecto del modo demo usando Supabase (PostgreSQL + Storage) desde Vercel.

## 1. Configuración del proyecto en Supabase

1. Crear un nuevo proyecto y habilitar **Connection Pooling (PgBouncer)** en `Project Settings → Database → Connection pooling`.
2. Copiar dos connection strings:
   - **Pooler / 6543** (añadir `?pgbouncer=true&connection_limit=1&sslmode=require`).
   - **Directa / 5432** (añadir `?sslmode=require`) para migraciones y Prisma Studio.
3. Crear un bucket público (por defecto `vehicles`) en `Storage → Buckets`.

## 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar cada valor. Campos mínimos:

- `DATABASE_URL` (pooler 6543 + `pgbouncer=true&connection_limit=1&sslmode=require`).
- `DIRECT_URL` (puerto 5432 sin PgBouncer + `sslmode=require`).
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE` (solo en server, nunca en el cliente).
- `SUPABASE_BUCKET` (por defecto `vehicles`).
- `ADMIN_TOKEN`, `SELLER_OWNER_NAME`, `SELLER_OWNER_PHONE`.

En Vercel, cargar exactamente los mismos valores en **Settings → Environment Variables** para los entornos `Production`, `Preview` y `Development`. Tras guardar, hacer un **Redeploy**.

## 3. SQL de políticas y bucket público

Ejecutar este SQL en el editor de Supabase para asegurar bucket público y RLS básica:

```sql
-- Bucket público (ajustar nombre si usás otro)
insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do update set public = true;

create policy if not exists "Public read" on storage.objects
for select using ( bucket_id = 'vehicles' );

-- Vehicles (publican sólo los marcados como published)
alter table public.vehicles enable row level security;
create policy if not exists vehicles_public_select on public.vehicles
  for select using (published = true);
create policy if not exists vehicles_service_write on public.vehicles
  for all using (auth.role() = 'service_role') with check (true);

-- Sellers
alter table public.sellers enable row level security;
create policy if not exists sellers_public_select on public.sellers
  for select using (true);
create policy if not exists sellers_service_write on public.sellers
  for all using (auth.role() = 'service_role') with check (true);
```

## 4. Scripts útiles

```bash
npm run env:check      # valida variables (usa ALLOW_DEMO_MODE=true si querés omitir temporalmente)
npm run diag:supabase  # verifica presencia de claves y formato del DATABASE_URL
npm run db:generate    # prisma generate
npm run db:migrate     # prisma migrate deploy (usa DIRECT_URL)
npm run db:smoke       # SELECT 1 contra la base
npm run diag           # Chequeo completo (DB + Storage)
npm run test:upload    # Sube un archivo dummy al bucket y muestra la URL pública
```

## 5. Healthchecks

- `/api/health/db` ejecuta `SELECT 1`. Útil para monitoreo y para el `ConnectionBadge` del panel `/admin`.
- Si el endpoint responde con error, revisá `DATABASE_URL`, estado del pooler y las políticas RLS anteriores.

## 6. Troubleshooting rápido

| Síntoma | Diagnóstico recomendado |
| --- | --- |
| `Demo sin base de datos` en `/admin` | Ejecutar `npm run env:check` y `npm run db:smoke`. Revisar PgBouncer (puerto 6543) y credenciales. |
| Error al subir imágenes | Confirmar `SUPABASE_SERVICE_ROLE`, bucket público y ejecutar `npm run test:upload`. |
| Prisma arroja `remaining connection slots are reserved` | Revisar que `DATABASE_URL` tenga `connection_limit=1` y que no existan procesos abiertos (usar PgBouncer). |
| RLS bloquea escrituras | Confirmar políticas anteriores y que el API usa el `service_role`. |

Con estos pasos, el panel debería habilitar edición real y las cargas de imágenes deberían devolver URLs públicas listas para publicar.
