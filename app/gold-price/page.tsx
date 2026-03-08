"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GoldPrice() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState("");

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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">

      <section>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          Gold Price in St Lucia Today
        </h1>

        <p className="text-gray-600 text-sm sm:text-base">
          The gold prices below are derived from live international gold market
          prices and converted to Eastern Caribbean Dollars (XCD).
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5 space-y-3">

        <h2 className="text-lg font-semibold mb-2">
          Current Gold Prices (per gram)
        </h2>

        {Object.entries(prices).map(([karat, price]) => (
          <div
            key={karat}
            className="flex justify-between border-b last:border-none py-2"
          >
            <span>{karat}K Gold</span>

            <span className="font-semibold">
              {Number(price).toFixed(2)} XCD
            </span>
          </div>
        ))}

        {updatedAt && (
          <p className="text-xs text-gray-500 pt-2">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}
      </section>

      <section className="text-sm text-gray-600 space-y-2">

        <p>
          Gold prices fluctuate based on international gold markets, currency
          exchange rates, and local demand.
        </p>

        <p>
          If you are selling gold in St Lucia, the final payout depends on the
          weight and purity of the gold after professional testing.
        </p>

      </section>

      <section className="pt-4">

        <Link
          href="/calculator"
          className="block text-center bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          Use Gold Calculator
        </Link>

      </section>

    </div>
  );
}