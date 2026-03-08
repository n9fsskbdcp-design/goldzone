"use client";
import { useEffect, useState } from "react";

export default function SellGold() {
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

  const [errors, setErrors] = useState<{
    name?: string;
    contact?: string;
    photos?: string;
    agreed?: string;
  }>({});

  const [pricePerGram, setPricePerGram] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [tierLabel, setTierLabel] = useState<string>("");

  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  /* ==============================
     FETCH PRICES
  ============================== */

  useEffect(() => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data.prices || {});
        setLoadingPrices(false);
      })
      .catch(() => setLoadingPrices(false));
  }, []);

  /* ==============================
     CALCULATION
  ============================== */

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
      multiplier = 1.15;
      label = "Premium volume rate applied";
    } else if (numericWeight >= 62) {
      multiplier = 1.10;
      label = "Improved volume rate applied";
    } else if (numericWeight >= 31) {
      multiplier = 1.05;
      label = "Enhanced rate applied";
    }

    const adjustedPrice = basePrice * multiplier;

    setPricePerGram(adjustedPrice);
    setTotal(adjustedPrice * numericWeight);
    setTierLabel(label);

  }, [weight, karat, prices, unknownWeight, unknownKarat, loadingPrices]);

  /* ==============================
     PHOTO HANDLING
  ============================== */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);
    const valid: File[] = [];

    for (let file of selected) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setPhotoError(`Each file must be under ${MAX_FILE_SIZE_MB}MB.`);
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

  /* ==============================
     SUBMIT
  ============================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};

    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!contact.trim()) newErrors.contact = "Phone or email is required.";
    if (photos.length === 0) newErrors.photos = "At least one photo is required.";
    if (!agreed) newErrors.agreed = "You must agree before submitting.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {

      const formData = new FormData();

      formData.append("name", name);
      formData.append("contact", contact);
      formData.append("weight", weight);
      formData.append("karat", karat);
      formData.append("notes", notes);
      formData.append("estimate", total.toString());

      /* Honeypot field */
      formData.append("company", "");

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await fetch("/api/submit-sell", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitted(true);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong submitting your request.");
    }
  };

  /* ==============================
     UI
  ============================== */

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-semibold mb-6">
        Sell Your Gold
      </h1>

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
            className="block text-center bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Continue on WhatsApp (optional)
          </a>

        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Honeypot bot trap */}
          <input
            type="text"
            name="company"
            autoComplete="off"
            className="hidden"
          />

          {/* Weight */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <label className="text-sm font-medium">Weight (grams)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => {
                const value = e.target.value;
                const num = parseFloat(value);
                if (num > 250) setWeight("250");
                else setWeight(value);
              }}
              disabled={unknownWeight}
              className="border px-4 py-3 w-full rounded-lg disabled:bg-gray-100"
              min="0"
              max="250"
            />

            {parseFloat(weight) >= 250 && (
              <p className="text-xs text-gray-500">
                Maximum calculator limit reached. Larger quantities may qualify for custom pricing.
              </p>
            )}

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

          {/* Karat */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <label className="text-sm font-medium">Karat</label>
            <select
              value={karat}
              onChange={(e) => setKarat(e.target.value)}
              disabled={unknownKarat}
              className="border px-4 py-3 w-full rounded-lg disabled:bg-gray-100"
            >
              {Object.keys(prices).map((k) => (
                <option key={k} value={k}>{k}K</option>
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

          {/* Calculation */}
          <div className="bg-gray-100 p-6 rounded-xl space-y-2">
            <p className="text-sm text-gray-600">Estimated Rate</p>
            <p className="text-lg font-semibold">
              {pricePerGram > 0 ? `${pricePerGram.toFixed(2)} XCD / gram` : "—"}
            </p>
            <p className="text-2xl font-bold">
              {total > 0 ? `${total.toFixed(2)} XCD` : "To be evaluated"}
            </p>
            {tierLabel && (
              <p className="text-xs text-gray-500">{tierLabel}</p>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <label className="text-sm font-medium">
              Photos <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              id="photo-upload"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />

            <label
              htmlFor="photo-upload"
              className="block text-center cursor-pointer bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Add Photos
            </label>

            {errors.photos && (
              <p className="text-sm text-red-600">{errors.photos}</p>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
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

          {/* Contact */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-5">

            <div>
              <label className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-4 py-3 w-full rounded-lg"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Phone or Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="border px-4 py-3 w-full rounded-lg"
              />
              {errors.contact && (
                <p className="text-sm text-red-600 mt-1">{errors.contact}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Additional Information <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border px-4 py-3 w-full rounded-lg"
                rows={4}
              />
            </div>

          </div>

          {/* Agreement */}
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

            {errors.agreed && (
              <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-semibold text-lg bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Request Evaluation
          </button>

        </form>
      )}
    </div>
  );
}