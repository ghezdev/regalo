import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regalo",
  description: "Plaza nocturna romantica para Naomi.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
