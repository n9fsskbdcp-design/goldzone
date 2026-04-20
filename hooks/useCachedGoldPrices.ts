"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "goldzone_cached_prices";

export type CachedPrices = {
  prices: Record<string, number>;
  updatedAt?: string;
};

export function useCachedGoldPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState("");
  const [usingOfflinePrices, setUsingOfflinePrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCachedPrices = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) return false;

        const parsed: CachedPrices = JSON.parse(cached);

        if (!cancelled) {
          setPrices(parsed.prices || {});
          setUpdatedAt(parsed.updatedAt || "");
          setUsingOfflinePrices(true);
          setLoading(false);
        }

        return true;
      } catch {
        return false;
      }
    };

    async function loadPrices() {
      const hadCachedPrices = loadCachedPrices();

      try {
        const res = await fetch("/api/prices", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch prices");
        }

        const data: CachedPrices = await res.json();

        if (!cancelled) {
          setPrices(data.prices || {});
          setUpdatedAt(data.updatedAt || "");
          setUsingOfflinePrices(false);
          setLoading(false);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        if (!hadCachedPrices && !cancelled) {
          setLoading(false);
        }
      }
    }

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    prices,
    updatedAt,
    usingOfflinePrices,
    loading,
  };
}