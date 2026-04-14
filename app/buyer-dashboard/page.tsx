import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddSaleForm from "../../components/AddSaleForm";
import SalePhotos from "../../components/SalePhotos";
import VoidSaleButton from "../../components/VoidSaleButton";

type Sale = {
  id: string;
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

type SalePhoto = {
  id: string;
  sale_id: string;
  file_path: string;
};

export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*")
    .eq("user_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: photos } = await supabase
    .from("sale_photos")
    .select("id, sale_id, file_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
        <p className="text-red-600">Could not load sales records.</p>
      </div>
    );
  }

  const rows = (sales ?? []) as Sale[];
  const photoRows = (photos ?? []) as SalePhoto[];

  const photoMap = new Map<string, string[]>();
  for (const photo of photoRows) {
    const current = photoMap.get(photo.sale_id) ?? [];
    current.push(photo.file_path);
    photoMap.set(photo.sale_id, current);
  }

  const activeRows = rows.filter((sale) => sale.status === "active");

  const totalPaid = activeRows.reduce(
    (sum, sale) => sum + Number(sale.price_paid || 0),
    0
  );
  const totalGenerated = activeRows.reduce(
    (sum, sale) => sum + Number(sale.generated_price || 0),
    0
  );
  const totalGrams = activeRows.reduce(
    (sum, sale) => sum + Number(sale.grams || 0),
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Buyer Dashboard</h1>
      <p className="text-sm text-gray-600 mb-8">{user.email}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Actual Paid</p>
          <p className="text-2xl font-bold">{totalPaid.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Generated Value</p>
          <p className="text-2xl font-bold">{totalGenerated.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Total Grams</p>
          <p className="text-2xl font-bold">{totalGrams.toFixed(2)} g</p>
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <p className="text-sm text-gray-500">Commission Earned</p>
          <p className="text-2xl font-bold">{totalCommission.toFixed(2)} XCD</p>
        </div>

        <div className="border rounded-xl p-5 bg-white sm:col-span-2 xl:col-span-4">
          <p className="text-sm text-gray-500">Total Pay (Base + Commission)</p>
          <p className="text-2xl font-bold">{totalPayout.toFixed(2)} XCD</p>
        </div>
      </div>

      <div className="mb-8">
        <AddSaleForm />
      </div>

      <div className="border rounded-xl p-5 bg-white">
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>

        {rows.length === 0 ? (
          <p className="text-gray-600">No sales recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((sale) => {
              const difference =
                Number(sale.price_paid || 0) - Number(sale.generated_price || 0);
              const saleFilePaths = photoMap.get(sale.id) ?? [];
              const isVoided = sale.status === "voided";

              return (
                <details
                  key={sale.id}
                  className={`border rounded-lg bg-white ${
                    isVoided ? "opacity-70 bg-gray-50" : ""
                  }`}
                >
                  <summary className="list-none cursor-pointer p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {sale.customer_name?.trim() || "Unnamed customer"}
                        </p>
                        <p className="text-sm text-gray-500">{sale.sale_date}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Paid:</span>{" "}
                          <span className="font-semibold">
                            {Number(sale.price_paid).toFixed(2)}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-500">Pay:</span>{" "}
                          <span className="font-semibold">
                            {Number(sale.total_pay).toFixed(2)}
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

                        <div className="text-gray-400 text-xs sm:text-sm">
                          Tap to expand
                        </div>
                      </div>
                    </div>
                  </summary>

                  <div className="px-4 pb-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                      <div className="text-sm text-gray-500">Sale details</div>

                      {!isVoided && <VoidSaleButton saleId={sale.id} />}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 text-sm text-gray-700">
                      <p>
                        <span className="text-gray-500">Grams:</span>{" "}
                        {Number(sale.grams).toFixed(2)}
                      </p>
                      <p>
                        <span className="text-gray-500">Karats:</span>{" "}
                        {sale.karats}K
                      </p>
                      <p>
                        <span className="text-gray-500">Generated:</span>{" "}
                        {Number(sale.generated_price).toFixed(2)}
                      </p>
                      <p>
                        <span className="text-gray-500">Actual Paid:</span>{" "}
                        {Number(sale.price_paid).toFixed(2)}
                      </p>
                      <p>
                        <span className="text-gray-500">Commission:</span>{" "}
                        {Number(sale.commission_amount).toFixed(2)}
                      </p>
                      <p>
                        <span className="text-gray-500">Total Pay:</span>{" "}
                        {Number(sale.total_pay).toFixed(2)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm text-gray-600">
                      <p>
                        <span className="text-gray-500">Rate/gram:</span>{" "}
                        {Number(sale.price_per_gram).toFixed(2)} XCD
                      </p>
                      <p>
                        <span className="text-gray-500">Gold tier:</span>{" "}
                        {sale.pricing_tier_label || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Adjustment:</span>{" "}
                        {difference >= 0 ? "+" : ""}
                        {difference.toFixed(2)} XCD
                      </p>
                    </div>

                    {sale.notes && (
                      <p className="text-sm text-gray-600 mt-3">
                        <span className="text-gray-500">Notes:</span> {sale.notes}
                      </p>
                    )}

                    {isVoided && sale.void_reason && (
                      <p className="text-sm text-red-700 mt-3">
                        <span className="text-red-500">Void reason:</span>{" "}
                        {sale.void_reason}
                      </p>
                    )}

                    <SalePhotos filePaths={saleFilePaths} />
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