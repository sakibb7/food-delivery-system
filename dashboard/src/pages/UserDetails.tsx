import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Wallet, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";
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
const dummyUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  role: "user",
  status: "active",
  avatar: "https://i.pravatar.cc/150?u=1",
  joinedAt: "2023-08-15T10:30:00Z",
  balance: 125.50,
  totalOrders: 42,
  totalSpent: 1240.75,
};

const dummyAddresses = [
  { id: 1, label: "Home", address: "123 Main St, Apt 4B, New York, NY 10001", isDefault: true },
  { id: 2, label: "Work", address: "456 Market St, Suite 100, San Francisco, CA 94105", isDefault: false },
];

const dummyOrders = Array.from({ length: 20 }, (_, i) => ({
  id: `ORD-${1000 + i}`,
  restaurant: ["Burger King", "Pizza Hut", "Starbucks", "KFC", "McDonald's", "Subway", "Taco Bell"][i % 7],
  date: new Date(Date.now() - i * 86400000).toISOString(),
  amount: 15 + ((i * 3.5) % 30),
  status: i < 2 ? "pending" : (i % 5 === 0 ? "cancelled" : "delivered")
}));

const dummyTransactions = Array.from({ length: 20 }, (_, i) => ({
  id: `TXN-${500 + i}`,
  type: i % 3 === 0 ? "credit" : "debit",
  amount: 10 + ((i * 2.5) % 40),
  date: new Date(Date.now() - i * 86400000).toISOString(),
  description: i % 3 === 0 ? "Added funds via Credit Card" : `Order Payment`
}));

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;
  const totalOrderPages = Math.ceil(dummyOrders.length / ordersPerPage);
  const paginatedOrders = dummyOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

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

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-sm text-gray-500 mt-1">Viewing details for User #{id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Balance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={dummyUser.avatar}
                  alt={dummyUser.firstName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {dummyUser.firstName} {dummyUser.lastName}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={dummyUser.status === "active" ? "success" : "error"}>
                    {dummyUser.status.charAt(0).toUpperCase() + dummyUser.status.slice(1)}
                  </Badge>
                  <Badge variant="warning" className="capitalize">
                    {dummyUser.role}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{dummyUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{dummyUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(dummyUser.joinedAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-indigo-100">Wallet Balance</h3>
                <Wallet className="h-5 w-5 text-indigo-200" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">${dummyUser.balance.toFixed(2)}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-indigo-400/30 pt-4">
                <div>
                  <p className="text-sm text-indigo-100">Total Orders</p>
                  <p className="text-xl font-semibold mt-1">{dummyUser.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Total Spent</p>
                  <p className="text-xl font-semibold mt-1">${dummyUser.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Addresses Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Saved Addresses</h3>
              </div>
              <div className="space-y-4">
                {dummyAddresses.map((address) => (
                  <div key={address.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{address.label}</span>
                      {address.isDefault && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{address.address}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Orders & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <Card>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">All Orders</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                    <TableCell>{order.restaurant}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{formatDate(order.date)}</TableCell>
                    <TableCell className="font-medium">${order.amount.toFixed(2)}</TableCell>
                    <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {((ordersPage - 1) * ordersPerPage) + 1} to {Math.min(ordersPage * ordersPerPage, dummyOrders.length)} of {dummyOrders.length} orders
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                  disabled={ordersPage === 1}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                  disabled={ordersPage === totalOrderPages}
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
              <h3 className="font-semibold text-gray-900">All Transactions</h3>
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
