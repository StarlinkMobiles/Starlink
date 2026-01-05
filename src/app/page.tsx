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

const bundles: Bundle[] = [
  { id: "d1", category: "daily", title: "24 Hours - 5GB", subtitle: "Short-term heavy usage", price: 70 },
  { id: "d2", category: "daily", title: "24 Hours - 10GB", subtitle: "Double data for intensive users", price: 120, badge: "HOT" },
  { id: "w1", category: "weekly", title: "3 Days - 8GB", subtitle: "Weekend browsing", price: 155, badge: "VALUE" },
  { id: "w2", category: "weekly", title: "7 Days - 12GB", subtitle: "Full week connectivity", price: 180 },
  { id: "w3", category: "weekly", title: "7 Days - 20GB", subtitle: "Streaming & downloads", price: 250 },
  { id: "w4", category: "weekly", title: "14 Days - 15GB", subtitle: "Balanced two-week plan", price: 210 },
  { id: "m1", category: "monthly", title: "21 Days - 18GB", subtitle: "Three-week package", price: 225 },
  { id: "m2", category: "monthly", title: "30 Days - 25GB", subtitle: "Best seller", price: 299, badge: "POPULAR" },
  { id: "m3", category: "monthly", title: "30 Days - 50GB", subtitle: "Double monthly data", price: 450 },
  { id: "m4", category: "monthly", title: "30 Days - 100GB", subtitle: "Heavy usage", price: 699, badge: "HOT" },
  { id: "u1", category: "unlimited", title: "3 Days - Unlimited", subtitle: "Short-term access", price: 130 },
  { id: "u2", category: "unlimited", title: "7 Days - Unlimited", subtitle: "One full week", price: 220, badge: "POPULAR" },
  { id: "u3", category: "unlimited", title: "30 Days - Unlimited", subtitle: "Unlimited browsing", price: 400 },
];

export default function StarlinkBundles() {
  const [selected, setSelected] = useState<Category>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [phone, setPhone] = useState("");

  const filtered = selected === "all" ? bundles : bundles.filter((b) => b.category === selected);

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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      amount: activeBundle.price,
      local_id: `ORDER_${activeBundle.id}_${Date.now()}`,
      transaction_desc: `Payment for ${activeBundle.title}`,
    }),
  });

      const data = await res.json();
      console.log(data);

      if (data.status) {
        setMessage(`STK Push sent! Check your phone to complete payment for ${activeBundle.title}.`);
      } else {
        setMessage("Payment failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error sending payment. Try again later.");
    } finally {
      setLoadingId(null);
      setShowModal(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfa]">
      {/* Header */}
      <header className="bg-green-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-semibold text-white">Starlink Data Bundles</h1>
          <p className="text-green-200 text-sm mt-1">Reliable high-speed internet for Kenya</p>
        </div>
      </header>

      {/* Filter */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {["all", "daily", "weekly", "monthly", "unlimited"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat as Category)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                selected === cat
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white text-green-700 border border-green-300 hover:border-green-600"
              }`}
            >
              {cat === "all" ? "All Bundles" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((bundle) => (
            <div
              key={bundle.id}
              className="relative bg-white rounded-lg p-4 border-2 border-green-500
                         shadow-[0_6px_16px_rgba(0,0,0,0.05)]
                         hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]
                         hover:border-green-700
                         transition"
            >
              {bundle.badge && (
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                  {bundle.badge}
                </span>
              )}
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">{bundle.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{bundle.subtitle}</p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-lg font-bold text-green-700">Ksh {bundle.price}</div>
                  <div className="text-[10px] text-gray-400">Kenyan Shillings</div>
                </div>

                <button
                  onClick={() => {
                    setActiveBundle(bundle);
                    setShowModal(true);
                  }}
                  disabled={loadingId === bundle.id}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-800 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingId === bundle.id ? "Processing..." : "BUY"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && activeBundle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-green-50 max-w-sm w-full p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-green-700 font-bold text-lg"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Starlink Payment</h2>
<p className="text-green-700 text-xs mb-3 italic">
        Enter M-Pesa number below you will be prompted to enter your PIN on your phone.
      </p>            <p className="text-green-700 text-sm mb-4">{activeBundle.title} - Ksh {activeBundle.price}</p>
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
              {loadingId === activeBundle.id ? "Processing..." : `Pay Ksh ${activeBundle.price}`}
            </button>
          </div>
        </div>
      )}

      {/* Floating message */}
      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-700/90 text-white px-6 py-3 rounded-2xl shadow-lg text-sm z-50">
          {message}
        </div>
      )}

      <footer className="text-center text-gray-400 text-[11px] py-5">&copy; {new Date().getFullYear()} Starlink Bundles</footer>
    </div>
  );
}
