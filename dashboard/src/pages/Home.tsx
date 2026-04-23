import { Users, Store, FileText, IndianRupee, Bike, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useCurrency } from "../hooks/useCurrency";
import { Link } from "react-router-dom";

export default function Home() {
  const { data, isLoading, isError } = useGetQuery({
    url: "/admin-dashboard",
    queryKey: ["admin-dashboard-stats"],
  });
  const { currencySymbol } = useCurrency();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-red-500 font-medium">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { stats, recentOrders, needsAttention } = data.data;

  const dynamicStats = [
    { name: "Total Revenue", value: `${currencySymbol}${stats.totalRevenue}`, icon: IndianRupee },
    { name: "Active Orders", value: stats.activeOrders, icon: FileText },
    { name: "Total Restaurants", value: stats.totalRestaurants, icon: Store },
    { name: "Total Users", value: stats.totalUsers, icon: Users },
  ];

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
        {dynamicStats.map((stat) => (
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
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.restaurant}</TableCell>
                    <TableCell>{currencySymbol}{order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered" ? "success"
                            : order.status === "Cancelled" ? "error"
                              : order.status === "Pending" ? "info"
                                : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500">
                    No recent orders.
                  </TableCell>
                </TableRow>
              )}
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
                  <p className="text-sm font-medium text-gray-900">{needsAttention.pendingRestaurants} New Restaurants</p>
                  <p className="text-xs text-gray-500">Pending approval</p>
                </div>
              </div>
              <Link to="/restaurants" className="text-sm font-medium text-orange-600 hover:text-orange-700">Review</Link>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{needsAttention.refundRequests} Refund Requests</p>
                  <p className="text-xs text-gray-500">Pending review</p>
                </div>
              </div>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">Review</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <Bike className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{needsAttention.pendingRiders} Rider Applications</p>
                  <p className="text-xs text-gray-500">Awaiting verification</p>
                </div>
              </div>
              <Link to="/riders" className="text-sm font-medium text-blue-600 hover:text-blue-700">Review</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}