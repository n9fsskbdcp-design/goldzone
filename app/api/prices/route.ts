let cachedData: any = null;
let lastFetchTime = 0;

const CACHE_DURATION = 10 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();

    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.gold-api.com/price/XAU");
    const data = await response.json();

    const spotPerOunceUsd = Number(data.price || 0);
    const gramsPerOunce = 31.1035;
    const usdToXcd = 2.67;

    const spotPerGramXcd =
      (spotPerOunceUsd / gramsPerOunce) * usdToXcd;

    const margin = 0.5;

    const karats = [24, 22, 18, 14, 12, 10, 9];
    const prices: Record<string, number> = {};

    karats.forEach((k) => {
      const purity = k / 24;

      const buyPrice = spotPerGramXcd * purity * (1 - margin);

      prices[k.toString()] = Number(buyPrice.toFixed(2));
    });

    const result = {
      prices,
      updatedAt: new Date(),
    };

    cachedData = result;
    lastFetchTime = now;

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch gold price." }),
      { status: 500 }
    );
  }
}