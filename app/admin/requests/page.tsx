import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellRequestStatusActions from "../../../components/SellRequestStatusActions";
import SellRequestPhotos from "../../../components/SellRequestPhotos";
import DeleteSellRequestButton from "../../../components/DeleteSellRequestButton";

type SellRequest = {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  weight: number | null;
  karat: number | null;
  unknown_weight: boolean;
  unknown_karat: boolean;
  notes: string | null;
  estimate: number;
  price_per_gram: number;
  tier_label: string | null;
  status: "new" | "reviewing" | "contacted" | "converted" | "closed";
  source: string;
};

type SellRequestPhoto = {
  id: string;
  sell_request_id: string;
  file_path: string;
  created_at: string;
};

export default async function AdminRequestsPage() {
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

  const { data: requests, error: requestsError } = await supabase
    .from("sell_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: photos } = await supabase
    .from("sell_request_photos")
    .select("*")
    .order("created_at", { ascending: true });

  if (requestsError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sell Requests</h1>
        <p className="text-red-600">Could not load sell requests.</p>
      </div>
    );
  }

  const rows = (requests ?? []) as SellRequest[];
  const photoRows = (photos ?? []) as SellRequestPhoto[];

  const photoMap = new Map<string, string[]>();
  for (const photo of photoRows) {
    const current = photoMap.get(photo.sell_request_id) ?? [];
    current.push(photo.file_path);
    photoMap.set(photo.sell_request_id, current);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sell Requests</h1>
      <p className="text-sm text-gray-600 mb-8">
        Private request tracker for incoming website submissions.
      </p>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="border rounded-xl p-5 bg-white">
            <p className="text-gray-600">No sell requests yet.</p>
          </div>
        ) : (
          rows.map((request) => {
            const requestPhotos = photoMap.get(request.id) ?? [];

            return (
              <div key={request.id} className="border rounded-xl p-5 bg-white">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{request.name}</h2>
                    <p className="text-sm text-gray-600">{request.contact}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {request.status}
                    </span>

                      <SellRequestStatusActions
    requestId={request.id}
    currentStatus={request.status}
  />

  <DeleteSellRequestButton requestId={request.id} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-sm text-gray-700">
                  <p>
                    <span className="text-gray-500">Weight:</span>{" "}
                    {request.unknown_weight
                      ? "Unknown"
                      : request.weight !== null
                        ? `${Number(request.weight).toFixed(2)} g`
                        : "—"}
                  </p>

                  <p>
                    <span className="text-gray-500">Karat:</span>{" "}
                    {request.unknown_karat
                      ? "Unknown"
                      : request.karat !== null
                        ? `${request.karat}K`
                        : "—"}
                  </p>

                  <p>
                    <span className="text-gray-500">Estimate:</span>{" "}
                    {Number(request.estimate || 0).toFixed(2)} XCD
                  </p>

                  <p>
                    <span className="text-gray-500">Rate:</span>{" "}
                    {Number(request.price_per_gram || 0).toFixed(2)} XCD
                  </p>

                  <p>
                    <span className="text-gray-500">Tier:</span>{" "}
                    {request.tier_label || "—"}
                  </p>

                  <p>
                    <span className="text-gray-500">Source:</span>{" "}
                    {request.source}
                  </p>
                </div>

                {request.notes && (
                  <p className="text-sm text-gray-600 mt-4">
                    <span className="text-gray-500">Notes:</span> {request.notes}
                  </p>
                )}

                <SellRequestPhotos filePaths={requestPhotos} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}