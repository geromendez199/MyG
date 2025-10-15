export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Usar valores por defecto para las variables CSS
  const primary = "255 26 26"; // #ff1a1a
  const secondary = "255 255 255"; // #ffffff
  return (
    <html lang="es">
      <body
        style={{
          ["--primary"]: primary,
          ["--secondary"]: secondary,
        } as React.CSSProperties}
        className="min-h-dvh bg-black text-white"
      >
        {children}
      </body>
    </html>
  );
}

