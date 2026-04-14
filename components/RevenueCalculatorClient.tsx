"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateRevenueValue,
  type RevenuePrices,
  type RevenueCurrency,
} from "@/lib/revenue-pricing";

type RevenuePricesResponse = {
  prices: RevenuePrices;
  updatedAt?: string;
};

const currencies: RevenueCurrency[] = ["USD", "EUR", "XCD"];

function formatMoney(currency: RevenueCurrency, value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  if (currency === "USD") return `$${safe.toFixed(2)}`;
  if (currency === "EUR") return `€${safe.toFixed(2)}`;
  return `XCD ${safe.toFixed(2)}`;
}

export default function RevenueCalculatorClient() {
  const [prices, setPrices] = useState<RevenuePrices>({
    USD: {},
    EUR: {},
    XCD: {},
  });

  const [loadingPrices, setLoadingPrices] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [karat, setKarat] = useState("24");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/revenue-prices", { cache: "no-store" });
        const data: RevenuePricesResponse = await res.json();

        if (!cancelled) {
          setPrices(data.prices || { USD: {}, EUR: {}, XCD: {} });
          setUpdatedAt(data.updatedAt || "");
          setLoadingPrices(false);
        }
      } catch {
        if (!cancelled) {
          setLoadingPrices(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const numericWeight = parseFloat(weight) || 0;

  const results = useMemo(() => {
    return {
      USD: calculateRevenueValue(numericWeight, karat, "USD", prices),
      EUR: calculateRevenueValue(numericWeight, karat, "EUR", prices),
      XCD: calculateRevenueValue(numericWeight, karat, "XCD", prices),
    };
  }, [numericWeight, karat, prices]);

  const handleWeightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");

    if (parts.length > 2) return;

    if (!cleaned) {
      setWeight("");
      return;
    }

    const numeric = parseFloat(cleaned);

    if (numeric > 10000) {
      setWeight("10000");
      return;
    }

    setWeight(cleaned);
  };

  const karatOptions =
    Object.keys(prices.USD || {}).length > 0
      ? Object.keys(prices.USD)
      : ["9", "10", "12", "14", "18", "22", "24"];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Weight (grams)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              placeholder="e.g. 31.1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Karat</label>
            <select
              value={karat}
              onChange={(e) => setKarat(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
            >
              {karatOptions.map((k) => (
                <option key={k} value={k}>
                  {k}K
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingPrices && (
          <p className="text-sm text-gray-500">Loading pricing...</p>
        )}

        {!loadingPrices && updatedAt && (
          <p className="text-xs text-gray-400">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Revenue per gram</p>
          <p className="text-xs text-gray-400">
            Live spot-based resale rate across all currencies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div
              key={currency}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50"
            >
              <p className="text-xs text-gray-500 mb-1">{currency}</p>
              <p className="text-xl font-semibold">
                {formatMoney(currency, results[currency].pricePerGram)}
              </p>
              <p className="text-xs text-gray-400 mt-1">per gram</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Total estimated revenue</p>
          <p className="text-xs text-gray-400">
            Full spot value with lower resale estimates below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div
              key={currency}
              className="border border-gray-200 rounded-xl p-4 bg-white"
            >
              <p className="text-xs text-gray-500 mb-1">{currency}</p>

              <p className="text-2xl font-bold">
                {formatMoney(currency, results[currency].generatedPrice)}
              </p>

              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500">
                  95% resale estimate:{" "}
                  <span className="font-medium text-gray-700">
                    {formatMoney(currency, results[currency].payout95)}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  90% resale estimate:{" "}
                  <span className="font-medium text-gray-700">
                    {formatMoney(currency, results[currency].payout90)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">
            95% and 90% are quick resale references for physical gold where
            selling at full spot may not be realistic.
          </p>
        </div>
      </div>
    </div>
  );
}