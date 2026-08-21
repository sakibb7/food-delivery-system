import { useState } from "react";
import { IndianRupee, ArrowUpRight, ArrowDownRight, CheckCircle, Loader2, Banknote, Store, Truck } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useQueryMutation } from "../hooks/mutate/useQueryMutation";
import { useCurrency } from "../hooks/useCurrency";
import { toast } from "sonner";

type Tab = "overview" | "cod" | "payouts";

export default function Payments() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { currencySymbol } = useCurrency();

  const { data: codData, isLoading: codLoading, refetch: refetchCod } = useGetQuery<any>({
    url: "/rider/admin/cod-remittances",
    queryKey: ["admin-cod-remittances"],
  });

  const { data: payoutData, isLoading: payoutLoading, refetch: refetchPayouts } = useGetQuery<any>({
    url: "/restaurant/admin/payouts",
    queryKey: ["admin-payouts"],
  });

  const { data: balanceData, isLoading: balanceLoading } = useGetQuery<any>({
    url: "/restaurant/admin/balances",
    queryKey: ["admin-restaurant-balances"],
  });

  const confirmMutation = useQueryMutation({ url: "/rider/admin/cod-remittances/0/confirm", method: "PATCH" });
  const createPayoutMutation = useQueryMutation({ url: "/restaurant/admin/payouts", method: "POST" });
  const updatePayoutMutation = useQueryMutation({ url: "/restaurant/admin/payouts/0", method: "PATCH" });

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ restaurantId: "", amount: "", bankName: "", accountNumber: "", accountHolderName: "", adminNotes: "" });

  const remittances = codData?.remittances || [];
  const codSummary = codData?.summary || { totalPending: 0, totalConfirmed: 0 };
  const payouts = payoutData?.payouts || [];
  const payoutSummary = payoutData?.summary || { pendingPayouts: 0, totalPaidOut: 0, platformRevenue: 0 };
  const restaurantBalances = balanceData?.restaurants || [];

  const handleConfirmRemittance = (id: number) => {
    confirmMutation.mutate(
      { updatedUrl: `/rider/admin/cod-remittances/${id}/confirm` },
      { onSuccess: () => { toast.success("COD remittance confirmed"); refetchCod(); } }
    );
  };

  const handleCreatePayout = () => {
    if (!payoutForm.restaurantId || !payoutForm.amount || !payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.accountHolderName) {
      toast.error("Please fill all required fields");
      return;
    }

    const selectedRestaurant = restaurantBalances.find((r: any) => String(r.restaurantId) === String(payoutForm.restaurantId));
    if (selectedRestaurant && Number(payoutForm.amount) > Number(selectedRestaurant.availableBalance)) {
      toast.error(`Amount exceeds available balance (${currencySymbol}${selectedRestaurant.availableBalance})`);
      return;
    }

    createPayoutMutation.mutate(
      { ...payoutForm, restaurantId: Number(payoutForm.restaurantId), amount: Number(payoutForm.amount), commissionAmount: 0, periodStart: new Date().toISOString(), periodEnd: new Date().toISOString() },
      { onSuccess: () => { toast.success("Payout created"); setShowPayoutModal(false); setPayoutForm({ restaurantId: "", amount: "", bankName: "", accountNumber: "", accountHolderName: "", adminNotes: "" }); refetchPayouts(); } }
    );
  };

  const handlePayoutAction = (id: number, status: string, transactionRef?: string) => {
    updatePayoutMutation.mutate(
      { updatedUrl: `/restaurant/admin/payouts/${id}`, status, transactionRef },
      { onSuccess: () => { toast.success(`Payout marked as ${status}`); refetchPayouts(); } }
    );
  };

  const fmt = (v: number) => `${currencySymbol}${v.toFixed(2)}`;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: IndianRupee },
    { key: "cod", label: "COD Remittances", icon: Truck },
    { key: "payouts", label: "Restaurant Payouts", icon: Store },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage COD collections, restaurant payouts, and platform earnings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-white/80 font-medium">Platform Revenue</p>
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center"><ArrowUpRight className="h-4 w-4 text-white" /></div>
                </div>
                <p className="text-3xl font-bold mt-2">{fmt(payoutSummary.platformRevenue)}</p>
                <p className="text-sm mt-4 text-white/80">Total commission earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 font-medium whitespace-nowrap">Pending COD</p>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center"><Banknote className="h-4 w-4 text-orange-600" /></div>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-900">{fmt(codSummary.totalPending)}</p>
                <button onClick={() => setActiveTab("cod")} className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-4 transition-colors">View COD Remittances &rarr;</button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 font-medium">Restaurant Payouts</p>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"><ArrowDownRight className="h-4 w-4 text-blue-600" /></div>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-900">{fmt(payoutSummary.totalPaidOut)}</p>
                <button onClick={() => setActiveTab("payouts")} className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 transition-colors">Manage Payouts &rarr;</button>
              </CardContent>
            </Card>
          </div>

          {/* Restaurant Balances */}
          <Card>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Restaurant Balances</h2>
              <button onClick={() => setShowPayoutModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Payout</button>
            </div>
            {balanceLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-gray-400 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Restaurant</TableHead><TableHead>Owner</TableHead><TableHead>Total Earnings</TableHead><TableHead>Commission</TableHead><TableHead>Paid Out</TableHead><TableHead>Available</TableHead></TableRow></TableHeader>
                <TableBody>
                  {restaurantBalances.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-4 text-gray-500">No restaurants found.</TableCell></TableRow>
                  ) : restaurantBalances.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                      <TableCell className="text-gray-600">{r.ownerName}</TableCell>
                      <TableCell className="text-green-600 font-medium">{fmt(r.totalEarnings)}</TableCell>
                      <TableCell className="text-gray-500">{fmt(r.totalCommission)}</TableCell>
                      <TableCell className="text-gray-500">{fmt(r.totalPaidOut)}</TableCell>
                      <TableCell className="font-bold text-gray-900">{fmt(r.availableBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      {/* COD Remittances Tab */}
      {activeTab === "cod" && (
        <Card>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">COD Remittances</h2>
            <div className="flex gap-4 text-sm">
              <span className="text-orange-600 font-medium">Pending: {fmt(codSummary.totalPending)}</span>
              <span className="text-green-600 font-medium">Confirmed: {fmt(codSummary.totalConfirmed)}</span>
            </div>
          </div>
          {codLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-gray-400 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Rider</TableHead><TableHead>Collected</TableHead><TableHead>To Remit</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {remittances.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-4 text-gray-500">No COD remittances found.</TableCell></TableRow>
                ) : remittances.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-gray-900">ORD-{r.orderId}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{r.riderFirstName} {r.riderLastName}</p>
                      <p className="text-xs text-gray-500">{r.riderPhone}</p>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{fmt(Number(r.amountCollected))}</TableCell>
                    <TableCell className="font-bold text-orange-600">{fmt(Number(r.amountToRemit))}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "confirmed" ? "success" : r.status === "remitted" ? "info" : "warning"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {r.status === "pending" && (
                        <button onClick={() => handleConfirmRemittance(r.id)} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Confirm
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Restaurant Payouts Tab */}
      {activeTab === "payouts" && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowPayoutModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">+ Create Payout</button>
          </div>
          <Card>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Payout History</h2>
            </div>
            {payoutLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-gray-400 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Restaurant</TableHead><TableHead>Amount</TableHead><TableHead>Bank</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-4 text-gray-500">No payouts found.</TableCell></TableRow>
                  ) : payouts.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-gray-900">PAY-{p.id}</TableCell>
                      <TableCell className="text-gray-900">{p.restaurantName}</TableCell>
                      <TableCell className="font-bold text-green-600">{fmt(Number(p.amount))}</TableCell>
                      <TableCell><p className="text-sm text-gray-900">{p.bankName}</p><p className="text-xs text-gray-500">{p.accountNumber}</p></TableCell>
                      <TableCell>
                        <Badge variant={p.status === "paid" ? "success" : p.status === "processing" ? "info" : p.status === "failed" ? "error" : "warning"}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {p.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => handlePayoutAction(p.id, "paid")} className="text-green-600 hover:text-green-700 text-xs font-medium">Mark Paid</button>
                            <button onClick={() => handlePayoutAction(p.id, "failed")} className="text-red-600 hover:text-red-700 text-xs font-medium">Failed</button>
                          </div>
                        )}
                        {p.status === "processing" && (
                          <button onClick={() => handlePayoutAction(p.id, "paid")} className="text-green-600 hover:text-green-700 text-xs font-medium">Mark Paid</button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      {/* Create Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPayoutModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">Create Restaurant Payout</h2>
            <div className="space-y-3">
              <select value={payoutForm.restaurantId} onChange={(e) => setPayoutForm({ ...payoutForm, restaurantId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select Restaurant</option>
                {restaurantBalances.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name} (Balance: {fmt(r.availableBalance)})</option>
                ))}
              </select>
              <input type="number" placeholder="Amount" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Bank Name" value={payoutForm.bankName} onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Account Number" value={payoutForm.accountNumber} onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Account Holder Name" value={payoutForm.accountHolderName} onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Notes (optional)" value={payoutForm.adminNotes} onChange={(e) => setPayoutForm({ ...payoutForm, adminNotes: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowPayoutModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreatePayout} disabled={createPayoutMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {createPayoutMutation.isLoading ? "Creating..." : "Create Payout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
