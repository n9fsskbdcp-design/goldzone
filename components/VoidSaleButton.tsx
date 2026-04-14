"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type VoidSaleButtonProps = {
  saleId: string;
  disabled?: boolean;
};

export default function VoidSaleButton({
  saleId,
  disabled = false,
}: VoidSaleButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleVoid = async () => {
    const reason = window.prompt("Reason for voiding this sale?");
    if (!reason || !reason.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("sales")
      .update({
        status: "voided",
        void_reason: reason.trim(),
      })
      .eq("id", saleId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleVoid}
      disabled={disabled || loading}
      className="text-sm underline text-red-600 disabled:opacity-50"
    >
      {loading ? "Voiding..." : "Void Sale"}
    </button>
  );
}