import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RevenueCalculatorClient from "@/components/RevenueCalculatorClient";

export default async function AdminRevenueCalculatorPage() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        Revenue Calculator
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Admin-only resale calculator using live spot-based pricing with no buy margin.
      </p>

      <RevenueCalculatorClient />
    </div>
  );
}