"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { EliteAdvisor } from "@/components/layout/EliteAdvisor";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { Footer } from "@/components/layout/Footer";
import { GlobalErrorBoundary } from "@/components/layout/GlobalErrorBoundary";
import { ReferralTracker } from "@/components/marketing/ReferralTracker";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { SafeHydration } from "@/components/layout/SafeHydration";
import Script from "next/script";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const VERSION = "4.7.1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="overflow-x-clip">
      <head>
        <title>StarterKar | Bóveda Digital para Compraventa de Autos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <Script id="nuclear-cache-reset" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          (function() {
            const VERSION = "${VERSION}";
            const dummy = () => {};
            if (typeof window !== 'undefined') {
              window.AlertCircle = window.AlertCircle || dummy;
              window.Zap = window.Zap || dummy;
              if (typeof globalThis !== 'undefined') {
                globalThis.AlertCircle = globalThis.AlertCircle || dummy;
                globalThis.Zap = globalThis.Zap || dummy;
              }

              if (localStorage.getItem('clinkar_reset_v') !== VERSION) {
                console.log("StarterKar: Triggering Nuclear Cache Reset v" + VERSION + "...");
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  localStorage.setItem('clinkar_reset_v', VERSION);
                } catch(e) {}
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    for(let r of registrations) r.unregister();
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(names => {
                    for (let name of names) caches.delete(name);
                  });
                }
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
              </SafeHydration>
            </GlobalErrorBoundary>
            <Toaster richColors position="top-right" closeButton />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
