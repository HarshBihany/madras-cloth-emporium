import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import { business, siteUrl } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} — Sarees, Suits, Kurtis & Fabrics in Chas, Bokaro | Since 1970`,
    template: `%s | ${business.name}`,
  },
  description:
    "Family clothing emporium on Bypass Road, Chas, Bokaro since 1970. Sarees, suits & dress materials, kurtis, shirting and suiting fabrics by the metre. Order on WhatsApp, pan-India delivery on request.",
  keywords: [
    "saree shop Chas",
    "Bokaro saree shop",
    "dress material Bokaro",
    "suiting shirting fabric Chas",
    "kurtis Bokaro",
    "wedding shopping Bokaro",
    "Madras Cloth Emporium",
  ],
  applicationName: business.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: business.name,
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#4a0f1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
