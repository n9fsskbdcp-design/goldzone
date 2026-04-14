"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SellRequestStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "converted"
  | "closed";

type Props = {
  requestId: string;
  currentStatus: SellRequestStatus;
};

export default function SellRequestStatusActions({
  requestId,
  currentStatus,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: SellRequestStatus) {
    setLoading(status);

    const { error } = await supabase
      .from("sell_requests")
      .update({ status })
      .eq("id", requestId);

    setLoading(null);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  const statuses: SellRequestStatus[] = [
    "reviewing",
    "contacted",
    "converted",
    "closed",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => updateStatus(status)}
          disabled={loading !== null || currentStatus === status}
          className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          {loading === status ? "Updating..." : status}
        </button>
      ))}
    </div>
  );
}