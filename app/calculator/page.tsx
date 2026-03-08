"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Calculator() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [karat, setKarat] = useState<string>("24");
  const [total, setTotal] = useState<number>(0);
  const [pricePerGram, setPricePerGram] = useState<number>(0);
  const [tierLabel, setTierLabel] = useState<string>("");

  useEffect(() => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data.prices);
        setUpdatedAt(data.updatedAt);
      })
      .catch(console.error);
  }, []);

  const handleWeightChange = (value: string) => {
    const numeric = parseFloat(value);

    if (!value) {
      setWeight("");
      return;
    }

    if (numeric > 500) {
      setWeight("500");
      return;
    }

    setWeight(value);
  };

  useEffect(() => {
    const numericWeight = parseFloat(weight) || 0;

    if (numericWeight > 500) return;

    const basePricePerGram = prices[karat] ?? 0;

    if (numericWeight <= 0 || basePricePerGram <= 0) {
      setTotal(0);
      setPricePerGram(0);
      setTierLabel("");
      return;
    }

    let multiplier = 1;
    let label = "Standard rate applied";

    if (numericWeight >= 100) {
      multiplier = 1.15;
      label = "Premium volume rate applied";
    } else if (numericWeight >= 62) {
      multiplier = 1.10;
      label = "Improved volume rate applied";
    } else if (numericWeight >= 31) {
      multiplier = 1.05;
      label = "Enhanced rate applied";
    }

    const finalPricePerGram = basePricePerGram * multiplier;

    setPricePerGram(finalPricePerGram);
    setTotal(numericWeight * finalPricePerGram);
    setTierLabel(label);

  }, [weight, karat, prices]);

  const numericWeight = parseFloat(weight) || 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        Gold Value Calculator
      </h1>

      <p className="text-gray-600 text-sm sm:text-base mb-4">
        Estimate your payout using our current buying rates.
      </p>

      <p className="text-xs text-gray-500 mb-6">
        Not sure about your karat?{" "}
        <Link href="/gold-guide" className="underline hover:text-gray-700">
          View our Gold Guide
        </Link>
      </p>

      {/* Input Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            Weight (grams)
          </label>

          <input
            type="number"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="Enter weight"
            className="border px-4 py-3 w-full rounded-lg text-base"
            min="0"
            max="500"
          />

          <p className="text-xs text-gray-500 mt-2">
            Maximum calculator limit is 500 grams.
          </p>

          {numericWeight >= 400 && (
            <p className="text-xs text-amber-600 mt-2">
              Large quantities may qualify for custom pricing during evaluation.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Karat
          </label>

          <select
            value={karat}
            onChange={(e) => setKarat(e.target.value)}
            className="border px-4 py-3 w-full rounded-lg text-base"
          >
            {Object.keys(prices).map((k) => (
              <option key={k} value={k}>
                {k}K
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Results */}
      <div className="bg-gray-100 p-6 rounded-xl mt-6 space-y-3">

        <p className="text-sm text-gray-600">
          Your Rate
        </p>

        <p className="text-lg font-semibold">
          {pricePerGram > 0
            ? `${pricePerGram.toFixed(2)} XCD / gram`
            : "—"}
        </p>

        <p className="text-xs text-gray-500">
          Estimated payout
        </p>

        <p className="text-3xl font-bold">
          {total > 0 ? `${total.toFixed(2)} XCD` : "0.00 XCD"}
        </p>

        {tierLabel && (
          <p className="text-xs text-gray-500">
            {tierLabel}
          </p>
        )}

        <p className="text-xs text-gray-500">
          Buying rates update frequently based on live international gold market conditions.
        </p>

        {updatedAt && (
          <p className="text-xs text-gray-400">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}

        {total > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-3">

            <p className="text-sm text-gray-700 mb-2">
              Ready to sell this gold?
            </p>

            <Link
              href="/sell"
              className="block text-center bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Sell Now
            </Link>

            <p className="text-xs text-gray-500 text-center mt-2">
              No obligation. Final offer confirmed after inspection.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}