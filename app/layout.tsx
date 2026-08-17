import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Absolute base for canonical URLs and OG image paths. Social crawlers reject
 * relative image URLs, so this has to resolve even in preview deployments.
 */
export const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
})();

// Generic defaults only. Each campaign page overrides the whole set — including
// openGraph and twitter — in its own generateMetadata; a specific campaign's
// copy must never sit here, or it leaks onto every other campaign's share card.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "וובינרים",
  description: "דפי נחיתה והרשמה לוובינרים.",
  openGraph: {
    type: "website",
    locale: "he_IL",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3A8A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
