import { Bike, Search, CheckCircle, Ban, Star, Navigation } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const RIDERS = [
  { id: "R-101", name: "Mike Smith", phone: "+91 9876543210", status: "On Delivery", deliveries: 124, rating: 4.9 },
  { id: "R-102", name: "David Brown", phone: "+91 9876543211", status: "Available", deliveries: 89, rating: 4.7 },
  { id: "R-103", name: "Sarah Malik", phone: "+91 9876543212", status: "Offline", deliveries: 45, rating: 4.5 },
  { id: "R-104", name: "Alex Johnson", phone: "+91 9876543213", status: "Suspended", deliveries: 12, rating: 3.2 },
];

export default function Riders() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery personnel and track their status.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Onboard Rider
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Riders</p>
              <p className="text-xl font-bold">142</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Available</p>
              <p className="text-xl font-bold">45</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">On Delivery</p>
              <p className="text-xl font-bold">32</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Suspended</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search riders by name, ID or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Deliveries</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RIDERS.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                      {rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rider.name}</p>
                      <p className="text-xs text-gray-500">{rider.phone} • {rider.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      rider.status === "Available" ? "success" 
                      : rider.status === "On Delivery" ? "warning"
                      : rider.status === "Suspended" ? "error"
                      : "default"
                    }
                  >
                    {rider.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-gray-700">
                  {rider.deliveries}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700">{rider.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 text-gray-400">
                    <button className="p-1 hover:bg-gray-50 hover:text-orange-600 rounded" title="View Logs">
                      <Navigation className="h-4 w-4" />
                    </button>
                    {rider.status !== "Suspended" && (
                      <button className="p-1 hover:bg-red-50 hover:text-red-600 rounded" title="Suspend">
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
