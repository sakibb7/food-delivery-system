import { Search, MapPin, Star, Edit, Ban, CheckCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const RESTAURANTS = [
  { id: 1, name: "Pizza Palace", owner: "John Doe", location: "Downtown", rating: 4.8, status: "Approved" },
  { id: 2, name: "Sushi Station", owner: "Jane Smith", location: "Westside", rating: 4.5, status: "Approved" },
  { id: 3, name: "Taco Fiesta", owner: "Carlos Ruiz", location: "North App", rating: 0, status: "Pending" },
  { id: 4, name: "Burger Barn", owner: "Mike Johnson", location: "South Center", rating: 3.9, status: "Suspended" },
];

export default function Restaurants() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage restaurant partners, approvals, and performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-500 text-white border-none">
          <div className="p-6">
            <p className="text-orange-100 font-medium">Total Restaurants</p>
            <p className="text-3xl font-bold mt-2">124</p>
          </div>
        </Card>
        <Card className="bg-blue-500 text-white border-none">
          <div className="p-6">
            <p className="text-blue-100 font-medium">Pending Approvals</p>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
        </Card>
        <Card className="bg-red-500 text-white border-none">
          <div className="p-6">
            <p className="text-red-100 font-medium">Suspended</p>
            <p className="text-3xl font-bold mt-2">4</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white cursor-pointer">
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RESTAURANTS.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{restaurant.name}</p>
                    <p className="text-xs text-gray-500">Owner: {restaurant.owner}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {restaurant.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className={`h-4 w-4 mr-1 ${restaurant.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    <span className="font-medium text-gray-700">{restaurant.rating > 0 ? restaurant.rating : 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={restaurant.status === "Approved" ? "success" : restaurant.status === "Pending" ? "warning" : "error"}
                  >
                    {restaurant.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 text-gray-400">
                    {restaurant.status === "Pending" && (
                      <button className="p-1 hover:bg-green-50 hover:text-green-600 rounded transition-colors" title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-50 hover:text-blue-600 rounded transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Suspend/Ban">
                      <Ban className="h-4 w-4" />
                    </button>
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
