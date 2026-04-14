import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminEditSaleButton from "@/components/AdminEditSaleButton";

type Sale = {
  id: string;
  user_id: string;
  sale_date: string;
  customer_name: string | null;
  grams: number;
  karats: number;
  generated_price: number;
  price_per_gram: number;
  pricing_tier_label: string | null;
  price_paid: number;
  base_fee: number;
  commission_rate: number;
  commission_amount: number;
  total_pay: number;
  notes: string | null;
  status: "active" | "voided";
  void_reason: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  role: string | null;
};

type BuyerSummary = {
  userId: string;
  sales: Sale[];
  allSalesCount: number;
  activeSalesCount: number;
  totalGrams: number;
  totalPaid: number;
  totalCommission: number;
  totalPayout: number;
  totalGenerated: number;
};

type KaratSummary = {
  karat: number;
  activeSalesCount: number;
  grams: number;
  paid: number;
  commission: number;
  payout: number;
  generated: number;
};

export default async function AdminSalesPage() {
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
      "id, user_id, sale_date, customer_name, grams, karats, generated_price, price_per_gram, pricing_tier_label, price_paid, base_fee, commission_rate, commission_amount, total_pay, notes, status, void_reason, created_at"
    )
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (salesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Sales</h1>
        <p className="text-red-600">Could not load sales records.</p>
      </div>
    );
  }

  const rows: Sale[] = (sales ?? []) as unknown as Sale[];
  const activeRows = rows.filter((sale) => sale.status === "active");
  const voidedRows = rows.filter((sale) => sale.status === "voided");

  const uniqueUserIds = Array.from(
    new Set(rows.map((sale) => sale.user_id).filter(Boolean))
  );

  let profilesById = new Map<string, Profile>();

  if (uniqueUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, role")
      .in("id", uniqueUserIds);

    profilesById = new Map(
      ((profiles ?? []) as unknown as Profile[]).map((p) => [p.id, p])
    );
  }

  const totalSales = rows.length;
  const totalActiveSales = activeRows.length;
  const totalVoidedSales = voidedRows.length;

  const totalGrams = activeRows.reduce(
    (sum, sale) => sum + Number(sale.grams || 0),
    0
  );
  const totalPaid = activeRows.reduce(
    (sum, sale) => sum + Number(sale.price_paid || 0),
    0
  );
  const totalCommission = activeRows.reduce(
    (sum, sale) => sum + Number(sale.commission_amount || 0),
    0
  );
  const totalPayout = activeRows.reduce(
    (sum, sale) => sum + Number(sale.total_pay || 0),
    0
  );
  const totalGenerated = activeRows.reduce(
    (sum, sale) => sum + Number(sale.generated_price || 0),
    0
  );
  const totalFullCost = totalPaid + totalPayout;

  const buyerMap = new Map<string, BuyerSummary>();

  for (const sale of rows) {
    const current = buyerMap.get(sale.user_id) ?? {
      userId: sale.user_id,
      sales: [],
      allSalesCount: 0,
      activeSalesCount: 0,
      totalGrams: 0,
      totalPaid: 0,
      totalCommission: 0,
      totalPayout: 0,
      totalGenerated: 0,
    };

    current.sales.push(sale);
    current.allSalesCount += 1;

    if (sale.status === "active") {
      current.activeSalesCount += 1;
      current.totalGrams += Number(sale.grams || 0);
      current.totalPaid += Number(sale.price_paid || 0);
      current.totalCommission += Number(sale.commission_amount || 0);
      current.totalPayout += Number(sale.total_pay || 0);
      current.totalGenerated += Number(sale.generated_price || 0);
    }

    buyerMap.set(sale.user_id, current);
  }

  const buyerRows = Array.from(buyerMap.values()).sort(
    (a, b) => b.totalPayout + b.totalPaid - (a.totalPayout + a.totalPaid)
  );

  const karatMap = new Map<number, KaratSummary>();

  for (const sale of activeRows) {
    const karat = Number(sale.karats || 0);
    const current = karatMap.get(karat) ?? {
      karat,
      activeSalesCount: 0,
      grams: 0,
      paid: 0,
      commission: 0,
      payout: 0,
      generated: 0,
    };

    current.activeSalesCount += 1;
    current.grams += Number(sale.grams || 0);
    current.paid += Number(sale.price_paid || 0);
    current.commission += Number(sale.commission_amount || 0);
    current.payout += Number(sale.total_pay || 0);
    current.generated += Number(sale.generated_price || 0);

    karatMap.set(karat, current);
  }

  const karatRows = Array.from(karatMap.values()).sort(
    (a, b) => a.karat - b.karat
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Sales</h1>
      <p className="text-sm text-gray-600 mb-8">
        Organized overview of all buyer-entered sales.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 mb-8">
        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">All Sales</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Active Sales</p>
          <p className="text-2xl font-bold">{totalActiveSales}</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Voided Sales</p>
          <p className="text-2xl font-bold">{totalVoidedSales}</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Total Grams</p>
          <p className="text-2xl font-bold">{totalGrams.toFixed(2)} g</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Gold Paid</p>
          <p className="text-2xl font-bold">{totalPaid.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Full Cost</p>
          <p className="text-2xl font-bold">{totalFullCost.toFixed(2)} XCD</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Buyer Compensation</p>
          <p className="text-2xl font-bold">{totalPayout.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="text-2xl font-bold">{totalCommission.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Generated Value</p>
          <p className="text-2xl font-bold">{totalGenerated.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Buyers With Sales</p>
          <p className="text-2xl font-bold">{buyerRows.length}</p>
        </div>
      </div>

      <div className="border rounded-xl p-5 bg-white mb-8">
        <h2 className="text-xl font-semibold mb-4">Karat Breakdown</h2>

        {karatRows.length === 0 ? (
          <p className="text-gray-600">No active sales found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Karat</th>
                  <th className="py-3 pr-4">Sales</th>
                  <th className="py-3 pr-4">Grams</th>
                  <th className="py-3 pr-4">Gold Paid</th>
                  <th className="py-3 pr-4">Buyer Compensation</th>
                  <th className="py-3 pr-4">Full Cost</th>
                  <th className="py-3 pr-4">Avg Full Cost/Gram</th>
                  <th className="py-3 pr-4">Commission</th>
                  <th className="py-3 pr-4">Generated</th>
                  <th className="py-3 pr-4">Avg Generated/Gram</th>
                </tr>
              </thead>
              <tbody>
                {karatRows.map((row) => {
                  const fullCost = row.paid + row.payout;
                  const avgFullCostPerGram =
                    row.grams > 0 ? fullCost / row.grams : 0;
                  const avgGeneratedPerGram =
                    row.grams > 0 ? row.generated / row.grams : 0;

                  return (
                    <tr key={row.karat} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium">{row.karat}K</td>
                      <td className="py-3 pr-4">{row.activeSalesCount}</td>
                      <td className="py-3 pr-4">{row.grams.toFixed(2)} g</td>
                      <td className="py-3 pr-4">{row.paid.toFixed(2)} XCD</td>
                      <td className="py-3 pr-4">{row.payout.toFixed(2)} XCD</td>
                      <td className="py-3 pr-4">{fullCost.toFixed(2)} XCD</td>
                      <td className="py-3 pr-4">
                        {avgFullCostPerGram.toFixed(2)} XCD
                      </td>
                      <td className="py-3 pr-4">{row.commission.toFixed(2)} XCD</td>
                      <td className="py-3 pr-4">{row.generated.toFixed(2)} XCD</td>
                      <td className="py-3 pr-4">
                        {avgGeneratedPerGram.toFixed(2)} XCD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border rounded-xl p-5 bg-white">
        <h2 className="text-xl font-semibold mb-4">Sales by Buyer</h2>

        {buyerRows.length === 0 ? (
          <p className="text-gray-600">No sales found.</p>
        ) : (
          <div className="space-y-4">
            {buyerRows.map((buyer) => {
              const fullCost = buyer.totalPaid + buyer.totalPayout;
              const avgFullCostPerGram =
                buyer.totalGrams > 0 ? fullCost / buyer.totalGrams : 0;

              return (
                <details key={buyer.userId} className="border rounded-lg bg-white">
                  <summary className="list-none cursor-pointer p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="font-medium break-all">{buyer.userId}</p>
                        <p className="text-sm text-gray-500">
                          Role: {profilesById.get(buyer.userId)?.role || "—"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 xl:flex xl:items-center gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Sales:</span>{" "}
                          <span className="font-semibold">{buyer.allSalesCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Active:</span>{" "}
                          <span className="font-semibold">
                            {buyer.activeSalesCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Grams:</span>{" "}
                          <span className="font-semibold">
                            {buyer.totalGrams.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gold Paid:</span>{" "}
                          <span className="font-semibold">
                            {buyer.totalPaid.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Full Cost/g:</span>{" "}
                          <span className="font-semibold">
                            {avgFullCostPerGram.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Full Cost:</span>{" "}
                          <span className="font-semibold">
                            {fullCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </summary>

                  <div className="px-4 pb-4 border-t">
                    <div className="space-y-3 mt-4">
                      {buyer.sales.map((sale) => {
                        const difference =
                          Number(sale.price_paid || 0) -
                          Number(sale.generated_price || 0);
                        const isVoided = sale.status === "voided";
                        const fullCost = Number(sale.price_paid || 0) + Number(sale.total_pay || 0);
                        const fullCostPerGram =
                          Number(sale.grams || 0) > 0 ? fullCost / Number(sale.grams || 0) : 0;

                        return (
                          <details
                            key={sale.id}
                            className={`border rounded-lg bg-white ${
                              isVoided ? "opacity-70 bg-gray-50" : ""
                            }`}
                          >
                            <summary className="list-none cursor-pointer p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="font-medium">
                                    {sale.customer_name?.trim() || "Unnamed customer"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {sale.sale_date}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">Karat:</span>{" "}
                                    <span className="font-semibold">{sale.karats}K</span>
                                  </div>

                                  <div>
                                    <span className="text-gray-500">Grams:</span>{" "}
                                    <span className="font-semibold">
                                      {Number(sale.grams).toFixed(2)}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-gray-500">Gold Paid:</span>{" "}
                                    <span className="font-semibold">
                                      {Number(sale.price_paid).toFixed(2)}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-gray-500">Full Cost:</span>{" "}
                                    <span className="font-semibold">
                                      {fullCost.toFixed(2)}
                                    </span>
                                  </div>

                                  <div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        isVoided
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {isVoided ? "Voided" : "Active"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </summary>

                            <div className="px-4 pb-4 border-t">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                                <div className="text-sm text-gray-500">
                                  Sale details
                                </div>

                                <AdminEditSaleButton sale={sale} />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 text-sm text-gray-700">
                                <p>
                                  <span className="text-gray-500">Generated:</span>{" "}
                                  {Number(sale.generated_price).toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Rate/gram:</span>{" "}
                                  {Number(sale.price_per_gram).toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Base Fee:</span>{" "}
                                  {Number(sale.base_fee).toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Commission:</span>{" "}
                                  {Number(sale.commission_amount).toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Buyer Compensation:</span>{" "}
                                  {Number(sale.total_pay).toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Full Cost/g:</span>{" "}
                                  {fullCostPerGram.toFixed(2)}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm text-gray-600">
                                <p>
                                  <span className="text-gray-500">Gold tier:</span>{" "}
                                  {sale.pricing_tier_label || "—"}
                                </p>
                                <p>
                                  <span className="text-gray-500">Adjustment:</span>{" "}
                                  {difference >= 0 ? "+" : ""}
                                  {difference.toFixed(2)} XCD
                                </p>
                                <p>
                                  <span className="text-gray-500">Created:</span>{" "}
                                  {new Date(sale.created_at).toLocaleString()}
                                </p>
                              </div>

                              {sale.notes && (
                                <p className="text-sm text-gray-600 mt-3">
                                  <span className="text-gray-500">Notes:</span>{" "}
                                  {sale.notes}
                                </p>
                              )}

                              {isVoided && sale.void_reason && (
                                <p className="text-sm text-red-700 mt-3">
                                  <span className="text-red-500">Void reason:</span>{" "}
                                  {sale.void_reason}
                                </p>
                              )}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}