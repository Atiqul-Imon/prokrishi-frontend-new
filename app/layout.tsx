import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FishCartProvider } from "./context/FishCartContext";
import ConditionalLayout from "./ConditionalLayout";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";
import BanglaFontAdjuster from "../components/BanglaFontAdjuster";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
import ResourcePrefetcher from "../components/ResourcePrefetcher";
import OfflineIndicator from "../components/OfflineIndicator";
import { SkipLinks } from "../components/SkipLinks";
import LazyLoadedComponents from "../components/LazyLoadedComponents";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true, // Keep preload but ensure font is used immediately via className
});

export const metadata: Metadata = {
  title: "ProKrishi • Modern Commerce Experience",
  description: "Fresh green/amber experience with robust checkout and invoicing.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/prokrishi-icon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/prokrishi-icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/prokrishi-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/prokrishi-icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/prokrishi-icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/prokrishi-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--background)] text-[var(--foreground)]">
      <head>
        {/* Preconnect to ImageKit CDN for faster image loading */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Load Kalpurush font server-side to avoid CORS errors */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kalpurush:wght@400;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Preload logo for immediate display - explicit preload prevents warning */}
        <link
          rel="preload"
          href="/logo/prokrishihublogo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <SkipLinks />
        <LazyLoadedComponents />
        <ResourcePrefetcher />
        {/* FontLoader removed - fonts now loaded server-side to avoid CORS errors */}
        <BanglaFontAdjuster />
        <ServiceWorkerRegistration />
        <OfflineIndicator />
        <ErrorBoundaryWrapper>
          <AuthProvider>
            <CartProvider>
              <FishCartProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </FishCartProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}

