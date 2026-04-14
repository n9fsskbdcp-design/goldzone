import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Sale = {
  id: string;
  grams: number | null;
  karats: number | null;
  price_paid: number | null;
  total_pay: number | null;
  revenue_price_per_gram: number | null;
  status: "active" | "voided" | null;
};

type RevenuePrices = {
  USD: Record<string, number>;
  EUR: Record<string, number>;
  XCD: Record<string, number>;
};

type CurrencyKey = "USD" | "EUR" | "XCD";

type MoneyTriple = {
  USD: number;
  EUR: number;
  XCD: number;
};

async function getLiveRevenuePrices() {
  const response = await fetch("https://api.gold-api.com/price/XAU", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch live gold price.");
  }

  const data = await response.json();

  const spotPerOunceUsd = Number(data?.price || 0);
  if (!spotPerOunceUsd) {
    throw new Error("Invalid gold price response.");
  }

  const gramsPerOunce = 31.1035;
  const usdToXcd = Number(process.env.USD_TO_XCD || "2.67");
  const usdToEur = Number(process.env.USD_TO_EUR || "0.92");

  const spotPerGramUsd = spotPerOunceUsd / gramsPerOunce;
  const spotPerGramEur = spotPerGramUsd * usdToEur;
  const spotPerGramXcd = spotPerGramUsd * usdToXcd;

  const karats = [24, 22, 18, 14, 12, 10, 9];

  const prices: RevenuePrices = {
    USD: {},
    EUR: {},
    XCD: {},
  };

  for (const k of karats) {
    const purity = k / 24;
    prices.USD[String(k)] = Number((spotPerGramUsd * purity).toFixed(2));
    prices.EUR[String(k)] = Number((spotPerGramEur * purity).toFixed(2));
    prices.XCD[String(k)] = Number((spotPerGramXcd * purity).toFixed(2));
  }

  return {
    prices,
    rates: {
      usdToXcd,
      usdToEur,
      xcdToUsd: usdToXcd > 0 ? 1 / usdToXcd : 0,
      xcdToEur: usdToXcd > 0 ? usdToEur / usdToXcd : 0,
    },
  };
}

function fromXcd(
  xcd: number,
  rates: { xcdToUsd: number; xcdToEur: number }
): MoneyTriple {
  const safe = Number.isFinite(xcd) ? xcd : 0;

  return {
    XCD: safe,
    USD: safe * rates.xcdToUsd,
    EUR: safe * rates.xcdToEur,
  };
}

function formatMoney(currency: CurrencyKey, value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  if (currency === "USD") return `$${safe.toFixed(2)}`;
  if (currency === "EUR") return `€${safe.toFixed(2)}`;
  return `XCD ${safe.toFixed(2)}`;
}

function CurrencyStack({
  values,
  highlight,
}: {
  values: MoneyTriple;
  highlight?: boolean;
}) {
  return (
    <div className={`space-y-1 ${highlight ? "text-green-600" : ""}`}>
      <p className="text-sm font-semibold">{formatMoney("XCD", values.XCD)}</p>
      <p className="text-xs text-gray-500">{formatMoney("USD", values.USD)}</p>
      <p className="text-xs text-gray-500">{formatMoney("EUR", values.EUR)}</p>
    </div>
  );
}

export default async function AdminMoneyPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select(
      "id, grams, karats, price_paid, total_pay, revenue_price_per_gram, status"
    )
    .order("id", { ascending: false });

  if (salesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900">
        <h1 className="text-3xl font-bold mb-4">Money Overview</h1>
        <p className="text-red-600">Could not load sales data.</p>
      </div>
    );
  }

  let liveData;

  try {
    liveData = await getLiveRevenuePrices();
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900">
        <h1 className="text-3xl font-bold mb-4">Money Overview</h1>
        <p className="text-red-600">Could not load live revenue pricing.</p>
      </div>
    );
  }

  const livePrices = liveData.prices;
  const rates = liveData.rates;

  const activeSales = ((sales ?? []) as Sale[]).filter(
    (s) => s.status === "active"
  );

  let totalCostXcd = 0;
  let totalTodayRevenueXcd = 0;
  let totalSaleDayRevenueXcd = 0;

  const rows = activeSales.map((sale) => {
    const grams = Number(sale.grams || 0);
    const karatKey = String(sale.karats || "");
    const customerPaid = Number(sale.price_paid || 0);
    const buyerPayout = Number(sale.total_pay || 0);
    const lockedRevenuePricePerGramXcd = Number(
      sale.revenue_price_per_gram || 0
    );
    const liveRevenuePricePerGramXcd = Number(livePrices.XCD[karatKey] || 0);

    const totalCostForSaleXcd = customerPaid + buyerPayout;
    const saleDayValueXcd = grams * lockedRevenuePricePerGramXcd;
    const todayValueXcd = grams * liveRevenuePricePerGramXcd;
    const value95Xcd = todayValueXcd * 0.95;
    const value90Xcd = todayValueXcd * 0.9;
    const profitTodayXcd = todayValueXcd - totalCostForSaleXcd;
    const marketChangeXcd = todayValueXcd - saleDayValueXcd;

    totalCostXcd += Number.isFinite(totalCostForSaleXcd)
      ? totalCostForSaleXcd
      : 0;
    totalSaleDayRevenueXcd += Number.isFinite(saleDayValueXcd)
      ? saleDayValueXcd
      : 0;
    totalTodayRevenueXcd += Number.isFinite(todayValueXcd) ? todayValueXcd : 0;

    return {
      id: sale.id,
      grams,
      karats: sale.karats,
      customerPaidXcd: customerPaid,
      buyerPayoutXcd: buyerPayout,
      totalCostForSaleXcd,
      lockedRevenuePricePerGramXcd,
      liveRevenuePricePerGramXcd,
      saleDayValueXcd,
      todayValueXcd,
      value95Xcd,
      value90Xcd,
      profitTodayXcd,
      marketChangeXcd,
    };
  });

  const totalProfitTodayXcd = totalTodayRevenueXcd - totalCostXcd;
  const totalMarketGainXcd = totalTodayRevenueXcd - totalSaleDayRevenueXcd;
  const totalValue95Xcd = totalTodayRevenueXcd * 0.95;
  const totalValue90Xcd = totalTodayRevenueXcd * 0.9;
  const profitMargin =
    totalCostXcd > 0 ? (totalProfitTodayXcd / totalCostXcd) * 100 : 0;

  const karatBreakdown = rows.reduce<
    Record<
      string,
      {
        grams: number;
        costXcd: number;
        saleDayValueXcd: number;
        todayValueXcd: number;
      }
    >
  >((acc, sale) => {
    const key = String(sale.karats || "Unknown");

    if (!acc[key]) {
      acc[key] = {
        grams: 0,
        costXcd: 0,
        saleDayValueXcd: 0,
        todayValueXcd: 0,
      };
    }

    acc[key].grams += sale.grams;
    acc[key].costXcd += sale.totalCostForSaleXcd;
    acc[key].saleDayValueXcd += sale.saleDayValueXcd;
    acc[key].todayValueXcd += sale.todayValueXcd;

    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-gray-900">
      <div>
        <h1 className="text-3xl font-bold">Money Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          Admin overview of live gold value, profit, and lower resale estimates
          in XCD, USD, and EUR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <OverviewCard title="Total Cost" values={fromXcd(totalCostXcd, rates)} />
        <OverviewCard
          title="Today Value (100%)"
          values={fromXcd(totalTodayRevenueXcd, rates)}
        />
        <OverviewCard
          title="Today Value (95%)"
          values={fromXcd(totalValue95Xcd, rates)}
        />
        <OverviewCard
          title="Today Value (90%)"
          values={fromXcd(totalValue90Xcd, rates)}
        />
        <OverviewCard
          title="Sale-Day Value"
          values={fromXcd(totalSaleDayRevenueXcd, rates)}
        />
        <OverviewCard
          title="Profit Today"
          values={fromXcd(totalProfitTodayXcd, rates)}
          highlight
        />
        <OverviewCard
          title="Market Gain"
          values={fromXcd(totalMarketGainXcd, rates)}
          highlight
        />
        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Profit %</p>
          <p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      <details className="border rounded-xl p-5 bg-white">
        <summary className="cursor-pointer font-semibold">
          Market Change by Karat
        </summary>

        <div className="mt-4 space-y-3">
          {Object.entries(karatBreakdown).map(([karat, data]) => {
            const profitXcd = data.todayValueXcd - data.costXcd;
            const marketChangeXcd = data.todayValueXcd - data.saleDayValueXcd;

            return (
              <div
                key={karat}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm border-b py-3"
              >
                <div className="font-medium">{karat}K</div>
                <div>{data.grams.toFixed(2)} g</div>
                <div>
                  <span className="text-gray-500 block text-xs">Cost</span>
                  <CurrencyStack values={fromXcd(data.costXcd, rates)} />
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Profit</span>
                  <CurrencyStack values={fromXcd(profitXcd, rates)} highlight />
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">
                    Market Change
                  </span>
                  <CurrencyStack
                    values={fromXcd(marketChangeXcd, rates)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <div className="space-y-3">
        {rows.map((sale) => (
          <details key={sale.id} className="border rounded-lg bg-white">
            <summary className="p-4 cursor-pointer flex flex-col md:flex-row md:justify-between gap-3">
              <span className="font-medium">
                {sale.karats}K • {sale.grams.toFixed(2)}g
              </span>

              <span className="flex flex-col md:items-end text-sm">
                <span className="text-gray-500">
                  Cost: {formatMoney("XCD", sale.totalCostForSaleXcd)}
                </span>
                <span className="text-green-600 font-semibold">
                  Profit: {formatMoney("XCD", sale.profitTodayXcd)}
                </span>
              </span>
            </summary>

            <div className="p-4 border-t text-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <InfoBlock
                  title="Sale-Day Price / g"
                  value={formatMoney("XCD", sale.lockedRevenuePricePerGramXcd)}
                />
                <InfoBlock
                  title="Today Price / g"
                  value={formatMoney("XCD", sale.liveRevenuePricePerGramXcd)}
                />
                <InfoBlock title="Weight" value={`${sale.grams.toFixed(2)} g`} />
                <InfoBlock title="Karat" value={`${sale.karats}K`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <MoneyBlock
                  title="Sale-Day Value"
                  values={fromXcd(sale.saleDayValueXcd, rates)}
                />
                <MoneyBlock
                  title="Today Value (100%)"
                  values={fromXcd(sale.todayValueXcd, rates)}
                />
                <MoneyBlock
                  title="Today Value (95%)"
                  values={fromXcd(sale.value95Xcd, rates)}
                />
                <MoneyBlock
                  title="Today Value (90%)"
                  values={fromXcd(sale.value90Xcd, rates)}
                />
                <MoneyBlock
                  title="Profit Today"
                  values={fromXcd(sale.profitTodayXcd, rates)}
                  highlight
                />
                <MoneyBlock
                  title="Market Change"
                  values={fromXcd(sale.marketChangeXcd, rates)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MoneyBlock
                  title="Customer Paid"
                  values={fromXcd(sale.customerPaidXcd, rates)}
                />
                <MoneyBlock
                  title="Buyer Payout"
                  values={fromXcd(sale.buyerPayoutXcd, rates)}
                />
                <MoneyBlock
                  title="Total Cost"
                  values={fromXcd(sale.totalCostForSaleXcd, rates)}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  values,
  highlight,
}: {
  title: string;
  values: MoneyTriple;
  highlight?: boolean;
}) {
  return (
    <div className="border rounded-xl p-5 bg-white">
      <p className="text-sm text-gray-500 mb-3">{title}</p>
      <CurrencyStack values={values} highlight={highlight} />
    </div>
  );
}

function MoneyBlock({
  title,
  values,
  highlight,
}: {
  title: string;
  values: MoneyTriple;
  highlight?: boolean;
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">{title}</p>
      <CurrencyStack values={values} highlight={highlight} />
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}