"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BASE_FEE,
  MAX_TRANSACTION,
  DISCUSS_BELOW_AMOUNT,
  calculateCommission,
} from "@/lib/commission";
import { calculateGoldPayout } from "@/lib/goldPricing";

export default function AddSaleForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  const [saleDate, setSaleDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [customerName, setCustomerName] = useState("");
  const [grams, setGrams] = useState("");
  const [karats, setKarats] = useState("24");
  const [pricePaid, setPricePaid] = useState("");
  const [commissionInput, setCommissionInput] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [manualPriceOverride, setManualPriceOverride] = useState(false);
  const [commissionTouched, setCommissionTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data.prices || {});
        setPricesLoading(false);
      })
      .catch(() => {
        setPrices({});
        setPricesLoading(false);
      });
  }, []);

  const numericGrams = parseFloat(grams) || 0;
  const numericPricePaid = parseFloat(pricePaid) || 0;
  const numericCommissionInput = parseFloat(commissionInput) || 0;

  const goldPricing = useMemo(() => {
    return calculateGoldPayout(numericGrams, karats, prices);
  }, [numericGrams, karats, prices]);

  useEffect(() => {
    if (!manualPriceOverride) {
      setPricePaid(
        goldPricing.generatedPrice > 0
          ? goldPricing.generatedPrice.toFixed(2)
          : ""
      );
    }
  }, [goldPricing.generatedPrice, manualPriceOverride]);

  const generatedCommission = useMemo(() => {
    if (numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT) {
      return {
        baseFee: 0,
        label: `Manual / Low-value (≤ ${DISCUSS_BELOW_AMOUNT})`,
        commissionAmount: 0,
        totalTargetPayout: 0,
        payoutPercentOfSale: 0,
        impliedCommissionRate: 0,
      };
    }

    return calculateCommission(numericPricePaid);
  }, [numericPricePaid]);

  useEffect(() => {
    if (!commissionTouched) {
      setCommissionInput(
        generatedCommission.commissionAmount > 0
          ? generatedCommission.commissionAmount.toFixed(2)
          : ""
      );
    }
  }, [generatedCommission.commissionAmount, commissionTouched]);

  const finalBaseFee = useMemo(() => {
    return numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT
      ? 0
      : generatedCommission.baseFee;
  }, [numericPricePaid, generatedCommission.baseFee]);

  const finalCommission = useMemo(() => {
    const commissionAmount = numericCommissionInput;
    const totalTargetPayout = finalBaseFee + commissionAmount;
    const payoutPercentOfSale =
      numericPricePaid > 0 ? (totalTargetPayout / numericPricePaid) * 100 : 0;
    const impliedCommissionRate =
      numericPricePaid > 0 ? commissionAmount / numericPricePaid : 0;

    return {
      baseFee: finalBaseFee,
      label:
        numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT
          ? `Manual / Low-value (≤ ${DISCUSS_BELOW_AMOUNT})`
          : generatedCommission.label,
      commissionAmount,
      totalTargetPayout,
      payoutPercentOfSale,
      impliedCommissionRate,
    };
  }, [
    numericCommissionInput,
    finalBaseFee,
    numericPricePaid,
    generatedCommission.label,
  ]);

  const commissionWasOverridden = useMemo(() => {
    return (
      Math.abs(numericCommissionInput - generatedCommission.commissionAmount) >
      0.009
    );
  }, [numericCommissionInput, generatedCommission.commissionAmount]);

  const handleGramsChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    if (!cleaned) {
      setGrams("");
      return;
    }

    const numeric = parseFloat(cleaned);

    if (numeric > 500) {
      setGrams("500");
      return;
    }

    setGrams(cleaned);
  };

  const handlePricePaidChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    setManualPriceOverride(true);
    setPricePaid(cleaned);
    setCommissionTouched(false);
  };

  const handleCommissionChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    setCommissionTouched(true);
    setCommissionInput(cleaned);
  };

  const useSuggestedPrice = () => {
    setManualPriceOverride(false);
    setPricePaid(
      goldPricing.generatedPrice > 0
        ? goldPricing.generatedPrice.toFixed(2)
        : ""
    );
    setCommissionTouched(false);
  };

  const resetCommissionToGenerated = () => {
    setCommissionTouched(false);
    setCommissionInput(
      generatedCommission.commissionAmount > 0
        ? generatedCommission.commissionAmount.toFixed(2)
        : ""
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(event.target.files || []);
    setFiles(chosenFiles.slice(0, 5));
  };

  async function uploadSalePhotos(userId: string, saleId: string) {
    if (!files.length) {
      throw new Error("At least one photo is required.");
    }

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${crypto.randomUUID()}.${extension}`;
      const filePath = `${userId}/${saleId}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("sale-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: photoRowError } = await supabase.from("sale_photos").insert({
        sale_id: saleId,
        user_id: userId,
        file_path: filePath,
      });

      if (photoRowError) {
        throw new Error(photoRowError.message);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors([]);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrors(["You must be logged in."]);
      setLoading(false);
      return;
    }

    const gramsValue = Number(grams);
    const karatsValue = Number(karats);
    const pricePaidValue = Number(pricePaid);
    const commissionValue = Number(commissionInput || 0);

    const validationErrors: string[] = [];

    if (!saleDate) validationErrors.push("Date is required.");
    if (!grams) validationErrors.push("Weight in grams is required.");
    if (!karats) validationErrors.push("Karats is required.");
    if (!pricePaid) validationErrors.push("Actual price paid is required.");
    if (commissionInput === "") validationErrors.push("Commission is required.");
    if (files.length === 0) validationErrors.push("At least one item photo is required.");

    if (gramsValue <= 0) validationErrors.push("Weight must be greater than 0.");
    if (gramsValue > 500) validationErrors.push("Weight cannot exceed 500 grams.");
    if (pricePaidValue <= 0) validationErrors.push("Actual price paid must be greater than 0.");
    if (commissionValue < 0) validationErrors.push("Commission cannot be negative.");

    if (pricePaidValue > MAX_TRANSACTION) {
      validationErrors.push(`Transaction amount cannot exceed ${MAX_TRANSACTION}.`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const { data: insertedSale, error } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        sale_date: saleDate,
        customer_name: customerName.trim() || null,
        grams: gramsValue,
        karats: karatsValue,

        generated_price: goldPricing.generatedPrice,
        price_per_gram: goldPricing.pricePerGram,
        pricing_tier_label: goldPricing.tierLabel || null,

        // Locked sale-day revenue comparison value for Money page
        revenue_price_per_gram: goldPricing.pricePerGram,

        price_paid: pricePaidValue,

        base_fee: finalCommission.baseFee,
        commission_rate: finalCommission.impliedCommissionRate,
        commission_amount: finalCommission.commissionAmount,
        total_pay: finalCommission.totalTargetPayout,

        generated_base_fee: generatedCommission.baseFee,
        generated_commission_amount: generatedCommission.commissionAmount,
        generated_total_pay: generatedCommission.totalTargetPayout,
        commission_override_amount: commissionWasOverridden
          ? finalCommission.commissionAmount
          : null,
        commission_was_overridden: commissionWasOverridden,

        notes: notes.trim() || null,
        status: "active",
      })
      .select("id")
      .single();

    if (error || !insertedSale) {
      setErrors([error?.message || "Could not save sale."]);
      setLoading(false);
      return;
    }

    try {
      await uploadSalePhotos(user.id, insertedSale.id);
    } catch (photoError) {
      setErrors([
        photoError instanceof Error
          ? `Sale saved, but photo upload failed: ${photoError.message}`
          : "Sale saved, but photo upload failed.",
      ]);
      setLoading(false);
      router.refresh();
      return;
    }

    setCustomerName("");
    setGrams("");
    setKarats("24");
    setPricePaid("");
    setCommissionInput("");
    setNotes("");
    setFiles([]);
    setManualPriceOverride(false);
    setCommissionTouched(false);
    setErrors([]);
    setMessage("Sale and photos saved.");
    setLoading(false);
    router.refresh();
  }

  const priceDifference = numericPricePaid - goldPricing.generatedPrice;

  return (
    <div className="border rounded-xl p-4 sm:p-5 bg-white">
      <h2 className="text-xl font-semibold mb-4">Add Sale Record</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              required
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
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Weight (grams) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={grams}
              onChange={(e) => handleGramsChange(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              placeholder="e.g. 18.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Karats <span className="text-red-500">*</span>
            </label>
            <select
              value={karats}
              onChange={(e) => setKarats(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              required
            >
              {Object.keys(prices).length > 0 ? (
                Object.keys(prices).map((k) => (
                  <option key={k} value={k}>
                    {k}K
                  </option>
                ))
              ) : (
                <>
                  <option value="10">10K</option>
                  <option value="14">14K</option>
                  <option value="18">18K</option>
                  <option value="22">22K</option>
                  <option value="24">24K</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Actual Price Paid (XCD) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={pricePaid}
              onChange={(e) => handlePricePaidChange(e.target.value)}
              className="w-full rounded-lg px-4 py-3 border border-gray-300"
              placeholder="Can be adjusted manually"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="block text-sm font-medium">
              Commission (XCD) <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={resetCommissionToGenerated}
              className="text-sm underline text-gray-700"
            >
              Reset to generated
            </button>
          </div>

          <input
            type="text"
            inputMode="decimal"
            value={commissionInput}
            onChange={(e) => handleCommissionChange(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300"
            placeholder="Generated first, then editable"
            required
          />

          <p className="text-sm text-gray-600 mt-2">
            Generated commission: {generatedCommission.commissionAmount.toFixed(2)} XCD
            {commissionWasOverridden ? " — overridden manually" : ""}
          </p>

          {numericPricePaid > 0 && numericPricePaid <= DISCUSS_BELOW_AMOUNT && (
            <p className="text-sm text-amber-700 mt-2">
              Sales at or below {DISCUSS_BELOW_AMOUNT} use no base fee. You can enter the agreed commission manually.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Item Photos <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium bg-white hover:bg-gray-100 transition"
          >
            + Add Photos
          </button>

          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="text-xs sm:text-sm text-gray-600 border rounded-lg p-2 truncate"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            At least 1 photo is required. Maximum 5 photos.
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">Gold Price Preview</p>

            <button
              type="button"
              onClick={useSuggestedPrice}
              className="text-sm underline text-gray-700 text-left sm:text-right"
            >
              Use suggested payout
            </button>
          </div>

          {pricesLoading ? (
            <p className="text-sm text-gray-500">Loading rates...</p>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-gray-500">Generated Price</p>
                <p className="font-semibold">
                  {goldPricing.generatedPrice.toFixed(2)} XCD
                </p>
              </div>

              <div>
                <p className="text-gray-500">Rate Per Gram</p>
                <p className="font-semibold">
                  {goldPricing.pricePerGram > 0
                    ? `${goldPricing.pricePerGram.toFixed(2)} XCD`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Rate Tier</p>
                <p className="font-semibold">{goldPricing.tierLabel || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500">Manual Adjustment</p>
                <p className="font-semibold">
                  {pricePaid
                    ? `${priceDifference >= 0 ? "+" : ""}${priceDifference.toFixed(2)} XCD`
                    : "0.00 XCD"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-sm text-gray-600">Commission Preview</p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 text-sm">
            <div>
              <p className="text-gray-500">Generated Base Fee</p>
              <p className="font-semibold">{generatedCommission.baseFee.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-gray-500">Generated Commission</p>
              <p className="font-semibold">
                {generatedCommission.commissionAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Final Base Fee</p>
              <p className="font-semibold">{finalCommission.baseFee.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-gray-500">Final Commission</p>
              <p className="font-semibold">
                {finalCommission.commissionAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Final Total Pay</p>
              <p className="font-semibold">
                {finalCommission.totalTargetPayout.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Pay % of Sale</p>
              <p className="font-semibold">
                {finalCommission.payoutPercentOfSale.toFixed(2)}%
              </p>
            </div>
          </div>

          {commissionWasOverridden && (
            <p className="text-sm text-amber-700">
              Commission was manually overridden. Generated and final values will both be saved for traceability.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300 min-h-[100px]"
            placeholder="Optional notes"
          />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((err, index) => (
                <li key={index}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-black transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Sale"}
        </button>
      </form>
    </div>
  );
}