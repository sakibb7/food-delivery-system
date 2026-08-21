"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuthStore } from "@/store/auth";
import {
  DollarSign,
  TrendingUp,
  Banknote,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Plus,
  Loader2,
} from "lucide-react";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { toast } from "sonner";

export default function EarningsPage() {
  const { user } = useAuthStore();
  const { currencySymbol } = useCurrency();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
  });

  const { mutate: requestPayout, isLoading: isRequesting } = useQueryMutation({
    url: `/restaurant/${selectedRestaurant}/payouts`,
    method: "POST",
  });

  const { data: earningsData, isLoading } = useGetQuery({
    url: "/restaurant/my-restaurants/earnings",
    enabled: user?.role === "restaurant",
  });

  const { data: payoutsData } = useGetQuery({
    url: "/restaurant/my-restaurants/payouts",
    enabled: user?.role === "restaurant",
  });

  const { data: orderEarnings, isLoading: ordersLoading } = useGetQuery({
    url: `/restaurant/${selectedRestaurant}/order-earnings`,
    queryKey: ["order-earnings", selectedRestaurant || 0],
    enabled: !!selectedRestaurant,
  });

  const summary = earningsData?.summary || { totalEarnings: 0, totalCommission: 0, totalPaidOut: 0, availableBalance: 0 };
  const restaurants = earningsData?.restaurants || [];
  const payouts = payoutsData?.payouts || [];
  const orders = orderEarnings?.orders || [];

  const fmt = (v: number) => `${currencySymbol}${v.toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    requestPayout(
      { ...payoutForm, amount: Number(payoutForm.amount) },
      {
        onSuccess: () => {
          toast.success("Payout requested successfully!");
          setIsModalOpen(false);
          setPayoutForm({ amount: "", bankName: "", accountNumber: "", accountHolderName: "" });
          // Ideally invalidate query here
          window.location.reload();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to request payout");
        }
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Earnings & Payouts</h1>
        <p className="text-gray-500 mt-2 text-lg font-medium">Track your restaurant earnings and payment history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Earnings", value: fmt(summary.totalEarnings), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", desc: "Net after commission" },
          { label: "Commission Paid", value: fmt(summary.totalCommission), icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50", desc: "Platform fees" },
          { label: "Total Paid Out", value: fmt(summary.totalPaidOut), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", desc: "Settled to your bank" },
          { label: "Available Balance", value: fmt(summary.availableBalance), icon: Banknote, color: "text-purple-600", bg: "bg-purple-50", desc: "Ready for withdrawal" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 font-semibold text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Per-Restaurant Earnings */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Earnings by Restaurant</h2>
          <div className="space-y-4">
            {restaurants.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">No restaurant earnings yet.</div>
            ) : restaurants.map((r: any) => (
              <div key={r.id}
                onClick={() => setSelectedRestaurant(selectedRestaurant === r.id ? null : r.id)}
                className={`bg-white p-5 rounded-3xl border cursor-pointer transition-all ${selectedRestaurant === r.id ? "border-red-200 shadow-md" : "border-gray-100 hover:border-red-100"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl border border-red-100">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{r.name}</h4>
                      <p className="text-sm text-gray-500">Balance: {fmt(r.availableBalance)}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-400">Net Earned</p>
                      <p className="font-bold text-green-600">{fmt(r.totalEarnings)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-400">Commission</p>
                      <p className="font-medium text-gray-500">{fmt(r.totalCommission)}</p>
                    </div>
                    {selectedRestaurant === r.id && r.availableBalance > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModalOpen(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                      >
                        Request Payout
                      </button>
                    )}
                    <ChevronRight className={`text-gray-300 transition-transform ${selectedRestaurant === r.id ? "rotate-90" : ""}`} size={20} />
                  </div>
                </div>

                {/* Expanded: Order-level breakdown */}
                {selectedRestaurant === r.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {ordersLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No delivered orders yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                              <th className="pb-2 font-medium">Order</th>
                              <th className="pb-2 font-medium">Customer</th>
                              <th className="pb-2 font-medium">Subtotal</th>
                              <th className="pb-2 font-medium">Commission</th>
                              <th className="pb-2 font-medium">Your Earning</th>
                              <th className="pb-2 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {orders.slice(0, 10).map((o: any) => (
                              <tr key={o.id} className="hover:bg-gray-50/50">
                                <td className="py-2.5 font-medium text-gray-900">{o.orderId}</td>
                                <td className="py-2.5 text-gray-600">{o.customer}</td>
                                <td className="py-2.5 text-gray-600">{fmt(o.subtotal)}</td>
                                <td className="py-2.5 text-orange-500 font-medium">-{fmt(o.commission)}</td>
                                <td className="py-2.5 text-green-600 font-bold">{fmt(o.netEarning)}</td>
                                <td className="py-2.5 text-gray-400">{new Date(o.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Payout History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Payout History</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-6 text-center">
                <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No payouts yet</p>
                <p className="text-gray-400 text-xs mt-1">Payouts will appear here once the admin settles your earnings.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payouts.map((p: any) => (
                  <div key={p.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{fmt(Number(p.amount))}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.restaurantName}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === "paid" ? "bg-green-50 text-green-600" :
                        p.status === "processing" ? "bg-blue-50 text-blue-600" :
                        p.status === "failed" ? "bg-red-50 text-red-600" :
                        "bg-yellow-50 text-yellow-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock size={12} />
                      {new Date(p.createdAt).toLocaleDateString()}
                      {p.transactionRef && <span>· Ref: {p.transactionRef}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Payout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Request Payout</h2>
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountHolderName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="flex-1 py-3 text-white font-bold bg-red-600 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRequesting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
