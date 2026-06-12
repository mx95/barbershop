import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Oswald } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { LanguageGate } from "@/components/layout/language-gate";
import { IntroMotionProvider, IntroMotionController } from "@/lib/motion/intro-context";
import { SITE } from "@/lib/constants";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.tagline} · ${SITE.locationLine}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["barbershop", "Xylophagou", "Larnaca", "Cyprus", "haircut", "fade", "old school haircut", "classic haircut"],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    locale: "en_CY",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0a0a0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable} ${oswald.variable} dark`}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              header [data-nav-desktop] { display: none; }
              header [data-nav-mobile] { display: flex; align-items: center; gap: 0.25rem; }
              header [data-nav-links] { gap: 2rem; }
              header [data-nav-actions] { gap: 0.75rem; }
              @media (min-width: 1024px) {
                header [data-nav-desktop] { display: flex; align-items: center; }
                header [data-nav-mobile] { display: none; }
              }
            `,
          }}
        />
        <link rel="stylesheet" href="/fallback.css" precedence="default" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans antialiased"
      >
        <LanguageProvider>
          <IntroMotionProvider>
            <IntroMotionController />
            <LanguageGate />
            <Navbar />
            <main className="min-h-screen pt-16 sm:pt-20">{children}</main>
            <Footer />
            <Toaster theme="dark" position="top-right" />
          </IntroMotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
