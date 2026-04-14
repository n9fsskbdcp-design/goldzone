"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  requestId: string;
};

type SellRequestPhotoRow = {
  file_path: string;
};

export default function DeleteSellRequestButton({ requestId }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this sell request and all related photos?"
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const { data: photoRows, error: photoFetchError } = await supabase
        .from("sell_request_photos")
        .select("file_path")
        .eq("sell_request_id", requestId);

      if (photoFetchError) {
        throw new Error(photoFetchError.message);
      }

      const filePaths = ((photoRows ?? []) as SellRequestPhotoRow[])
        .map((row) => row.file_path)
        .filter((path): path is string => Boolean(path));

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("sell-request-photos")
          .remove(filePaths);

        if (storageError) {
          throw new Error(storageError.message);
        }
      }

      const { error: photoDeleteError } = await supabase
        .from("sell_request_photos")
        .delete()
        .eq("sell_request_id", requestId);

      if (photoDeleteError) {
        throw new Error(photoDeleteError.message);
      }

      const { error: requestDeleteError } = await supabase
        .from("sell_requests")
        .delete()
        .eq("id", requestId);

      if (requestDeleteError) {
        throw new Error(requestDeleteError.message);
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}