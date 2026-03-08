"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data.prices);
        setUpdatedAt(data.updatedAt);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* HERO */}
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          Sell Your Gold with Confidence
        </h1>

        <p className="text-gray-600 text-sm sm:text-base">
          Transparent pricing aligned with international gold market conditions.
          Professional gold buying service in St Lucia.
        </p>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700 mb-8">

        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Transparent pricing</span>
        </div>

        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Professional testing</span>
        </div>

        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>No obligation to sell</span>
        </div>

        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Serving St Lucia</span>
        </div>

      </section>

      {/* GOLD PRICE TODAY */}
      <section className="bg-gray-100 rounded-xl p-5 mb-6">

        <h2 className="text-lg font-semibold mb-2">
          Gold Price Today in St Lucia
        </h2>

        <p className="text-sm text-gray-600">
          Based on international gold spot prices.
        </p>

        {prices["24"] && (
          <p className="text-xl font-semibold mt-2">
            {Number(prices["24"]).toFixed(2)} XCD / gram (24K)
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">
          Updated frequently based on global gold market conditions.
        </p>

      </section>

      {/* CURRENT BUYING PRICES */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-3 mb-8">

        <h2 className="text-lg font-semibold mb-2">
          Current Buying Prices
        </h2>

        {Object.entries(prices).map(([karat, price]) => (
          <div
            key={karat}
            className="flex justify-between items-center border-b last:border-b-0 py-2"
          >
            <span className="font-medium">{karat}K Gold</span>

            <span className="font-semibold">
              {Number(price).toFixed(2)} XCD / gram
            </span>
          </div>
        ))}

        {updatedAt && (
          <p className="text-xs text-gray-400 pt-2">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}

      </section>

      {/* HOW IT WORKS */}
      <section className="mb-8">

        <h2 className="text-lg font-semibold mb-4">
          How It Works
        </h2>

        <div className="space-y-3 text-sm text-gray-600">

          <p>
            <strong>1.</strong> Estimate your payout using our{" "}
            <Link href="/calculator" className="underline hover:text-gray-700">
              gold calculator
            </Link>.
          </p>

          <p>
            <strong>2.</strong> Submit your gold for professional evaluation.
          </p>

          <p>
            <strong>3.</strong> Receive payment once weight and purity are verified.
          </p>

        </div>

      </section>

      {/* CTA */}
      <section className="mb-6">

        <Link
          href="/sell"
          className="block text-center bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition"
        >
          Sell Gold Now
        </Link>

      </section>

      {/* EDUCATION LINKS */}
      <section className="text-xs text-gray-500 space-y-1">

        <p>
          Learn about gold purity in our{" "}
          <Link href="/gold-guide" className="underline hover:text-gray-700">
            Gold Guide
          </Link>.
        </p>

        <p>
          Have questions?{" "}
          <Link href="/faq" className="underline hover:text-gray-700">
            View FAQ
          </Link>.
        </p>

      </section>

    </div>
  );
}