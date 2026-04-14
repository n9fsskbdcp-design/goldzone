// lib/revenuePricing.ts

export type RevenueCurrency = "USD" | "EUR" | "XCD";

export type RevenuePrices = Record<RevenueCurrency, Record<string, number>>;

export type RevenuePricingResult = {
  generatedPrice: number;
  pricePerGram: number;
  tierLabel: string;
  payout95: number;
  payout90: number;
};

export function calculateRevenueValue(
  grams: number,
  karat: string,
  currency: RevenueCurrency,
  prices: RevenuePrices
): RevenuePricingResult {
  const numericWeight = Number(grams) || 0;
  const basePricePerGram = prices[currency]?.[karat] ?? 0;

  if (numericWeight <= 0 || numericWeight > 10000 || basePricePerGram <= 0) {
    return {
      generatedPrice: 0,
      pricePerGram: 0,
      tierLabel: "",
      payout95: 0,
      payout90: 0,
    };
  }

  const generatedPrice = numericWeight * basePricePerGram;

  return {
    generatedPrice,
    pricePerGram: basePricePerGram,
    tierLabel: "Live spot-based resale rate",
    payout95: generatedPrice * 0.95,
    payout90: generatedPrice * 0.9,
  };
}