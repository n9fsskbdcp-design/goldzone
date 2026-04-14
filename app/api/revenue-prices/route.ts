let cachedRevenueData: any = null;
let lastRevenueFetchTime = 0;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const now = Date.now();

    if (cachedRevenueData && now - lastRevenueFetchTime < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedRevenueData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.gold-api.com/price/XAU");

    if (!response.ok) {
      throw new Error("Failed to fetch gold price");
    }

    const data = await response.json();

    const spotPerOunceUsd = Number(data.price || 0);
    const gramsPerOunce = 31.1035;

    const usdToXcd = Number(process.env.USD_TO_XCD || "2.67");
    const usdToEur = Number(process.env.USD_TO_EUR || "0.92");

    // Base USD price per gram
    const spotPerGramUsd = spotPerOunceUsd / gramsPerOunce;

    // Convert
    const spotPerGramXcd = spotPerGramUsd * usdToXcd;
    const spotPerGramEur = spotPerGramUsd * usdToEur;

    const karats = [24, 22, 18, 14, 12, 10, 9];

    const pricesUsd: Record<string, number> = {};
    const pricesEur: Record<string, number> = {};
    const pricesXcd: Record<string, number> = {};

    karats.forEach((k) => {
      const purity = k / 24;

      pricesUsd[k.toString()] = Number((spotPerGramUsd * purity).toFixed(2));
      pricesEur[k.toString()] = Number((spotPerGramEur * purity).toFixed(2));
      pricesXcd[k.toString()] = Number((spotPerGramXcd * purity).toFixed(2));
    });

    const result = {
      prices: {
        USD: pricesUsd,
        EUR: pricesEur,
        XCD: pricesXcd,
      },
      updatedAt: new Date().toISOString(),
    };

    cachedRevenueData = result;
    lastRevenueFetchTime = now;

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch live revenue gold price." }),
      { status: 500 }
    );
  }
}