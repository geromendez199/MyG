import "../styles/globals.css";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { config, siteName } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: config.seo.title,
    template: `%s | ${siteName}`,
  },
  description: config.seo.description,
  openGraph: {
    title: config.seo.title,
    description: config.seo.description,
    url: config.seo.url,
    siteName,
    type: "website",
  },
  metadataBase: new URL(config.seo.url || "https://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeStyle: CSSProperties & {
    "--color-primary"?: string;
    "--color-secondary"?: string;
  } = {
    "--color-primary": config.primary,
    "--color-secondary": config.secondary,
  };

  return (
    <html lang="es">
      <body style={themeStyle}>
        {children}
      </body>
    </html>
  );
}
