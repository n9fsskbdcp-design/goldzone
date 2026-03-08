// /app/api/prices/route.ts

let cachedData: any = null;
let lastFetchTime = 0;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const now = Date.now();

    // If cached and still valid, return it
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch live price
    const response = await fetch("https://api.gold-api.com/price/XAU");
    const data = await response.json();

    const spotPerOunceUsd = data.price;
    const gramsPerOunce = 31.1035;
    const usdToXcd = 2.67;

    const spotPerGramXcd =
      (spotPerOunceUsd / gramsPerOunce) * usdToXcd;

    const margin = 0.50;

    const karats = [24, 22, 18, 14, 12, 10, 9];
    const prices: Record<string, number> = {};

    karats.forEach((k) => {
      const purity = k / 24;
      const buyPrice = spotPerGramXcd * purity * (1 - margin);
      prices[String(k)] = Number(buyPrice.toFixed(2));
    });

    const result = {
      prices,
      updatedAt: new Date(),
    };

    // Store in cache
    cachedData = result;
    lastFetchTime = now;

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch live gold price." }),
      { status: 500 }
    );
  }
}