"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddRevenueForm() {
  const supabase = createClient();
  const router = useRouter();

  const [revenueDate, setRevenueDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const amountValue = Number(amount);

    if (!revenueDate) {
      setError("Date is required.");
      setLoading(false);
      return;
    }

    if (!source.trim()) {
      setError("Source is required.");
      setLoading(false);
      return;
    }

    if (!amount || amountValue < 0) {
      setError("Valid amount is required.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("revenues").insert({
      revenue_date: revenueDate,
      amount: amountValue,
      source: source.trim(),
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setAmount("");
    setSource("");
    setNotes("");
    setMessage("Revenue added.");
    router.refresh();
  }

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h2 className="text-lg font-semibold mb-4">Add Revenue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={revenueDate}
            onChange={(e) => setRevenueDate(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (XCD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300"
            placeholder="e.g. 2500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Source</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300"
            placeholder="e.g. Gold resale"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300 min-h-[90px]"
            placeholder="Optional"
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-black transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Revenue"}
        </button>
      </form>
    </div>
  );
}