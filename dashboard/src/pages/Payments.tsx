import { IndianRupee, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const TRANSACTIONS = [
  { id: "TXN-101", restaurant: "Pizza Palace", amount: "₹450", type: "Order Earnings", status: "Completed", date: "Oct 24, 2026" },
  { id: "TXN-102", restaurant: "Sushi Station", amount: "₹1200", type: "Weekly Payout", status: "Pending", date: "Oct 25, 2026" },
  { id: "TXN-103", restaurant: "Burger Barn", amount: "₹350", type: "Order Earnings", status: "Completed", date: "Oct 25, 2026" },
  { id: "TXN-104", restaurant: "Taco Fiesta", amount: "₹890", type: "Refund", status: "Processed", date: "Oct 26, 2026" },
];

export default function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage payouts, platform earnings, and refunds.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-white/80 font-medium">Platform Revenue</p>
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">₹1,24,500</p>
            <p className="text-sm mt-4 text-white/80">+14% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 font-medium whitespace-nowrap">Pending Payouts</p>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-900">₹45,200</p>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-4 transition-colors">
              Process All Payouts &rarr;
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 font-medium">Refunds</p>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-900">₹3,420</p>
            <p className="text-sm mt-4 text-red-500 font-medium">Needs review (12 cases)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium text-gray-900">
                  {txn.id}
                </TableCell>
                <TableCell>{txn.restaurant}</TableCell>
                <TableCell>
                  <span className="text-gray-600">{txn.type}</span>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {txn.amount}
                </TableCell>
                <TableCell className="text-gray-500">
                  {txn.date}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      txn.status === "Completed" ? "success" 
                      : txn.status === "Pending" ? "warning"
                      : "default"
                    }
                  >
                    {txn.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
