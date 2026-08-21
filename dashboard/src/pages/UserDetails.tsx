import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Clock, Loader2 } from "lucide-react";
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

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useCurrency();

  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;

  const { data, isLoading, isError } = useGetQuery<any>({
    url: `/user/admin/${id}`,
    queryKey: ["admin-user-details", id || ""],
    isPublic: false,
  });

  const userData = data?.user;
  const addresses = data?.addresses || [];
  const orders = data?.orders || [];

  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">User Not Found</h2>
        <p className="text-gray-500 mt-2">The user you are looking for does not exist or an error occurred.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-sm text-gray-500 mt-1">Viewing details for {userData.firstName} {userData.lastName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Addresses */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.firstName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-bold text-3xl shadow-lg border-4 border-white">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </div>
                )}
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={userData.status === "active" ? "success" : "error"}>
                    {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                  </Badge>
                  <Badge variant="warning" className="capitalize">
                    {userData.role}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{userData.email}</span>
                </div>
                {userData.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{userData.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(userData.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-semibold mt-1 text-gray-900">{userData.totalOrders}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Total Spent</p>
                  <p className="text-xl font-semibold mt-1 text-gray-900">{currencySymbol}{userData.totalSpent.toFixed(2)}</p>
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
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-500">No addresses saved.</p>
                ) : (
                  addresses.map((address: any) => (
                    <div key={address.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{address.label}</span>
                        {address.isDefault && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {address.address}, {address.city}, {address.state} {address.zipcode}, {address.country}
                      </p>
                    </div>
                  ))
                )}
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
                {paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-gray-900">ORD-{order.id}</TableCell>
                    <TableCell>{order.restaurant || "Unknown"}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{currencySymbol}{Number(order.amount).toFixed(2)}</TableCell>
                    <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {((ordersPage - 1) * ordersPerPage) + 1} to {Math.min(ordersPage * ordersPerPage, orders.length)} of {orders.length} orders
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
