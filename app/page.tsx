"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {

  const [prices,setPrices] = useState<Record<string,number>>({})
  const [updatedAt,setUpdatedAt] = useState("")
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const loadPrices = () => {
      fetch("/api/prices")
        .then(res=>res.json())
        .then(data=>{
          setPrices(data.prices)
          setUpdatedAt(data.updatedAt)
          setLoading(false)
        })
        .catch(console.error)
    }

    loadPrices()

    const interval = setInterval(loadPrices,600000)

    return ()=>clearInterval(interval)

  },[])

  return (
  <>
  <div className="max-w-xl mx-auto px-4 py-8 pb-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl">

  {/* HERO */}

  <section className="mb-6">

  <h1 className="text-2xl sm:text-3xl font-bold mb-3">
  Sell Your Gold with Confidence
  </h1>

  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
  Live gold pricing aligned with international market conditions.
  Professional gold buying service in St Lucia.
  </p>

  </section>


  {/* TRUST STRIP */}

  <section className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-8">

  <div className="flex items-center gap-2">
  ✓ Live market pricing
  </div>

  <div className="flex items-center gap-2">
  ✓ Professional testing
  </div>

  <div className="flex items-center gap-2">
  ✓ No obligation to sell
  </div>

  <div className="flex items-center gap-2">
  ✓ Serving St Lucia
  </div>

  </section>


  {/* GOLD PRICE */}

  <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 shadow-sm">

  <h2 className="text-lg font-semibold mb-2">
  Gold Price Today
  </h2>

  <p className="text-sm text-gray-700 dark:text-gray-300">
  Based on international gold spot prices
  </p>

  {loading ? (
  <div className="h-7 w-40 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
  ) : (
  <p className="text-xl font-semibold mt-2">
  {Number(prices["24"]).toFixed(2)} XCD / gram (24K)
  </p>
  )}

  {updatedAt && (
  <p className="text-xs text-gray-500 mt-2">
  Updated: {new Date(updatedAt).toLocaleString()}
  </p>
  )}

  </section>


  {/* BUYING PRICES */}

  <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3 mb-8 border border-gray-200 dark:border-gray-700">

  <h2 className="text-lg font-semibold">
  Current Buying Prices
  </h2>

  {Object.entries(prices).map(([karat,price])=>(
  <div key={karat} className="flex justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-2">

  <span className="font-medium">{karat}K Gold</span>

  <span className="font-semibold">
  {Number(price).toFixed(2)} XCD / gram
  </span>

  </div>
  ))}

  </section>


  {/* HOW IT WORKS */}

  <section className="mb-8">

  <h2 className="text-lg font-semibold mb-4">
  How It Works
  </h2>

  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">

  <p>
  <strong>1.</strong> Estimate your payout using our{" "}
  <Link href="/calculator" className="underline">
  gold calculator
  </Link>.
  </p>

  <p>
  <strong>2.</strong> Submit your gold for evaluation.
  </p>

  <p>
  <strong>3.</strong> Receive payment once weight and purity are verified.
  </p>

  </div>

  </section>


  {/* CTA */}

  <Link
  href="/sell"
  className="block text-center bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-black transition"
  >
  Sell Gold Now
  </Link>

  </div>


  {/* STICKY MOBILE CTA */}

  <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 lg:hidden">

  <Link
  href="/sell"
  className="block text-center bg-gray-900 text-white py-3 rounded-lg font-semibold"
  >
  Sell Your Gold
  </Link>

  </div>

  </>
  )
}