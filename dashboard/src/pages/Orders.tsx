import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import dayjs from "dayjs";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useCurrency } from "../hooks/useCurrency";

interface Order {
  id: number;
  customerName: string;
  restaurantName: string;
  total: string;
  createdAt: string;
  status: string;
  rider?: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const { currencySymbol } = useCurrency();

  const { data, isLoading } = useGetQuery<{ orders: Order[] }>({
    url: "/order/admin/all",
    queryKey: ["admin-orders"],
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "any" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "success";
      case "cancelled": return "error";
      case "preparing": return "warning";
      case "pending": return "info";
      default: return "info";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all platform orders in real-time.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
            >
              <option value="any">Any Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-b-xl">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50/50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >

                    <TableCell className="font-medium text-orange-600">
                      ORD-{order.id}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {dayjs(order.createdAt).format("MMM D, YYYY, h:mm A")}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">{order.customerName}</span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{order.restaurantName}</p>
                    </TableCell>
                    <TableCell className="font-medium">{currencySymbol}{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => navigate(`/orders/${order.id}`)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-10 text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
