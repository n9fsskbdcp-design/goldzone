"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCachedGoldPrices } from "@/hooks/useCachedGoldPrices";

export default function Home() {
  const { prices, updatedAt, usingOfflinePrices, loading } =
    useCachedGoldPrices();

  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      setShowInstall(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const hasPrices = Object.keys(prices).length > 0;

  return (
    <>
      <div className="max-w-xl mx-auto px-4 py-8 pb-24 bg-white text-gray-900 rounded-xl">
        {/* HERO */}
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Sell Your Gold with Confidence
          </h1>

          <p className="text-sm sm:text-base text-gray-700">
            Live gold pricing aligned with international market conditions.
            Professional gold buying service in St Lucia.
          </p>
        </section>

        {/* GOLD PRICE */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Gold Price Today</h2>

          <p className="text-sm text-gray-700">
            Based on international gold spot prices
          </p>

          {loading ? (
            <div className="h-7 w-40 mt-2 bg-gray-200 rounded animate-pulse" />
          ) : prices["24"] ? (
            <p className="text-xl font-semibold mt-2">
              {Number(prices["24"]).toFixed(2)} XCD / gram (24K)
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              No saved gold prices available yet.
            </p>
          )}

          {updatedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Updated: {new Date(updatedAt).toLocaleString()}
            </p>
          )}

          {/* OFFLINE ONLY */}
          {usingOfflinePrices && !isOnline && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 space-y-1">
              <p className="text-sm text-amber-800">
                Offline mode: using your last saved prices.
              </p>

              <p className="text-sm text-amber-800">
                The calculator can still be used offline.
              </p>

              <p className="text-sm text-amber-800">
                Connect to internet for latest live gold prices.
              </p>
            </div>
          )}
        </section>

        {/* BUYING PRICES */}
        <section className="bg-white rounded-xl shadow-sm p-5 space-y-3 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold">Current Buying Prices</h2>

          {loading ? (
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : hasPrices ? (
            Object.entries(prices).map(([karat, price]) => (
              <div
                key={karat}
                className="flex justify-between border-b border-gray-200 last:border-b-0 py-2"
              >
                <span className="font-medium">{karat}K Gold</span>

                <span className="font-semibold">
                  {Number(price).toFixed(2)} XCD / gram
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No saved prices available yet. Open this page once while online to
              make prices available offline later.
            </p>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1.</strong> Estimate your payout using our{" "}
              <Link href="/calculator" className="underline">
                gold calculator
              </Link>
              .
            </p>

            <p>
              <strong>2.</strong> Submit your gold for evaluation.
            </p>

            <p>
              <strong>3.</strong> Receive payment once weight and purity are
              verified.
            </p>
          </div>
        </section>

        {/* MOBILE INSTALL */}
        {showInstall && (
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 lg:hidden">
            <h2 className="text-lg font-semibold mb-2">
              Install Goldzone App
            </h2>

            <p className="text-sm text-gray-700 mb-4">
              Save Goldzone on your phone for quick access to the calculator
              anytime.
            </p>

            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
              >
                Install App
              </button>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Android:</strong> Tap browser menu ⋮ → Add to Home
                  Screen
                </p>

                <p>
                  <strong>iPhone:</strong> Tap Share → Add to Home Screen
                </p>
              </div>
            )}
          </section>
        )}

        {/* DESKTOP CTA */}
        <div className="hidden lg:block mt-8">
          <Link
            href="/sell"
            className="block text-center bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition"
          >
            Sell Your Gold
          </Link>
        </div>

        {/* DESKTOP INSTALL */}
        {showInstall && (
          <section className="hidden lg:block bg-gray-50 border border-gray-200 rounded-xl p-5 mt-6">
            <h2 className="text-lg font-semibold mb-2">
              Install Goldzone App
            </h2>

            <p className="text-sm text-gray-700 mb-4">
              Save Goldzone on your phone for quick access to the calculator
              anytime.
            </p>

            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
              >
                Install App
              </button>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Android:</strong> Tap browser menu ⋮ → Add to Home
                  Screen
                </p>

                <p>
                  <strong>iPhone:</strong> Tap Share → Add to Home Screen
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden">
        <Link
          href="/sell"
          className="block text-center bg-gray-900 text-white py-3 rounded-lg font-semibold"
        >
          Sell Gold
        </Link>
      </div>
    </>
  );
}