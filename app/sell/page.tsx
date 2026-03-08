import { Suspense } from "react";
import SellGold from "./SellGold";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <SellGold />
    </Suspense>
  );
}