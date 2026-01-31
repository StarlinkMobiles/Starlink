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

  const [popup, setPopup] = useState<string | null>(null);
  const [showApprove, setShowApprove] = useState(false);

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

    if (user.status === "approved") {
      setPopup("Award approved! Wait for your reward in less than 30 minutes.");
      setTimeout(() => setPopup(null), 4000);
    }

    if (user.status === "paid") {
      setPopup("Payment received! Thank you for using our platform.");
      setTimeout(() => setPopup(null), 4000);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

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
    setShowApprove(true);
    setPopup("Payment info saved!");
    setTimeout(() => {
      setMessage(null);
      setPopup(null);
    }, 3500);
  };

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

      {/* ... EVERYTHING ABOVE UNCHANGED ... */}

      {/* OFFERS FLOATING CARD */}
      <div className="fixed bottom-20 right-4 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl px-4 py-3 text-xs text-white z-40 max-w-[220px]">
        <div className="font-semibold text-center mb-2 text-[11px] tracking-wide">
          Data Offers
        </div>

        <ul className="space-y-[2px] text-[10px]">
          <li>299 KSH — 7 Days Unlimited</li>
          <li>499 KSH — 14 Days Unlimited</li>
          <li>699 KSH — 50GB Full Month</li>
          <li>899 KSH — Full Month Unlimited</li>
        </ul>

        <div className="mt-2 text-center text-[9px] text-gray-400">
          Customer Care: 0755997593
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} CG Rewards. All rights reserved.
      </footer>
    </div>
  );
}
