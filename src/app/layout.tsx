"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { EliteAdvisor } from "@/components/layout/EliteAdvisor";
import { Footer } from "@/components/layout/Footer";
import { ReferralTracker } from "@/components/layout/ReferralTracker";
import Script from "next/script";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const VERSION = "4.7.2";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>StarterKar | Bóveda Digital para Compraventa de Autos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover, shrink-to-fit=no" />
        <Script id="nuclear-cache-reset" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          (function() {
            const VERSION = "${VERSION}";
            if (typeof window !== 'undefined') {
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
                setTimeout(() => window.location.reload(true), 800);
              }
            }
          })();
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${outfit.variable} antialiased w-full max-w-full overflow-x-hidden`}
        style={{ position: 'relative' }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="starterkar-theme"
        >
          <div id="root-container" className="min-h-screen w-full max-w-full flex flex-col min-w-0 overflow-x-hidden relative">
            <PageTransition>
              <ReferralTracker />
              {children}
            </PageTransition>
            <Footer />
            <MobileBottomNav />
            <EliteAdvisor />
          </div>
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
