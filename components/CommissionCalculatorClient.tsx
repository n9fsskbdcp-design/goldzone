"use client";

import { useMemo, useState } from "react";
import {
  BASE_FEE,
  MAX_TRANSACTION,
  DISCUSS_BELOW_AMOUNT,
  calculateCommission,
} from "@/lib/commission";

export default function CommissionCalculatorClient() {
  const [amount, setAmount] = useState("");

  const numericAmount = parseFloat(amount) || 0;

  const result = useMemo(() => {
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
        Base fee is {BASE_FEE.toFixed(2)}. Total payout includes base fee plus commission.
      </p>

      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm space-y-6 border border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction Amount <span className="text-red-500">*</span>
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
            Maximum transaction amount is {MAX_TRANSACTION.toFixed(0)}.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 p-5 sm:p-6 rounded-xl mt-6 space-y-3">
        <p className="text-sm text-gray-700">Base Fee</p>
        <p className="text-lg font-semibold">{result.baseFee.toFixed(2)}</p>

        <p className="text-sm text-gray-700">Band</p>
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
            Transactions at {DISCUSS_BELOW_AMOUNT} and below should be discussed before purchase.
          </p>
        )}
      </div>
    </div>
  );
}