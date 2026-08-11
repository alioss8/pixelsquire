import type { Metadata } from "next";
import type { Viewport } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelSquire",
  description: "Pixel-art şövalye mascotlu motivasyon uygulaması",
  appleWebApp: {
    capable: true,
    title: "PixelSquire",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icon-192.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#e0a458",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
