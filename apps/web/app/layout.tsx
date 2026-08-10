import type { Metadata } from "next";
import { Cinzel, Nunito, Press_Start_2P } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

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
    <html
      lang="tr"
      className={`${cinzel.variable} ${nunito.variable} ${pressStart2P.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
