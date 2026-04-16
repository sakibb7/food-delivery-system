import { Search, Filter, Eye } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const ORDERS = [
  { id: "ORD-1001", customer: "John Doe", restaurant: "Pizza Palace", amount: "₹450", date: "Today, 14:30", status: "Delivered", rider: "Mike S." },
  { id: "ORD-1002", customer: "Jane Smith", restaurant: "Sushi Station", amount: "₹1200", date: "Today, 14:15", status: "Preparing", rider: "Unassigned" },
  { id: "ORD-1003", customer: "Alice Johnson", restaurant: "Burger Barn", amount: "₹350", date: "Today, 13:45", status: "On the way", rider: "David B." },
  { id: "ORD-1004", customer: "Bob Brown", restaurant: "Taco Fiesta", amount: "₹890", date: "Yesterday, 20:00", status: "Cancelled", rider: "-" },
];

export default function Orders() {
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
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white">
              <option>Any Status</option>
              <option>Preparing</option>
              <option>On the way</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Restaurant / Rider</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-orange-600">
                  {order.id}
                </TableCell>
                <TableCell className="text-gray-500">
                  {order.date}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">{order.customer}</span>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-gray-900">{order.restaurant}</p>
                  <p className="text-xs text-gray-500">Rider: {order.rider}</p>
                </TableCell>
                <TableCell className="font-medium">{order.amount}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "Delivered" ? "success" 
                      : order.status === "Cancelled" ? "error" 
                      : order.status === "Preparing" ? "warning"
                      : "info"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button className="p-1 hover:bg-gray-100 hover:text-blue-600 rounded text-gray-400 transition-colors" title="View Details">
                    <Eye className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
