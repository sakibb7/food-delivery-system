import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Wallet, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, Star, Bike, Shield, FileText } from "lucide-react";
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

// Dummy Data
const dummyRider = {
  id: "R-101",
  firstName: "Mike",
  lastName: "Smith",
  email: "mike.smith@example.com",
  phone: "+91 9876543210",
  status: "On Delivery",
  avatar: "https://i.pravatar.cc/150?u=101",
  joinedAt: "2023-01-10T08:30:00Z",
  balance: 340.50,
  totalDeliveries: 124,
  rating: 4.9,
  vehicle: {
    type: "Motorcycle",
    make: "Honda",
    model: "CB Shine",
    color: "Black",
    licensePlate: "MH 12 AB 1234",
  },
  kyc: {
    status: "Verified",
    documentType: "Driver's License",
    documentNumber: "DL-1234567890",
    verifiedAt: "2023-01-12T10:00:00Z",
  }
};

const dummyDeliveries = Array.from({ length: 20 }, (_, i) => ({
  id: `DEL-${1000 + i}`,
  orderId: `ORD-${5000 + i}`,
  restaurant: ["Burger King", "Pizza Hut", "Starbucks", "KFC", "McDonald's", "Subway", "Taco Bell"][i % 7],
  customer: ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown"][i % 4],
  date: new Date(Date.now() - i * 86400000).toISOString(),
  earning: 3.5 + ((i * 1.5) % 8),
  status: i < 2 ? "in_progress" : (i % 8 === 0 ? "cancelled" : "delivered")
}));

const dummyTransactions = Array.from({ length: 20 }, (_, i) => ({
  id: `TXN-${800 + i}`,
  type: i % 4 === 0 ? "debit" : "credit",
  amount: i % 4 === 0 ? 50 + ((i * 5) % 100) : 3.5 + ((i * 1.5) % 8), // withdrawal or delivery earning
  date: new Date(Date.now() - i * 86400000).toISOString(),
  description: i % 4 === 0 ? "Withdrawal to Bank Account" : `Delivery Earning (DEL-${1000 + i})`
}));

export default function RiderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delPage, setDelPage] = useState(1);
  const delPerPage = 5;
  const totalDelPages = Math.ceil(dummyDeliveries.length / delPerPage);
  const paginatedDeliveries = dummyDeliveries.slice((delPage - 1) * delPerPage, delPage * delPerPage);

  const [txnsPage, setTxnsPage] = useState(1);
  const txnsPerPage = 5;
  const totalTxnPages = Math.ceil(dummyTransactions.length / txnsPerPage);
  const paginatedTxns = dummyTransactions.slice((txnsPage - 1) * txnsPerPage, txnsPage * txnsPerPage);

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
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

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
          <p className="text-sm text-gray-500 mt-1">Viewing details for Rider #{id || dummyRider.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile, Balance, Vehicle, KYC */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={dummyRider.avatar}
                  alt={dummyRider.firstName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {dummyRider.firstName} {dummyRider.lastName}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge 
                    variant={
                      dummyRider.status === "Available" ? "success" 
                      : dummyRider.status === "On Delivery" ? "warning"
                      : dummyRider.status === "Suspended" ? "error"
                      : "default"
                    }
                  >
                    {dummyRider.status}
                  </Badge>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-200">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{dummyRider.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{dummyRider.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{dummyRider.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(dummyRider.joinedAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-orange-50">Wallet Balance</h3>
                <Wallet className="h-5 w-5 text-orange-200" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">${dummyRider.balance.toFixed(2)}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-orange-400/30 pt-4">
                <div>
                  <p className="text-sm text-orange-100">Total Deliveries</p>
                  <p className="text-xl font-semibold mt-1">{dummyRider.totalDeliveries}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-100">Rating</p>
                  <p className="text-xl font-semibold mt-1 flex items-center gap-1">
                    {dummyRider.rating} <Star className="h-4 w-4 fill-current text-yellow-300" />
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Details Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Bike className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Vehicle Details</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium text-gray-900 mt-1">{dummyRider.vehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Make / Model</p>
                    <p className="font-medium text-gray-900 mt-1">{dummyRider.vehicle.make} {dummyRider.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="font-medium text-gray-900 mt-1">{dummyRider.vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">License Plate</p>
                    <p className="font-medium text-gray-900 mt-1 px-2 py-1 bg-gray-100 rounded inline-block uppercase tracking-wider">{dummyRider.vehicle.licensePlate}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* KYC Details Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">KYC Details</h3>
                </div>
                <Badge variant={dummyRider.kyc.status === "Verified" ? "success" : "warning"}>
                  {dummyRider.kyc.status}
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Document Type</p>
                    <p className="font-medium text-gray-900 mt-1 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      {dummyRider.kyc.documentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Document Number</p>
                    <p className="font-mono font-medium text-gray-900 mt-1">{dummyRider.kyc.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Verified At</p>
                    <p className="font-medium text-gray-900 mt-1">{formatDate(dummyRider.kyc.verifiedAt)}</p>
                  </div>
                </div>
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
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Earning</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeliveries.map((del) => (
                  <TableRow key={del.id}>
                    <TableCell className="font-medium text-gray-900">{del.id}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{del.restaurant}</p>
                      <p className="text-xs text-gray-500">To: {del.customer} ({del.orderId})</p>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{formatDate(del.date)}</TableCell>
                    <TableCell className="font-medium text-green-600">+${del.earning.toFixed(2)}</TableCell>
                    <TableCell>{getDeliveryStatusBadge(del.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {((delPage - 1) * delPerPage) + 1} to {Math.min(delPage * delPerPage, dummyDeliveries.length)} of {dummyDeliveries.length} deliveries
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
          </Card>

          {/* Transactions */}
          <Card>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Wallet Transactions</h3>
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
                {paginatedTxns.map((txn) => (
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
                      {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {((txnsPage - 1) * txnsPerPage) + 1} to {Math.min(txnsPage * txnsPerPage, dummyTransactions.length)} of {dummyTransactions.length} transactions
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
          </Card>
        </div>
      </div>
    </div>
  );
}
