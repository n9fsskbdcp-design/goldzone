import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goldzone758.vercel.app"),

  title: {
    default: "Goldzone758 | Sell Gold in St Lucia",
    template: "%s | Goldzone758",
  },

  description:
    "Sell gold in St Lucia with transparent, market-based buying rates. Use our gold calculator to estimate your payout and request a professional evaluation.",

  keywords: [
    "sell gold st lucia",
    "gold buyers st lucia",
    "cash for gold st lucia",
    "gold calculator st lucia",
    "gold price st lucia",
    "scrap gold buyers st lucia",
  ],

  openGraph: {
    title: "Goldzone758 | Sell Gold in St Lucia",
    description:
      "Transparent gold buying rates aligned with international gold prices. Estimate your gold value instantly.",
    url: "https://goldzone758.vercel.app",
    siteName: "Goldzone758",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Goldzone758 | Sell Gold in St Lucia",
    description:
      "Estimate your gold value using live gold prices and request a professional evaluation.",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/icon-192.png",
  },

  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex min-h-screen">

          <Sidebar />

          <main className="flex-1 p-6 pt-20 md:pt-6">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}