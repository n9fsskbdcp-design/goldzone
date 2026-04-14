"use client";

import { useMemo, useState } from "react";
import {
  MAX_TRANSACTION,
  DISCUSS_BELOW_AMOUNT,
  calculateCommission,
} from "@/lib/commission";

export default function CommissionCalculatorPage() {
  const [amount, setAmount] = useState("");

  const numericAmount = parseFloat(amount) || 0;

  const result = useMemo(() => {
    if (numericAmount > 0 && numericAmount <= DISCUSS_BELOW_AMOUNT) {
      return {
        baseFee: 0,
        label: `Manual / Discuss (≤ ${DISCUSS_BELOW_AMOUNT})`,
        commissionAmount: 0,
        totalTargetPayout: 0,
        payoutPercentOfSale: 0,
        impliedCommissionRate: 0,
      };
    }

    return calculateCommission(numericAmount);
  }, [numericAmount]);

  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    if (!cleaned) {
      setAmount("");
      return;
    }

    const parsed = parseFloat(cleaned);

    if (parsed > MAX_TRANSACTION) {
      setAmount(String(MAX_TRANSACTION));
      return;
    }

    setAmount(cleaned);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-gray-900 bg-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        Commission Calculator
      </h1>

      <p className="text-gray-700 text-sm sm:text-base mb-6">
        Calculate total buyer payout based on transaction size.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-sm space-y-6 border border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction Amount
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter amount up to ${MAX_TRANSACTION}`}
            className="w-full rounded-lg px-4 py-3 text-base bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <p className="text-sm text-gray-600 mt-2">
            Maximum transaction amount is {MAX_TRANSACTION}.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 p-6 rounded-xl mt-6 space-y-3">
        <p className="text-sm text-gray-700">Base Fee</p>
        <p className="text-lg font-semibold">{result.baseFee.toFixed(2)}</p>

        <p className="text-sm text-gray-700">Payout Band</p>
        <p className="text-lg font-semibold">{result.label ?? "—"}</p>

        <p className="text-sm text-gray-700">Commission Amount</p>
        <p className="text-lg font-semibold">
          {result.commissionAmount.toFixed(2)}
        </p>

        <p className="text-sm text-gray-700">Total Pay</p>
        <p className="text-3xl font-bold">
          {result.totalTargetPayout.toFixed(2)}
        </p>

        <p className="text-sm text-gray-700">Total Pay as % of Sale</p>
        <p className="text-lg font-semibold">
          {result.payoutPercentOfSale.toFixed(2)}%
        </p>

        <p className="text-sm text-gray-700">Implied Commission Rate</p>
        <p className="text-lg font-semibold">
          {(result.impliedCommissionRate * 100).toFixed(2)}%
        </p>

        {numericAmount > 0 && numericAmount <= DISCUSS_BELOW_AMOUNT && (
          <p className="text-sm text-amber-700">
            Transactions at {DISCUSS_BELOW_AMOUNT} and below use manual commission only. Base fee does not apply.
          </p>
        )}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-3">Payout Structure</h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="border-b border-gray-100 pb-3">
            <p className="font-medium">0 - 750</p>
            <p className="text-gray-600">
              Manual commission only. No base fee applies.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <p className="font-medium">750.01 - 1500</p>
            <p className="text-gray-600">
              Total payout targets 10% of the sale, including base fee.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <p className="font-medium">1501 - 3000</p>
            <p className="text-gray-600">
              Total payout gradually steps down from 10% to 8%, including base fee.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <p className="font-medium">3001 - 5000</p>
            <p className="text-gray-600">
              Total payout gradually steps down from 8% to 5%, including base fee.
            </p>
          </div>

          <div>
            <p className="font-medium">5001 - 10000</p>
            <p className="text-gray-600">
              Total payout targets 5% of the sale, including base fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}