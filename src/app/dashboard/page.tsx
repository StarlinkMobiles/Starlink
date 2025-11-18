"use client";

import React, { useEffect, useState } from "react";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  payment_method?: string;
  payment_details?: string;
  reason?: string;
  status: "pending" | "approved" | "paid";
  amount: number;
  paid: boolean;
  proofUrl?: string;
  created_at: string;
};

const STORAGE_KEY = "cg_users_v2";
const CURRENT_USER_KEY = "currentUserId";

export default function UserDashboard() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState<number>(0);

  const [popup, setPopup] = useState<string | null>(null); // For approval & paid popups
  const [showApprove, setShowApprove] = useState(false); // Show approve button after saving payment info

  // Load users & current user
  useEffect(() => {
    const rawUsers = localStorage.getItem(STORAGE_KEY);
    const allUsers: UserRecord[] = rawUsers ? JSON.parse(rawUsers) : [];
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);

    if (!currentUserId || allUsers.length === 0) {
      setMessage("...WELCOME!🎄....");
      return;
    }

    const user = allUsers.find((u) => u.id === currentUserId);
    if (!user) {
      setMessage("......");
      return;
    }

    setUsers(allUsers);
    setCurrentUser(user);
    setPaymentMethod(user.payment_method || "");
    setPaymentDetails(user.payment_details || "");

    // Show approval popup if approved
    if (user.status === "approved") {
      setPopup("Award approved! Wait for your reward in less than 30 minutes.");
      setTimeout(() => setPopup(null), 4000);
    }

    // Show paid popup if already paid
    if (user.status === "paid") {
      setPopup("Payment received! Thank you for using our platform.");
      setTimeout(() => setPopup(null), 4000);
    }
  }, []);

  // Persist users
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Smooth counter animation
  useEffect(() => {
    if (!currentUser) {
      setDisplayAmount(0);
      return;
    }

    const target = currentUser.amount || 0;
    let start = displayAmount;
    if (start > target) start = 0;

    const duration = 800;
    const steps = 40;
    const stepTime = Math.max(10, Math.floor(duration / steps));
    const increment = (target - start) / steps;
    let current = start;
    let step = 0;

    const intervalId = window.setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayAmount(target);
        window.clearInterval(intervalId);
      } else {
        setDisplayAmount(Math.floor(current));
      }
    }, stepTime);

    return () => window.clearInterval(intervalId);
  }, [currentUser?.amount]);

  // Save payment info
  const handleSavePayment = () => {
    if (!paymentMethod) {
      setMessage("Please select a payment method to receive your rewards.");
      return;
    }
    if (!currentUser) return;

    const updatedUser: UserRecord = {
      ...currentUser,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    setMessage("Payment info saved! You can now approve your account.");
    setShowApprove(true); // show approve button
    setPopup("Payment info saved!"); // green popup
    setTimeout(() => {
      setMessage(null);
      setPopup(null);
    }, 3500);
  };

  // Request payout
  const handleRequestPayout = () => {
    if (!currentUser) return;
    if (currentUser.status !== "approved") {
      setMessage("Your account must be approved before requesting payout.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (!paymentMethod) {
      setMessage("Please save a payment method before requesting payout.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setMessage("Processing payout...");

    setTimeout(() => {
      const updatedUser: UserRecord = {
        ...currentUser,
        paid: true,
        status: "paid",
      };
      setCurrentUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      setPopup("Payment received! Thank you for using our platform.");
      setTimeout(() => setPopup(null), 4000);
      setMessage(null);
    }, 2500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 p-4">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl text-center w-full max-w-md mx-auto mt-20">
          <p className="text-red-400">{message || "No active user."}</p>
        </div>
      </div>
    );
  }

  const statusBg =
    currentUser.status === "pending"
      ? "bg-yellow-300 text-yellow-900"
      : currentUser.status === "approved"
      ? "bg-green-300 text-green-900"
      : "bg-blue-300 text-blue-900";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 p-4 text-gray-200 antialiased relative">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-white/4 to-white/2 border border-white/5 rounded-3xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white truncate">
            {currentUser.name}&apos;s Dashboard
          </h1>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBg} drop-shadow-sm`}
            >
              {currentUser.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-300">
              Applied: {new Date(currentUser.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">To be awarded</div>
          <div className="bg-gradient-to-r from-white/6 to-white/4 px-3 py-1 rounded-xl text-xl md:text-2xl text-emerald-300 font-extrabold shadow-inner">
            ${displayAmount.toLocaleString()}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
        {[
          {
            label: "To be awarded",
            value: `$${displayAmount.toLocaleString()}`,
            color: "text-emerald-300",
          },
          {
            label: "Pending for approval",
            value: !currentUser.paid
              ? `$${currentUser.amount.toLocaleString()}`
              : "$0",
            color: "text-yellow-300",
          },
          {
            label: "Paid",
            value: currentUser.paid ? `$${currentUser.amount.toLocaleString()}` : "$0",
            color: "text-sky-300",
          },
          { label: "Application ID", value: currentUser.id },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-gradient-to-b from-white/6 to-white/3 p-2 rounded-xl shadow-md hover:scale-[1.02] transition-transform flex flex-col items-center justify-center text-center"
          >
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase font-medium">
              {card.label}
            </div>
            <div
              className={`text-sm sm:text-base font-semibold mt-1 ${
                card.color || "text-gray-200"
              } truncate`}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left: Payment + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <section className="bg-gradient-to-b from-white/4 to-white/3 rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Payment Info</h2>
            <p className="text-gray-300 mb-4 text-sm">
              Add your preferred payment method and account/wallet details below
              so we can transfer your reward when your application is approved.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 p-2 rounded-md text-gray-200"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="paypal">PayPal (email)</option>
                  <option value="cashApp">CashApp (ID)</option>
                  <option value="crypto">Crypto (wallet address)</option>
                  <option value="bank">Bank transfer (IBAN/Account)</option>
                </select>
                <div className="text-xs text-gray-400 mt-1">
                  Saved payment method will be used for payout.
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Payment Details
                </label>
                <input
                  type="text"
                  placeholder="Enter account or wallet info here"
                  className="w-full bg-gray-800 border border-gray-700 p-2 rounded-md text-gray-200"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
                <div className="text-xs text-gray-400 mt-1">
                  Example: paypal@example.com • 0xABC... • IBAN GBxx...
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleSavePayment}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Payment Info
              </button>

              {/* Approve Account button appears after saving payment info */}
              {showApprove && paymentMethod && paymentDetails && currentUser.status === "pending" && (
                <a
                  href="https://whop.com/checkout/plan_O0ni7TR7JwG3E"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  Approve Account
                </a>
              )}

              {/* Withdraw button always visible, disabled until PAID */}
              <a
                href={currentUser.status === "paid" ? "https://paystack.shop/pay/lawn9sdri0" : undefined}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold shadow-md text-white ${
                  currentUser.status === "paid"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-900/50 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (currentUser.status !== "paid") e.preventDefault();
                }}
              >
                Withdraw to your Account
              </a>
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-gradient-to-b from-white/4 to-white/3 rounded-3xl shadow-xl p-6 shadow-green-200/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Status Timeline</h2>
            <ul className="space-y-3">
              <li className="flex justify-between bg-gray-800/60 p-3 rounded-xl shadow-sm">
                <span>Applied</span>
                <span className="text-sm text-gray-300">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
              </li>
              <li className="flex justify-between bg-gray-800/60 p-3 rounded-xl shadow-sm">
                <span>Status</span>
                <span className="text-sm font-medium">{currentUser.status.toUpperCase()}</span>
              </li>
              {currentUser.paid && (
                <li className="flex justify-between bg-gray-800/60 p-3 rounded-xl shadow-sm">
                  <span>Payment Received</span>
                  <span className="text-sm text-gray-300">{new Date().toLocaleDateString()}</span>
                </li>
              )}
            </ul>
          </section>
        </div>

        {/* Right: Profile & Actions */}
        <aside className="space-y-6">
          <div className="bg-gradient-to-b from-white/5 to-white/3 rounded-3xl shadow-xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 mx-auto flex items-center justify-center text-3xl font-bold text-gray-300">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="mt-3 font-semibold text-white">{currentUser.name}</h3>
            <p className="text-sm text-gray-300">{currentUser.email}</p>
            <div className="mt-4">
              <button
                onClick={() => {
                  localStorage.removeItem(CURRENT_USER_KEY);
                  window.location.href = "/";
                }}
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-white/5 to-white/3 rounded-3xl shadow-xl p-6 shadow-green-200/20">
            <h4 className="font-semibold mb-2 text-white">Quick Actions</h4>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="text-left p-2 rounded-xl hover:bg-gray-800/60"
              >
                Print summary
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(currentUser));
                  setMessage("Copied profile to clipboard");
                  setTimeout(() => setMessage(null), 2000);
                }}
                className="text-left p-2 rounded-xl hover:bg-gray-800/60"
              >
                Copy profile (JSON)
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating messages */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white px-6 py-3 rounded-2xl shadow-lg text-sm z-50">
          {message}
        </div>
      )}

      {/* Approval & Paid Popup */}
      {popup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-green-700/90 rounded-3xl p-6 text-center max-w-xs mx-auto shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">{popup}</h3>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} CG Rewards. All rights reserved.
      </footer>
    </div>
  );
}
