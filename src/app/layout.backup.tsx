
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google"; // [MODIFIED] Added Outfit
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
// import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { MagicSupport } from "@/components/layout/MagicSupport";
import { SafeHydration } from "@/components/ui/SafeHydration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
}); // [NEW] Added Outfit config

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Clinkar | Bóveda Digital & Transacciones Seguras de Autos",
  description: "Protección legal y fiscal 360° para la compraventa de autos entre particulares. Escrow, Inspección 180 puntos y Mediación certificada.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clinkar",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Clinkar | Compraventa Segura de Autos",
    description: "Tu dinero seguro en la Bóveda Digital hasta que recibes el auto. Únete a la revolución de autos seminuevos.",
    url: "https://clinkar.com",
    siteName: "Clinkar",
    locale: "es_MX",
    type: "website",
    images: ["/icon-512.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinkar | Bóveda Digital",
    description: "Tu dinero seguro hasta que tienes las llaves.",
    images: ["/icon-512.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://clinkar.com',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="clinkar-theme"
        >
          {/* <Navbar /> removed to fix double-nav issue */}
          <GlobalErrorBoundary>
            <SafeHydration fallback={<div className="min-h-screen bg-zinc-950 animate-pulse" />}>
              <main className="min-h-screen">
                <PageTransition>
                  <InstallPrompt />
                  {children}
                </PageTransition>
              </main>
            </SafeHydration>
          </GlobalErrorBoundary>
          <Footer />
          <MagicSupport />
        </ThemeProvider>
      </body>
    </html>
  );
}
