import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "וובינר: השקעה בנדל\"ן בלי פחד | אבינעם הרוש ומשה אדרי | 10/6 ב-20:00",
  description:
    "כל מה שזוגות צעירים ומשקיעים חייבים לדעת לפני חתימת חוזה. וובינר חינמי מהבית - 10/6 בשעה 20:00. מקומות מוגבלים.",
  openGraph: {
    title: "השקעה בנדל\"ן בלי פחד - וובינר חינמי",
    description:
      "אבינעם הרוש ומשה אדרי חושפים את המודלים שפיתחו לאיתור הזדמנויות וניהול סיכונים בשוק הנוכחי.",
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
