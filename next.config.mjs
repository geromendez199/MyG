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
  async headers() {
    // Endurecemos cabeceras base para Vercel/Next sin depender de configuraciones externas.
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
