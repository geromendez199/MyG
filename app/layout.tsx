import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";

import { config } from "@/lib/config";
import "@/styles/globals.css";

function hexToRgbComponents(hex: string): string | null {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized.length === 6
        ? normalized
        : null;

  if (!expanded) return null;

  const bigint = Number.parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

const primary = hexToRgbComponents(config.primary) ?? "30 58 138"; // tailwind indigo-800
const secondary = hexToRgbComponents(config.secondary) ?? "249 115 22"; // tailwind orange-500
const supportPhone = config.contacts.ownerPhone?.replace(/[^0-9]/g, "");
const metadataBase = (() => {
  try {
    return new URL(config.seo.url);
  } catch {
    return undefined;
  }
})();

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: config.contacts.ownerName,
  url: config.seo.url,
  telephone: config.contacts.ownerPhone || undefined,
  sameAs: undefined,
};

export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
  ...(metadataBase ? { metadataBase } : {}),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          // JSON-LD sin sangría para que Next lo embeba tal cual.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        style={
          {
            ["--primary"]: primary,
            ["--secondary"]: secondary,
          } as CSSProperties
        }
        className="bg-slate-100 text-slate-900 antialiased"
      >
        <div className="relative flex min-h-screen flex-col">
          {/* Skip link para accesibilidad teclado/lectores de pantalla. */}
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow"
          >
            Ir al contenido principal
          </a>
          <div className="pointer-events-none absolute inset-x-0 top-[-10rem] z-0 h-[32rem] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
          <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
              <a
                href="/"
                className="flex items-center gap-3 text-lg font-semibold text-slate-900"
                aria-label="MG Automotores"
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-base font-semibold text-slate-900 sm:text-lg">MG Automotores</span>
                  <span className="text-xs font-medium uppercase tracking-[0.35em] text-slate-400 sm:text-[0.7rem]">
                    Vehículos seleccionados
                  </span>
                </span>
              </a>
              {supportPhone && (
                <a
                  href={`https://wa.me/${supportPhone}`}
                  className="hidden text-sm font-medium text-primary transition hover:text-primary/80 sm:inline-flex"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ¿Necesitás ayuda? Escríbenos
                </a>
              )}
            </div>
          </header>
          <main id="contenido" className="relative z-10 flex-1 pb-16">
            {children}
          </main>
          <footer className="border-t border-white/60 bg-white/80 py-8 text-sm text-slate-500">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} MG Automotores. Todos los derechos reservados.</p>
              <p className="sm:text-right">Vehículos usados seleccionados con asesoramiento personalizado.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
