"use client";
import { useEffect, useState } from "react";

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Current Gold Buying Prices
      </h1>

      <div className="border rounded p-5 bg-gray-50 space-y-3">
        {Object.entries(prices).map(([karat, price]) => (
          <div
            key={karat}
            className="flex justify-between items-center border-b last:border-b-0 pb-2"
          >
            <span className="font-medium">{karat}K Gold</span>
            <span className="font-semibold">
              {Number(price).toFixed(2)} XCD / gram
            </span>
          </div>
        ))}
      </div>

      {/* Professional Pricing Notes */}
      <p className="text-sm text-gray-600 mt-4">
        Prices are based on live international gold market rates. Larger quantities may qualify for improved pricing.
      </p>

      <p className="text-xs text-gray-500 mt-2">
        Final payout is confirmed after inspection and purity verification.
      </p>

      {/* Optional timestamp */}
      {updatedAt && (
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}