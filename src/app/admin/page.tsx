"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, RefreshCcw, Lock, Undo2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [totalPayout, setTotalPayout] = useState(0);

  // ✅ Admin authorization
  useEffect(() => {
    const saved = localStorage.getItem("adminAuthorized");
    if (saved === "true") {
      setIsAuthorized(true);
      fetchData();
    } else {
      const key = prompt("Enter Admin Key:");
      const correctKey = process.env.NEXT_PUBLIC_ADMIN_KEY?.trim();
      if (key?.trim() === correctKey) {
        localStorage.setItem("adminAuthorized", "true");
        setIsAuthorized(true);
        fetchData();
      } else {
        setAuthError(true);
      }
    }
  }, []);

  // 🔁 Fetch all affiliates
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      data.map(async (a) => {
        const { count } = await supabase
          .from("affiliates")
          .select("*", { count: "exact", head: true })
          .eq("referrer_id", a.id);
        return { ...a, referrals: count || 0 };
      })
    );

    const total = enriched.reduce((sum, a) => sum + Number(a.earnings || 0), 0);
    setAffiliates(enriched);
    setTotalPayout(total);
    setLoading(false);
  };

  // 🔄 Realtime
  useEffect(() => {
    const sub = supabase
      .channel("affiliate_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliates" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  // ✅ Verify user
  const handleVerifyUser = async (user: any) => {
    try {
      const { error: updateErr } = await supabase
        .from("affiliates")
        .update({ verified: true, status: "Verified" })
        .eq("id", user.id);
      if (updateErr) throw updateErr;

      if (user.referrer_id) {
        const { data: ref } = await supabase
          .from("affiliates")
          .select("earnings, referrals, status")
          .eq("id", user.referrer_id)
          .maybeSingle();

        if (ref) {
          const newEarnings = Number(ref.earnings || 0) + 100;
          const newReferrals = Number(ref.referrals || 0) + 1;
          await supabase
            .from("affiliates")
            .update({
              earnings: newEarnings,
              referrals: newReferrals,
              status: ref.status === "Paid" ? ref.status : "Verified",
            })
            .eq("id", user.referrer_id);
        }
      }

      alert(`${user.name} verified successfully.`);
      fetchData();
    } catch (e: any) {
      alert("Error verifying user: " + e.message);
    }
  };

  // ↩️ Undo verification
  const handleUndoVerification = async (user: any) => {
    if (!confirm(`Undo verification for ${user.name}?`)) return;
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ verified: false, status: "Pending" })
        .eq("id", user.id);
      if (error) throw error;
      alert(`Verification undone for ${user.name}.`);
      fetchData();
    } catch (e: any) {
      alert("Error undoing verification: " + e.message);
    }
  };

  // 💸 Update status
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (status === "Paid") {
        const { data: u } = await supabase
          .from("affiliates")
          .select("earnings")
          .eq("id", id)
          .maybeSingle();

        const newEarnings = Number(u?.earnings || 0) + 150;
        const { error: payErr } = await supabase
          .from("affiliates")
          .update({ status: "Paid", earnings: newEarnings })
          .eq("id", id);
        if (payErr) throw payErr;
      } else {
        const { error } = await supabase
          .from("affiliates")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
      fetchData();
    } catch (e: any) {
      alert("Error updating status: " + e.message);
    }
  };

  // 🔍 Filtered view
  const filteredAffiliates = affiliates.filter((a) => {
    const match =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.mpesa?.includes(search);
    const statusMatch = filter === "all" || a.status === filter;
    return match && statusMatch;
  });

  if (authError)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
        <Card className="p-8 rounded-3xl shadow-xl border border-purple-300 text-center">
          <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">You are not authorized to view this page.</p>
          <Button
            onClick={() => window.location.replace("/")}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Go Home
          </Button>
        </Card>
      </main>
    );

  if (!isAuthorized || loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
        <Loader2 className="animate-spin w-8 h-8 text-purple-700" />
      </main>
    );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 p-6"
    >
      <Card className="max-w-6xl mx-auto p-6 rounded-3xl shadow-2xl border border-purple-200 bg-white/95">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-extrabold text-purple-700 flex items-center gap-2">
            🧠 Perplexity Affiliate Admin
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={fetchData}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("adminAuthorized");
                window.location.reload();
              }}
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-100 p-4 rounded-xl text-center">
            <p className="text-purple-700 font-semibold text-lg">Total Users</p>
            <p className="text-2xl font-bold">{affiliates.length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl text-center">
            <p className="text-green-700 font-semibold text-lg">Verified</p>
            <p className="text-2xl font-bold">
              {affiliates.filter((a) => a.verified).length}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl text-center">
            <p className="text-blue-700 font-semibold text-lg">Total Referrals</p>
            <p className="text-2xl font-bold">
              {affiliates.reduce((t, a) => t + (a.referrals || 0), 0)}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-xl text-center">
            <p className="text-yellow-700 font-semibold text-lg">Total Payout (Ksh)</p>
            <p className="text-2xl font-bold">{totalPayout}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <Input
            placeholder="Search by name or M-Pesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-purple-100 text-purple-700 font-semibold">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">M-Pesa</th>
                <th className="p-3 text-left">Referrals</th>
                <th className="p-3 text-left">Earnings</th>
                <th className="p-3 text-left">Verified</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((a) => (
                <React.Fragment key={a.id}>
                  <tr className="border-b hover:bg-purple-50 transition text-gray-700">
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">{a.mpesa}</td>
                    <td className="p-3">{a.referrals}</td>
                    <td className="p-3 font-semibold text-green-700">
                      {a.earnings || 0}
                    </td>
                    <td className="p-3">
                      {a.verified ? (
                        <div className="flex gap-2">
                          <span className="text-green-600 font-semibold">Yes</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoVerification(a)}
                          >
                            <Undo2 className="w-4 h-4 mr-1" /> Undo
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(a)}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          Verify + Pay
                        </Button>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          a.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {a.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(a.id, "Paid")}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(a.id, "Rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* 🔽 Extra info */}
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="p-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <p className="font-semibold text-purple-700">
                          Referrer:
                          <span className="text-gray-600 ml-1">
                            {affiliates.find((u) => u.id === a.referrer_id)?.name ||
                              "— None —"}
                          </span>
                        </p>

                        <div>
                          <p className="font-semibold text-purple-700 mb-1">
                            Referred Users:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            {affiliates
                              .filter((u) => u.referrer_id === a.id)
                              .map((ref) => (
                                <li key={ref.id}>
                                  <span className="font-medium text-gray-800">
                                    {ref.name}
                                  </span>{" "}
                                  —{" "}
                                  <span className="text-xs text-gray-500">
                                    {new Date(ref.created_at).toLocaleDateString()}
                                  </span>{" "}
                                  <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                      ref.status === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : ref.status === "Verified"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {ref.status}
                                  </span>
                                </li>
                              ))}
                            {affiliates.filter((u) => u.referrer_id === a.id).length ===
                              0 && (
                              <li className="text-gray-500 italic">
                                No referrals yet
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.main>
  );
}
