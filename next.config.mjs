/** @type {import('next').NextConfig} */

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  reactStrictMode: true,
  // Si tenés NEXT_PUBLIC_SUPABASE_URL configurada, permite optimización de imágenes desde ese host.
  // Si no, desactiva optimización para no bloquear next/image.
  images: SUPABASE_HOST
    ? {
        remotePatterns: [
          { protocol: 'https', hostname: SUPABASE_HOST },
        ],
      }
    : { unoptimized: true },
};

export default nextConfig;
