import { Users, Store, FileText, IndianRupee, TrendingUp, Bike } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const STATS = [
  { name: "Total Revenue", value: "₹45,231", icon: IndianRupee, trend: "+20.1%", trendUp: true },
  { name: "Active Orders", value: "123", icon: FileText, trend: "+12%", trendUp: true },
  { name: "Total Restaurants", value: "48", icon: Store, trend: "+2", trendUp: true },
  { name: "Total Users", value: "1,204", icon: Users, trend: "+180", trendUp: true },
];

const RECENT_ORDERS = [
  { id: "ORD-001", customer: "John Doe", restaurant: "Pizza Hut", amount: "₹450", status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", restaurant: "Burger King", amount: "₹230", status: "Processing" },
  { id: "ORD-003", customer: "Alice Johnson", restaurant: "KFC", amount: "₹780", status: "On the way" },
  { id: "ORD-004", customer: "Bob Brown", restaurant: "Subway", amount: "₹320", status: "Cancelled" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Last updated: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className={`h-4 w-4 mr-1 ${stat.trendUp ? "text-green-500" : "text-red-500"}`} />
                <span className={stat.trendUp ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                  {stat.trend}
                </span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.restaurant}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Delivered" ? "success"
                          : order.status === "Cancelled" ? "error"
                            : order.status === "Processing" ? "warning"
                              : "info"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Action Required */}
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">3 New Restaurants</p>
                  <p className="text-xs text-gray-500">Pending approval</p>
                </div>
              </div>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700">Review</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">12 Refund Requests</p>
                  <p className="text-xs text-gray-500">Pending review</p>
                </div>
              </div>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">Review</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <Bike className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">5 Rider Applications</p>
                  <p className="text-xs text-gray-500">Awaiting verification</p>
                </div>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Review</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}