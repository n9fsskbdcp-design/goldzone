"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type FieldErrors = {
  name?: string;
  contact?: string;
  photos?: string;
  agreed?: string;
};

export default function SellGold() {
  const searchParams = useSearchParams();

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  const [weight, setWeight] = useState<string>("");
  const [karat, setKarat] = useState<string>("24");
  const [unknownWeight, setUnknownWeight] = useState(false);
  const [unknownKarat, setUnknownKarat] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});

  const [pricePerGram, setPricePerGram] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [tierLabel, setTierLabel] = useState<string>("");

  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const MAX_FILE_SIZE_MB = 6;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const MAX_FILES = 6;

  useEffect(() => {
    const weightParam = searchParams.get("weight");
    const karatParam = searchParams.get("karat");

    if (weightParam && weight === "") setWeight(weightParam);
    if (karatParam && karat === "24") setKarat(karatParam);
  }, [searchParams, weight, karat]);

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load prices");
        const data = await res.json();
        if (!cancelled) {
          setPrices(data.prices || {});
          setLoadingPrices(false);
        }
      } catch {
        if (!cancelled) setLoadingPrices(false);
      }
    }

    loadPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadingPrices) return;

    if (unknownWeight || unknownKarat) {
      setPricePerGram(0);
      setTotal(0);
      setTierLabel("");
      return;
    }

    const numericWeight = Math.min(parseFloat(weight) || 0, 250);

    if (!numericWeight || numericWeight <= 0) {
      setPricePerGram(0);
      setTotal(0);
      setTierLabel("");
      return;
    }

    const basePrice = prices[karat];
    if (!basePrice) {
      setPricePerGram(0);
      setTotal(0);
      setTierLabel("");
      return;
    }

    let multiplier = 1;
    let label = "Standard rate applied";

    if (numericWeight >= 100) {
      multiplier = 1.1;
      label = "Premium volume rate applied";
    } else if (numericWeight >= 62) {
      multiplier = 1.05;
      label = "Improved volume rate applied";
    } else if (numericWeight >= 31) {
      multiplier = 1.025;
      label = "Enhanced rate applied";
    }

    const adjustedPrice = basePrice * multiplier;
    setPricePerGram(adjustedPrice);
    setTotal(adjustedPrice * numericWeight);
    setTierLabel(label);
  }, [weight, karat, prices, unknownWeight, unknownKarat, loadingPrices]);

  const previews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);

    if (photos.length + selected.length > MAX_FILES) {
      setPhotoError(`You can upload up to ${MAX_FILES} photos.`);
      e.target.value = "";
      return;
    }

    const valid: File[] = [];

    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setPhotoError(`Each file must be under ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = "";
        return;
      }
      valid.push(file);
    }

    setPhotos((prev) => [...prev, ...valid]);
    setPhotoError("");
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors: FieldErrors = {};

    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!contact.trim()) newErrors.contact = "Phone or email is required.";
    if (photos.length === 0) newErrors.photos = "At least one photo is required.";
    if (!agreed) newErrors.agreed = "You must agree before submitting.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("contact", contact.trim());
      formData.append("weight", weight);
      formData.append("karat", karat);
      formData.append("notes", notes.trim());
      formData.append("estimate", total.toString());
      formData.append("company", "");
      formData.append("pricePerGram", pricePerGram.toString());
      formData.append("tierLabel", tierLabel);
      formData.append("unknownWeight", String(unknownWeight));
      formData.append("unknownKarat", String(unknownKarat));

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await fetch("/api/submit-sell", {
        method: "POST",
        body: formData,
      });

      const raw = await response.text();
      let result: { error?: string; success?: boolean } = {};

      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        result = { error: raw || "Submission failed." };
      }

      if (!response.ok) {
        throw new Error(result.error || `Submission failed (${response.status})`);
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong submitting your request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-3xl font-semibold mb-6">Sell Your Gold</h1>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <p className="font-semibold">Submission received.</p>
            <p>Your evaluation request has been sent successfully.</p>
            <p className="text-sm mt-2">
              For faster response you may continue on WhatsApp and send additional photos.
            </p>
          </div>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Continue on WhatsApp
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="text" name="company" autoComplete="off" className="hidden" />

          {submitError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-sm text-red-800 whitespace-pre-wrap">
              {submitError}
            </div>
          )}

          <div className="bg-white p-5 rounded-xl shadow border border-gray-200 space-y-3">
            <label className="text-sm font-medium">Weight (grams)</label>

            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                const value = e.target.value;
                const num = parseFloat(value);
                if (num > 250) setWeight("250");
                else setWeight(value);
              }}
              disabled={unknownWeight}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg"
            />

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={unknownWeight}
                onChange={(e) => setUnknownWeight(e.target.checked)}
                className="mr-2"
              />
              I’m not sure of the weight
            </label>
          </div>

          <div className="bg-white p-5 rounded-xl shadow border border-gray-200 space-y-3">
            <label className="text-sm font-medium">Karat</label>

            <select
              value={karat}
              onChange={(e) => setKarat(e.target.value)}
              disabled={unknownKarat}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg"
            >
              {Object.keys(prices).map((k) => (
                <option key={k} value={k}>
                  {k}K
                </option>
              ))}
            </select>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={unknownKarat}
                onChange={(e) => setUnknownKarat(e.target.checked)}
                className="mr-2"
              />
              I’m not sure of the karat
            </label>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-2">
            <p className="text-sm font-medium">Estimated Payout</p>
            <p className="text-3xl font-bold">
              {total > 0 ? `${total.toFixed(2)} XCD` : "To be evaluated"}
            </p>
            <p className="text-sm">
              {pricePerGram > 0 ? `${pricePerGram.toFixed(2)} XCD / gram` : ""}
            </p>
            {tierLabel && <p className="text-xs text-gray-700">{tierLabel}</p>}
          </div>

          <div className="bg-white p-5 rounded-xl shadow border border-gray-200 space-y-3">
            <label className="text-sm font-medium">
              Photos <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />

            <label
              htmlFor="photo-upload"
              className="block text-center cursor-pointer bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Add Photos
            </label>

            {photoError && <p className="text-sm text-red-600">{photoError}</p>}
            {errors.photos && <p className="text-sm text-red-600">{errors.photos}</p>}

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {previews.map((preview, index) => (
                  <div key={`${preview.file.name}-${index}`} className="relative">
                    <img
                      src={preview.url}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow border border-gray-200 space-y-5">
            <div>
              <label className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg"
              />

              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">
                Phone or Email <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg"
              />

              {errors.contact && <p className="text-sm text-red-600 mt-1">{errors.contact}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Additional Information</label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg"
                rows={4}
              />
            </div>
          </div>

          <div>
            <label className="flex items-start text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2 mt-1"
              />
              I understand the estimated payout is subject to inspection.
            </label>

            {errors.agreed && <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-semibold text-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Request Evaluation"}
          </button>
        </form>
      )}
    </div>
  );
}