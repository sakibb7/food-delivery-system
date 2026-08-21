import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryMutation } from "../hooks/mutate/useQueryMutation";
import { ArrowLeft, Mail, Phone, Wallet, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, Star, Bike, Shield, FileText, Loader2, Banknote } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useCurrency } from "../hooks/useCurrency";

function CodBalanceCard({ riderId }: { riderId: string | undefined }) {
  const { currencySymbol } = useCurrency();
  const { data, isLoading } = useGetQuery<any>({
    url: `/rider/admin/cod-remittances`,
    queryKey: ["admin-cod-rider", riderId || ""],
    params: { riderId }
  });

  const remittances = data?.remittances || [];
  const pendingAmount = remittances.filter((r: any) => r.status === "pending").reduce((sum: number, r: any) => sum + Number(r.amountToRemit || 0), 0);

  if (isLoading) return null;
  if (pendingAmount === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-red-500 to-rose-600 border-none text-white">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-red-50">COD Cash in Hand</h3>
          <Banknote className="h-5 w-5 text-red-200" />
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">{currencySymbol}{pendingAmount.toFixed(2)}</span>
        </div>
        <p className="text-sm mt-4 text-red-100">Pending remittance from {remittances.filter((r: any) => r.status === "pending").length} COD deliveries</p>
      </div>
    </Card>
  );
}

export default function RiderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useCurrency();

  const [delPage, setDelPage] = useState(1);
  const delPerPage = 5;

  const [txnsPage, setTxnsPage] = useState(1);
  const txnsPerPage = 5;

  const { data, isLoading, isError } = useGetQuery<any>({
    url: `/rider/admin/${id}`,
    queryKey: ["admin-rider-details", id || ""],
    isPublic: false,
  });

  const queryClient = useQueryClient();

  const { mutate: updateApprovalStatus, isLoading: isUpdatingApproval } = useQueryMutation({
    url: `/rider/admin/${id}/approval`,
    method: "PATCH",
  });

  const handleApprovalUpdate = (status: string) => {
    updateApprovalStatus({ approvalStatus: status }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-rider-details", id || ""] });
        queryClient.invalidateQueries({ queryKey: ["admin-riders-all"] });
      }
    });
  };

  const rider = data?.rider;
  const deliveries = data?.deliveries || [];
  const transactions = data?.transactions || [];

  const totalDelPages = Math.ceil(deliveries.length / delPerPage);
  const paginatedDeliveries = deliveries.slice((delPage - 1) * delPerPage, delPage * delPerPage);

  const totalTxnPages = Math.ceil(transactions.length / txnsPerPage);
  const paginatedTxns = transactions.slice((txnsPage - 1) * txnsPerPage, txnsPage * txnsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>;
      case "out_for_delivery":
        return <Badge variant="warning">In Progress</Badge>;
      case "ready_for_pickup":
        return <Badge variant="warning">Ready</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getRiderStatusLabel = () => {
    if (!rider) return "Unknown";
    if (rider.status === "banned") return "Suspended";
    if (rider.isOnline) return "Online";
    return "Offline";
  };

  const getRiderStatusVariant = () => {
    if (!rider) return "default" as const;
    if (rider.status === "banned") return "error" as const;
    if (rider.isOnline) return "success" as const;
    return "default" as const;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading rider details...</p>
        </div>
      </div>
    );
  }

  if (isError || !rider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Rider Not Found</h2>
        <p className="text-gray-500 mt-2">The rider you are looking for does not exist or an error occurred.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Details</h1>
          <p className="text-sm text-gray-500 mt-1">Viewing details for {rider.firstName} {rider.lastName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile, Balance, Vehicle, KYC */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {rider.avatar ? (
                  <img
                    src={rider.avatar}
                    alt={rider.firstName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-bold text-3xl shadow-lg border-4 border-white">
                    {rider.firstName?.charAt(0)}{rider.lastName?.charAt(0)}
                  </div>
                )}
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {rider.firstName} {rider.lastName}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={getRiderStatusVariant()}>
                    {getRiderStatusLabel()}
                  </Badge>
                  {rider.rating && Number(rider.rating) > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-200">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{Number(rider.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{rider.email}</span>
                </div>
                {rider.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{rider.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(rider.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-orange-50">Total Earnings</h3>
                <Wallet className="h-5 w-5 text-orange-200" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{currencySymbol}{Number(rider.totalEarnings || 0).toFixed(2)}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-orange-400/30 pt-4">
                <div>
                  <p className="text-sm text-orange-100">Total Deliveries</p>
                  <p className="text-xl font-semibold mt-1">{rider.totalDeliveries || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-100">Rating</p>
                  <p className="text-xl font-semibold mt-1 flex items-center gap-1">
                    {rider.rating ? Number(rider.rating).toFixed(1) : "N/A"} {rider.rating && Number(rider.rating) > 0 && <Star className="h-4 w-4 fill-current text-yellow-300" />}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* COD Cash Balance Card */}
          <CodBalanceCard riderId={id} />

          {/* Vehicle Details Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Bike className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Vehicle Details</h3>
              </div>
              {rider.vehicleType ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-900 mt-1 capitalize">{rider.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Make / Model</p>
                      <p className="font-medium text-gray-900 mt-1">{rider.vehicleMakeModel || "N/A"}</p>
                    </div>
                    {rider.vehicleRegistration && (
                      <div className="col-span-2">
                        <p className="text-gray-500">Registration</p>
                        <p className="font-medium text-gray-900 mt-1 px-2 py-1 bg-gray-100 rounded inline-block uppercase tracking-wider">{rider.vehicleRegistration}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No vehicle details available.</p>
              )}
            </div>
          </Card>

          {/* KYC / Approval Details Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Approval Status</h3>
                </div>
                {getApprovalBadge(rider.approvalStatus || "pending")}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-y-4 text-sm">
                  {rider.drivingLicenseUrl && (
                    <div>
                      <p className="text-gray-500">Driving License</p>
                      <p className="font-medium text-gray-900 mt-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <a href={rider.drivingLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a>
                      </p>
                    </div>
                  )}
                  {rider.vehicleRegistrationUrl && (
                    <div>
                      <p className="text-gray-500">Vehicle Registration</p>
                      <p className="font-medium text-gray-900 mt-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <a href={rider.vehicleRegistrationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a>
                      </p>
                    </div>
                  )}
                  {rider.profileCreatedAt && (
                    <div>
                      <p className="text-gray-500">Profile Created</p>
                      <p className="font-medium text-gray-900 mt-1">{formatDate(rider.profileCreatedAt)}</p>
                    </div>
                  )}
                  {!rider.drivingLicenseUrl && !rider.vehicleRegistrationUrl && !rider.profileCreatedAt && (
                    <p className="text-gray-500">No documents uploaded yet.</p>
                  )}
                </div>
                
                {rider.approvalStatus === "pending" && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => handleApprovalUpdate("approved")}
                      disabled={isUpdatingApproval}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isUpdatingApproval ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprovalUpdate("rejected")}
                      disabled={isUpdatingApproval}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isUpdatingApproval ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Reject
                    </button>
                  </div>
                )}
                
                {rider.approvalStatus === "rejected" && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => handleApprovalUpdate("approved")}
                      disabled={isUpdatingApproval}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isUpdatingApproval ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Re-Approve
                    </button>
                  </div>
                )}
                
                {rider.approvalStatus === "approved" && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => handleApprovalUpdate("rejected")}
                      disabled={isUpdatingApproval}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isUpdatingApproval ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Revoke Approval
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Deliveries & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery History */}
          <Card>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Delivery History</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Earning</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No deliveries found.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedDeliveries.map((del: any) => (
                  <TableRow key={del.id}>
                    <TableCell className="font-medium text-gray-900">{del.orderId}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{del.restaurant}</p>
                      <p className="text-xs text-gray-500">To: {del.customer}</p>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{formatDate(del.date)}</TableCell>
                    <TableCell className="font-medium text-green-600">+{currencySymbol}{del.earning.toFixed(2)}</TableCell>
                    <TableCell>{getDeliveryStatusBadge(del.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {deliveries.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {((delPage - 1) * delPerPage) + 1} to {Math.min(delPage * delPerPage, deliveries.length)} of {deliveries.length} deliveries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDelPage(p => Math.max(1, p - 1))}
                    disabled={delPage === 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setDelPage(p => Math.min(totalDelPages, p + 1))}
                    disabled={delPage === totalDelPages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Transactions */}
          <Card>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Earnings History</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTxns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedTxns.map((txn: any) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-gray-900">{txn.id}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{formatDate(txn.date)}</TableCell>
                    <TableCell>
                      {txn.type === "credit" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <ArrowDownRight className="h-3 w-3" />
                          Credit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <ArrowUpRight className="h-3 w-3" />
                          Debit
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{currencySymbol}{Number(txn.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {transactions.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {((txnsPage - 1) * txnsPerPage) + 1} to {Math.min(txnsPage * txnsPerPage, transactions.length)} of {transactions.length} transactions
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTxnsPage(p => Math.max(1, p - 1))}
                    disabled={txnsPage === 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setTxnsPage(p => Math.min(totalTxnPages, p + 1))}
                    disabled={txnsPage === totalTxnPages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
