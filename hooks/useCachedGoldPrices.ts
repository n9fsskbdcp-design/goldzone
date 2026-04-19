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

    async function loadPrices() {
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
        const cached = localStorage.getItem(STORAGE_KEY);

        if (cached) {
          try {
            const parsed: CachedPrices = JSON.parse(cached);

            if (!cancelled) {
              setPrices(parsed.prices || {});
              setUpdatedAt(parsed.updatedAt || "");
              setUsingOfflinePrices(true);
              setLoading(false);
            }

            return;
          } catch {
            // ignore invalid cache
          }
        }

        if (!cancelled) {
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