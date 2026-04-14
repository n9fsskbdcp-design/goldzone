"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateCommission, DISCUSS_BELOW_AMOUNT } from "@/lib/commission";

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
};

export default function AdminEditSaleButton({ sale }: { sale: Sale }) {
  const supabase = createClient();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [saleDate, setSaleDate] = useState(sale.sale_date);
  const [customerName, setCustomerName] = useState(sale.customer_name || "");
  const [grams, setGrams] = useState(String(sale.grams));
  const [karats, setKarats] = useState(String(sale.karats));
  const [pricePaid, setPricePaid] = useState(String(sale.price_paid));
  const [notes, setNotes] = useState(sale.notes || "");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const numericPricePaid = parseFloat(pricePaid) || 0;

  const recalculated = useMemo(() => {
    if (numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT) {
      const commissionAmount = 0;
      const baseFee = 0;
      const totalTargetPayout = 0;
      const impliedCommissionRate = 0;

      return {
        baseFee,
        commissionAmount,
        totalTargetPayout,
        impliedCommissionRate,
      };
    }

    return calculateCommission(numericPricePaid);
  }, [numericPricePaid]);

  async function handleSave() {
    setLoading(true);
    setError("");
    setMessage("");

    const gramsValue = Number(grams);
    const karatsValue = Number(karats);
    const pricePaidValue = Number(pricePaid);

    if (!saleDate) {
      setError("Date is required.");
      setLoading(false);
      return;
    }

    if (gramsValue <= 0) {
      setError("Grams must be greater than 0.");
      setLoading(false);
      return;
    }

    if (pricePaidValue <= 0) {
      setError("Price paid must be greater than 0.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("sales")
      .update({
        sale_date: saleDate,
        customer_name: customerName.trim() || null,
        grams: gramsValue,
        karats: karatsValue,
        price_paid: pricePaidValue,
        base_fee: recalculated.baseFee,
        commission_rate: recalculated.impliedCommissionRate,
        commission_amount: recalculated.commissionAmount,
        total_pay: recalculated.totalTargetPayout,
        notes: notes.trim() || null,
      })
      .eq("id", sale.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Sale updated.");
    router.refresh();
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
      >
        {open ? "Close Edit" : "Edit Sale"}
      </button>

      {open && (
        <div className="mt-4 border rounded-xl p-4 bg-gray-50 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Karats</label>
              <input
                type="number"
                value={karats}
                onChange={(e) => setKarats(e.target.value)}
                className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grams</label>
              <input
                type="number"
                step="0.01"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Price Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white min-h-[100px]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-4 text-sm">
            <div className="border rounded-lg p-3 bg-white">
              <p className="text-gray-500">Base Fee</p>
              <p className="font-semibold">
                {Number(recalculated.baseFee || 0).toFixed(2)}
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-white">
              <p className="text-gray-500">Commission</p>
              <p className="font-semibold">
                {Number(recalculated.commissionAmount || 0).toFixed(2)}
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-white">
              <p className="text-gray-500">Total Pay</p>
              <p className="font-semibold">
                {Number(recalculated.totalTargetPayout || 0).toFixed(2)}
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-white">
              <p className="text-gray-500">Commission Rate</p>
              <p className="font-semibold">
                {(Number(recalculated.impliedCommissionRate || 0) * 100).toFixed(
                  2
                )}
                %
              </p>
            </div>
          </div>

          {numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT && (
            <p className="text-sm text-amber-700">
              For prices at or below {DISCUSS_BELOW_AMOUNT}, this admin editor is
              currently using zero base fee and zero commission. Use the buyer
              workflow if you need your custom manual low-value handling.
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-black disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}