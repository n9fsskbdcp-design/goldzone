import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import InstallFooterLink from "@/components/InstallFooterLink";
import Link from "next/link";
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
  metadataBase: new URL("https://goldzone758.com"),

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
    url: "https://goldzone758.com",
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

  other: {
    "color-scheme": "light",
    "supported-color-schemes": "light",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <div className="flex min-h-screen">

          {/* Sidebar Navigation */}

          <Sidebar />

          <div className="flex flex-col flex-1">

            {/* Page Content */}

            <main className="flex-1 p-6 pt-20 md:pt-6 bg-white">
              {children}
            </main>

            {/* Footer */}

            <footer className="border-t border-gray-200 bg-white py-6">

              <div className="max-w-4xl mx-auto px-4 text-sm text-gray-600 text-center space-y-4">

                {/* Footer Navigation */}

                <div className="flex flex-wrap justify-center gap-5">

                  <Link href="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>

                  <Link href="/terms" className="hover:underline">
                    Terms of Service
                  </Link>

                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>

                  {/* Hidden automatically when app is installed */}

                  <InstallFooterLink />

                </div>

                {/* Trust Message */}

                <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
                  Goldzone provides professional gold evaluation services in
                  St Lucia. Final offers are confirmed after weight and purity
                  testing during inspection. There is no obligation to sell
                  after evaluation.
                </p>

                {/* Copyright */}

                <p className="text-xs text-gray-400">
                  © {new Date().getFullYear()} Goldzone758
                </p>

              </div>

            </footer>

          </div>

        </div>
      </body>
    </html>
  );
}