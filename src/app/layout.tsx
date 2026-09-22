import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

const title = "Adana Open Sahada";
const description = "Adana Open WTA 125: maç programı, bilet satışı ve saha bilgileri.";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: "Adana Open Sahada",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Adana Open Sahada",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    shortcut: "/favicon.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title,
    description,
    images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1638",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="h-full bg-void text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
