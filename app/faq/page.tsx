"use client";
import { useState } from "react";
import Link from "next/link";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How is my gold evaluated?",
      answer: (
        <>
          All items are weighed using calibrated scales and professionally
          tested to verify purity. Final payout is based on confirmed weight
          and karat after inspection. Learn more in our{" "}
          <Link href="/gold-guide" className="underline hover:text-gray-800">
            Gold Guide
          </Link>.
        </>
      ),
    },
    {
      question: "Is gold really sold by grams?",
      answer: (
        <>
          Yes. Gold is valued internationally by weight and purity. The most
          common unit used worldwide is the gram. Professional buyers weigh the
          gold and calculate value based on its gold content and the current
          market price.
          <br />
          <br />
          Jewellery stores may sell items at fixed prices, which can create the
          impression that gold is not sold by weight. However, the underlying
          value of gold is always determined by its weight and purity.
        </>
      ),
    },
    {
      question: "Is the calculator price final?",
      answer: (
        <>
          The{" "}
          <Link href="/calculator" className="underline hover:text-gray-800">
            calculator
          </Link>{" "}
          provides an estimate based on our current buying rates. Final offers
          are confirmed after physical inspection and purity verification.
        </>
      ),
    },
    {
      question: "Why do buying rates change?",
      answer:
        "Our buying rates adjust frequently in response to live international gold market conditions (spot price). Market fluctuations directly affect payout rates.",
    },
    {
      question: "What does karat (K) mean?",
      answer: (
        <>
          Karat (K) measures gold purity — not weight. 24K is nearly pure gold,
          while lower karats contain a higher percentage of strengthening
          metals. You can view hallmark numbers and purity breakdowns in our{" "}
          <Link href="/gold-guide" className="underline hover:text-gray-800">
            Gold Purity Guide
          </Link>.
        </>
      ),
    },
    {
      question: "Do larger quantities receive better pricing?",
      answer: (
        <>
          Yes. Higher quantities may qualify for improved buying rates. Our{" "}
          <Link href="/calculator" className="underline hover:text-gray-800">
            calculator
          </Link>{" "}
          automatically reflects volume-based adjustments.
        </>
      ),
    },
    {
      question: "Is there a fee for testing?",
      answer:
        "Gold testing may carry a service fee. This fee is fully refunded if you proceed with the sale.",
    },
    {
      question: "Do I need identification?",
      answer:
        "Identification may be required depending on transaction value and applicable regulations.",
    },
    {
      question: "What if I decline the offer?",
      answer:
        "There is no obligation. You are free to decline the offer after evaluation.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Clear answers about gold purity, pricing, and our evaluation process.
          For deeper educational information, visit our{" "}
          <Link href="/gold-guide" className="underline hover:text-gray-800">
            Gold Guide
          </Link>.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-5 py-4 flex justify-between items-center font-medium text-gray-900"
              >
                {faq.question}
                <span className="text-gray-500 text-xl">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center space-y-4">
        <p className="text-sm text-gray-600">
          Ready to check your gold value?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calculator"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Use Calculator
          </Link>

          <Link
            href="/sell"
            className="border border-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Sell Gold
          </Link>
        </div>
      </div>

    </div>
  );
}