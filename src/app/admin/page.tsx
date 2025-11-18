"use client";

import React, { useEffect, useState } from "react";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  country: string;
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

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);

  // Load users from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUsers(JSON.parse(raw));
      } catch {
        setUsers([]);
      }
    }
  }, []);

  // Persist users whenever users state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Approve a user
  const approveUser = (id: string) => {
    const updated: UserRecord[] = users.map(u =>
      u.id === id ? { ...u, status: "approved", paid: false } : u
    );
    setUsers(updated);
  };

  // Unapprove a user (back to pending)
  const unapproveUser = (id: string) => {
    const updated: UserRecord[] = users.map(u =>
      u.id === id ? { ...u, status: "pending", paid: false } : u
    );
    setUsers(updated);
  };

  // Mark user as paid
  const markPaid = (id: string) => {
    const updated: UserRecord[] = users.map(u =>
      u.id === id ? { ...u, status: "paid", paid: true } : u
    );
    setUsers(updated);
  };

  // Mark user as unpaid (back to approved)
  const markUnpaid = (id: string) => {
    const updated: UserRecord[] = users.map(u =>
      u.id === id ? { ...u, status: "approved", paid: false } : u
    );
    setUsers(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.status}</td>
                <td className="px-4 py-3">${u.amount.toLocaleString()}</td>
                <td className="px-4 py-3 flex gap-2 flex-wrap">
                  {u.status === "pending" && (
                    <button
                      onClick={() => approveUser(u.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                    >
                      Approve
                    </button>
                  )}

                  {u.status === "approved" && (
                    <>
                      <button
                        onClick={() => unapproveUser(u.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition"
                      >
                        Unapprove
                      </button>
                      <button
                        onClick={() => markPaid(u.id)}
                        className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm transition"
                      >
                        Mark Paid
                      </button>
                    </>
                  )}

                  {u.status === "paid" && (
                    <button
                      onClick={() => markUnpaid(u.id)}
                      className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm transition"
                    >
                      Mark Unpaid
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
