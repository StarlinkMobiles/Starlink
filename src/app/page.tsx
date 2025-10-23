"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { Copy, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AffiliateDashboard() {
  const [name, setName] = useState("");
  const [mpesa, setMpesa] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [refLink, setRefLink] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("affiliate_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUser(parsed);
          setRefLink(`${window.location.origin}/?ref=${parsed.id}`);
          refreshUserFromDb(parsed.id);
        } else {
          localStorage.removeItem("affiliate_user");
        }
      } catch {
        localStorage.removeItem("affiliate_user");
      }
    } else {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) setRefLink(`${window.location.origin}/?ref=${ref}`);
    }
  }, []);

  const normalizePhone = (raw: string) => {
    const input = raw || "";
    const digits = input.replace(/[^0-9]/g, "");
    if (/^07\d{8}$/.test(digits)) return "254" + digits.slice(1);
    if (/^2547\d{8}$/.test(digits)) return digits;
    if (/^\+2547\d{8}$/.test(input)) return input.replace(/^\+/, "");
    return digits;
  };

  const refreshUserFromDb = async (id: string) => {
    try {
      const { data, error } = await supabase.from("affiliates").select("*").eq("id", id).single();
      if (error) {
        console.error("refreshUserFromDb select error:", error);
        return;
      }
      if (!data) return;

      try {
        const { count } = await supabase.from("affiliates").select("*", { count: "exact", head: true }).eq("referrer_id", data.id);
        data.referrals = count || 0;
      } catch (err) {
        console.error("Error computing referrals:", err);
        data.referrals = data.referrals ?? 0;
      }

      setUser(data);
      localStorage.setItem("affiliate_user", JSON.stringify(data));
      setRefLink(`${window.location.origin}/?ref=${data.id}`);
    } catch (err) {
      console.error("refreshUserFromDb error:", err);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !mpesa.trim()) return alert("⚠️ Please fill in both your full name and M-Pesa phone number.");
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.split(" ").length < 2) return alert("⚠️ Enter your full name (First and Last).");

    const normalized = normalizePhone(mpesa.trim());
    if (!/^2547\d{8}$/.test(normalized)) return alert("⚠️ Enter a valid Kenya M-Pesa number (07XXXXXXXX or 2547XXXXXXXX).");

    setLoading(true);
    try {
      const findResp = await supabase.from("affiliates").select("*").eq("mpesa", normalized).maybeSingle();
      if (findResp.error) {
        alert("Error checking phone number. Try again.");
        setLoading(false);
        return;
      }
      if (findResp.data) {
        await refreshUserFromDb(findResp.data.id);
        alert("Welcome back! 🎉");
        setLoading(false);
        return;
      }

      const ref = new URLSearchParams(window.location.search).get("ref");
      const payload = { name: cleanName, mpesa: normalized, verified: false, earnings: 0, referrals: 0, status: "--", referrer_id: ref };

      const insertResp = await supabase.from("affiliates").insert([payload]).select().single();
      if (insertResp.error) {
        console.error("insertResp.error", insertResp.error);
        alert("Registration failed. Try again.");
        setLoading(false);
        return;
      }

      const newUser = insertResp.data;
      newUser.referrals = 0;
      localStorage.setItem("affiliate_user", JSON.stringify(newUser));
      setUser(newUser);
      setRefLink(`${window.location.origin}/?ref=${newUser.id}`);
      alert("🎉 Registered! Step 1: Download Perplexity before uploading proof.");
    } catch (err) {
      console.error("handleRegister unexpected error:", err);
      alert("Unexpected error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proof) return alert("Select a screenshot first.");
    if (!user) return alert("You must register first.");

    setLoading(true);
    try {
      const fileName = `${Date.now()}-${proof.name.replace(/\s+/g, "_")}`;
      const path = `${user.id}/${fileName}`;

      const uploadResp = await supabase.storage.from("proofs").upload(path, proof);
      if (uploadResp.error) throw uploadResp.error;

      const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(path);
      const publicUrl = urlData?.publicUrl || "";

      await supabase.from("proofs").insert([{ affiliate_id: user.id, file_name: proof.name, file_url: publicUrl, verified: false }]);
      await supabase.from("affiliates").update({ status: "Under Review" }).eq("id", user.id);
      await refreshUserFromDb(user.id);

      alert("✅ Proof uploaded — admin will review shortly.");
    } catch (err) {
      console.error("handleProofUpload error:", err);
      alert("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

 useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel("affiliate_admin")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "affiliates",
        filter: `id=eq.${user.id}`,
      },
      async (payload) => {
        if (payload.new) {
          try {
            const refreshed = payload.new;

            // compute referrals count
            const { count } = await supabase
              .from("affiliates")
              .select("*", { count: "exact", head: true })
              .eq("referrer_id", refreshed.id);

            refreshed.referrals = count || refreshed.referrals || 0;
            setUser(refreshed);
            localStorage.setItem("affiliate_user", JSON.stringify(refreshed));
            setRefLink(`${window.location.origin}/?ref=${refreshed.id}`);
          } catch (err) {
            console.error("Error handling realtime payload:", err);
            setUser(payload.new);
            localStorage.setItem("affiliate_user", JSON.stringify(payload.new));
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);


  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => refreshUserFromDb(user.id), 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("affiliate_user");
    setUser(null);
    setName("");
    setMpesa("");
    setRefLink("");
  };

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-green-400">
        <Loader2 className="animate-spin w-12 h-12 text-green-700" />
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/95 backdrop-blur-lg p-6 sm:p-12 border-4 border-green-400">
        {/* Header Card */}
        <div className="bg-green-100 rounded-3xl p-6 mb-8 shadow-md text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-green-700 mb-4 drop-shadow-lg">🚀 Vilafly Affiliate Portal</h1>
          <p className="text-lg sm:text-xl font-semibold text-green-800">
            Earn 150Kes instantly! Use a valid <span className="font-bold text-green-900">M-Pesa number</span>. 💸
          --,verify,paid</p>
        </div>

        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 sm:gap-6">
              <Input placeholder="Full Name (First Last)" value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border-green-300 shadow-inner p-4 text-lg font-semibold w-full" />
              <Input placeholder="M-Pesa Number (07XXXXXXXX or 2547XXXXXXXX)" value={mpesa} onChange={(e) => setMpesa(e.target.value)} className="rounded-2xl border-green-300 shadow-inner p-4 text-lg font-semibold w-full" />
              <Button onClick={handleRegister} className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-2xl py-5 font-extrabold rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                🎉 Join & Earn 150 KES Now!
              </Button>
              <Button variant="outline" onClick={() => setShowRules(true)} className="w-full text-2xl py-4 font-bold rounded-2xl hover:bg-green-100 border-green-400">
                📜 View Rules & Instructions
              </Button>
              <p className="text-center text-green-900 text-lg mt-2">
                Start your journey today — download Perplexity, take a screenshot, upload, and share!
              </p>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 sm:space-y-8">
  
{/* 🧮 Smart Stats Section */}
<section className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
  {(() => {
    const isNew = !user?.verified && (user?.earnings ?? 0) === 0;
    const isVerified = user?.verified;
    const hasReferrals = (user?.referrals ?? 0) > 0;
    const isPaid = user?.status === "Paid";
    const isRejected = user?.status === "Rejected";
    const isPendingPayment = isVerified && !isPaid && !isRejected;

    const stats = [
      {
        title: "Earnings",
        value: `KES ${user?.earnings ?? 0}`,
        color: isPaid ? "green" : isPendingPayment ? "yellow" : "gray",
        note: isPaid
          ? "Payout sent 🎉"
          : isPendingPayment
          ? "Verified — waiting for payment ⏳"
          : "No earnings yet — invite friends to earn 💸",
      },
      {
        title: "Referrals",
        value: user?.referrals ?? 0,
        color: hasReferrals ? "lime" : "gray",
        note: hasReferrals
          ? "Great job! Keep inviting friends 🚀"
          : "Share your link to earn 100 KES per friend",
      },
      {
        title: "Status",
        value: user?.status ?? "Pending",
        color: isPaid ? "green" : isRejected ? "red" : "yellow",
        note: isPaid
          ? "You’ve been paid ✅"
          : isRejected
          ? "Proof not approved ❌"
          : isPendingPayment
          ? "Verified — awaiting payment ⏳"
          : "Awaiting admin review ⏳",
      },
      {
        title: "Joined",
        value: user?.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "—",
        color: isNew ? "blue" : "teal",
        note: isNew
          ? "Welcome aboard! 🎉"
          : "Glad to have you with us 💜",
      },
    ];

    return stats.map((stat, idx) => (
      <div
        key={idx}
        className={`bg-${stat.color}-100 p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow`}
      >
        <p className={`text-xs text-${stat.color}-700 font-medium`}>
          {stat.title}
        </p>
        <h2 className={`text-2xl font-bold text-${stat.color}-800`}>
          {stat.value}
        </h2>
        <p className={`text-xs text-${stat.color}-600`}>{stat.note}</p>
      </div>
    ));
  })()}
</section>



              {/* Step 1 */}
              <section className="p-6 bg-green-100 border-2 border-green-400 rounded-2xl text-center shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-green-700 mb-3">Step 1: Download & Install Perplexity AI</h3>
                <a href="http://bit.ly/4qhh0lD" target="_blank" rel="noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-2xl py-5 font-bold rounded-2xl shadow-md">📲 Download the App</Button>
                </a>
                <p className="text-lg text-green-800 mt-3">Ask at least <span className="font-bold">one question</span> in the app before taking a screenshot. ✅</p>
              </section>

              <section className="bg-white/90 rounded-2xl p-6 shadow-lg text-center border-2 border-green-300">
  <h3 className="text-2xl font-bold text-green-700 mb-3">Step 3: Upload Proof Screenshot</h3>
  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setProof(e.target.files?.[0] || null)}
      className="border p-3 rounded-2xl text-lg"
    />
    <Button
      onClick={async () => {
        if (!proof) return alert("Select a screenshot first.");
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append("file", proof);

          const res = await fetch("/api/sendProof", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.ok) {
            alert("✅ Proof sent to Telegram!");
          } else {
            console.error(data);
            alert("❌ Failed to send proof.");
          }
        } catch (err) {
          console.error(err);
          alert("❌ Error sending proof.");
        } finally {
          setLoading(false);
        }
      }}
      className="bg-green-600 hover:bg-green-700 text-white text-2xl py-4 font-bold flex items-center gap-3 rounded-2xl shadow-md"
    >
      <Upload className="w-5 h-5" /> Submit Proof
    </Button>
  </div>
  <p className="text-lg text-green-900 mt-3">
    Your Proof will be verified as soon as possible. Make sure it's clear! ⚠️ Do not upload personal info.
  </p>
</section>

              {/* Step 2 */}
              <section className="p-6 bg-green-50 border-2 border-green-400 rounded-2xl text-center shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-green-700 mb-3">Step 2: Share Your Referral Link</h3>
                <div className="flex flex-col sm:flex-row items-center border rounded-2xl overflow-hidden bg-gray-50">
                  <input type="text" value={refLink} readOnly className="flex-1 p-4 bg-transparent text-lg font-semibold text-gray-700" />
                  <Button onClick={copyLink} className="bg-green-600 hover:bg-green-700 text-xl py-4 font-bold rounded-none flex items-center gap-2 w-full sm:w-auto">
                    <Copy className="w-5 h-5" /> {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-lg text-green-900 mt-2">Share and earn 100 KES per referral! 💸</p>
              </section>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-green-300">
                <div className="text-lg text-green-900 text-center sm:text-left">
                  Signed in as: <strong>{user?.name}</strong> • {user?.mpesa}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <a href="https://wa.me/254718140053" target="_blank" rel="noreferrer">
                    <Button className="bg-green-500 hover:bg-green-600 text-white text-xl py-3 font-bold rounded-2xl w-full sm:w-auto">Help</Button>
                  </a>
                  <Button variant="outline" onClick={handleLogout} className="hover:bg-green-100 text-xl py-3 font-bold rounded-2xl w-full sm:w-auto">Log out</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6 rounded-3xl bg-white shadow-xl">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-4">Affiliate Rules & Instructions</h2>
              <ul className="list-disc list-inside text-green-900 text-lg space-y-2 text-left">
                <li>Use your real name and a valid <span className="font-bold text-green-800">M-Pesa phone number</span>. One account per number.</li>
                <li>Download Perplexity and ask at least one question before taking a screenshot.</li>
                <li>Upload your proof screenshot after using the app.</li>
                <li>Share your referral link to earn 100 KES per referral!</li>
                <li>Admin verifies screenshots. Payments (KES 150 joining bonus + referral rewards) via M-Pesa within 3-24 hours of approval.</li>
              </ul>
              <Button onClick={() => setShowRules(false)} className="mt-6 bg-green-600 hover:bg-green-700 text-white w-full py-5 font-bold rounded-2xl text-2xl">Got it!</Button>
            </Card>
          </div>
        )}
      </Card>
    </main>
  );
}
