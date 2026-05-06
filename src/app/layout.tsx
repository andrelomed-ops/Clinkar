
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google"; // [MODIFIED] Added Outfit
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
// import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { EliteAdvisor } from "@/components/layout/EliteAdvisor";
import { SafeHydration } from "@/components/ui/SafeHydration";
import { ReferralTracker } from "@/components/layout/ReferralTracker";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { Toaster } from "sonner";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";



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
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://starterkar.vercel.app"),
  title: "StarterKar | Bóveda Digital & Transacciones Seguras de Autos",
  description: "Protección legal y fiscal 360° para la compraventa de autos entre particulares. Escrow, Inspección 180 puntos y Mediación certificada.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StarterKar",
  },
  icons: {
    icon: "/logo_official.png",
    apple: "/logo_official.png",
  },
  openGraph: {
    title: "StarterKar | Compraventa Segura de Autos",
    description: "Tu dinero seguro en la Bóveda Digital hasta que recibes el auto. Inspección de 150 puntos y trámites verificados.",
    url: "https://starterkar.com",
    siteName: "StarterKar",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StarterKar - Compraventa Segura"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "StarterKar | Bóveda Digital",
    description: "Tu dinero seguro hasta que tienes las llaves.",
    creator: "@starterkar_mx",
    images: ["/og-image.jpg"]
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
    canonical: 'https://starterkar.com',
  },
};


export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Cache Buster: v1.1.2 - Force refresh and provide AlertCircle fallback */}
        <meta name="version" content="1.3.9" />
        <script dangerouslySetInnerHTML={{ __html: `
          // 🚨 NUCLEAR CACHE CLEARING - EMERGENCY FIX v4.7
          (function() {
            if (typeof window !== 'undefined') {
              const VERSION = '5.3.9';
              const dummy = function() { return null; };
              
              // Immediate Fallbacks for phantom references
              window.AlertCircle = window.AlertCircle || dummy;
              window.Zap = window.Zap || dummy;
              if (typeof globalThis !== 'undefined') {
                globalThis.AlertCircle = globalThis.AlertCircle || dummy;
                globalThis.Zap = globalThis.Zap || dummy;
              }

              if (localStorage.getItem('clinkar_reset_v') !== VERSION) {
                console.log("StarterKar: Triggering Nuclear Cache Reset v" + VERSION + "...");
                
                // 1. Clear Storage
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  localStorage.setItem('clinkar_reset_v', VERSION);
                } catch(e) {}

                // 2. Unregister Service Workers
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    for(let r of registrations) r.unregister();
                  });
                }

                // 3. Clear Cache Storage
                if ('caches' in window) {
                  caches.keys().then(names => {
                    for (let name of names) caches.delete(name);
                  });
                }

                // 4. Force Hard Reload
                console.warn("StarterKar: Cache purged. Reloading ecosystem...");
                setTimeout(() => window.location.reload(true), 800);
              }
            }
          })();
        ` }} />

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased w-full max-w-full`}
        style={{ overflowX: 'clip' }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="starterkar-theme"
        >
          <PostHogProvider>
            {/* <Navbar /> removed to fix double-nav issue */}
            <GlobalErrorBoundary>
              <SafeHydration fallback={<div className="min-h-screen bg-zinc-950 animate-pulse" />}>
                <div className="min-h-screen w-full max-w-full flex flex-col min-w-0" style={{ overflowX: 'clip' }}>
                  <PageTransition>
                    <ReferralTracker />
                    <InstallPrompt />
                    {children}
                  </PageTransition>
                  <Footer />
                  <MobileBottomNav />
                  <EliteAdvisor />
                </div>
            <Toaster richColors position="top-right" closeButton />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
