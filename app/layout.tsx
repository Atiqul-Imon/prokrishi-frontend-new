import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ConditionalLayout from "./ConditionalLayout";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";
import FontLoader from "../components/FontLoader";
import BanglaFontAdjuster from "../components/BanglaFontAdjuster";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${roboto.variable} antialiased`}>
        <FontLoader />
        <BanglaFontAdjuster />
        <ErrorBoundaryWrapper>
          <AuthProvider>
            <CartProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}

