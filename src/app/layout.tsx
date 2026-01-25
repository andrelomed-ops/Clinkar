import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinkar | Bóveda Digital para Autos Seminuevos",
  description: "Plataforma de intermediación segura para la compra y venta de autos. Seguridad garantizada por código QR.",
  openGraph: {
    title: "Clinkar | Compraventa Segura de Autos",
    description: "Tu dinero seguro en la Bóveda Digital hasta que recibes el auto. Únete a la revolución de autos seminuevos.",
    url: "https://clinkar.com",
    siteName: "Clinkar",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinkar | Bóveda Digital",
    description: "Tu dinero seguro hasta que tienes las llaves.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
