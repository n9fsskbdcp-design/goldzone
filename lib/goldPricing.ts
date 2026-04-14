export type GoldPricingResult = {
  generatedPrice: number;
  pricePerGram: number;
  tierLabel: string;
};

export function calculateGoldPayout(
  grams: number,
  karat: string,
  prices: Record<string, number>
): GoldPricingResult {
  const numericWeight = Number(grams) || 0;
  const basePricePerGram = prices[karat] ?? 0;

  if (numericWeight <= 0 || numericWeight > 500 || basePricePerGram <= 0) {
    return {
      generatedPrice: 0,
      pricePerGram: 0,
      tierLabel: "",
    };
  }

  let multiplier = 1;
  let label = "Standard rate applied";

  if (numericWeight >= 100) {
    multiplier = 1.1;
    label = "Premium volume rate applied";
  } else if (numericWeight >= 62) {
    multiplier = 1.05;
    label = "Improved volume rate applied";
  } else if (numericWeight >= 31) {
    multiplier = 1.025;
    label = "Enhanced rate applied";
  }

  const finalPricePerGram = basePricePerGram * multiplier;
  const generatedPrice = numericWeight * finalPricePerGram;

  return {
    generatedPrice,
    pricePerGram: finalPricePerGram,
    tierLabel: label,
  };
}