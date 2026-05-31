import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Oswald } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { LanguageGate } from "@/components/layout/language-gate";
import { SITE } from "@/lib/constants";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${oswald.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <LanguageProvider>
          <LanguageGate />
          <Navbar />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
          <Toaster theme="dark" position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
