import localFont from "next/font/local";

import { Providers } from "./providers";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Resonance",
  description: "Editorial audio dialogue and article ingestion platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white text-black selection:bg-zinc-200 selection:text-black`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
