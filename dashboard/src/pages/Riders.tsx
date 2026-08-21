import { useNavigate } from "react-router-dom";
import { Bike, Search, CheckCircle, Ban, Star, Navigation, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useState, useMemo } from "react";

interface Rider {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  vehicleType: string | null;
  isOnline: boolean | null;
  approvalStatus: string | null;
  rating: string | null;
  totalReviews: number | null;
  totalDeliveries: number;
}

export default function Riders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetQuery<{ riders: Rider[] }>({
    url: "/rider/admin/all",
    queryKey: ["admin-riders-all"],
    isPublic: false,
  });

  const riders = data?.riders || [];

  const filteredRiders = useMemo(() => {
    if (!search.trim()) return riders;
    const q = search.toLowerCase();
    return riders.filter(
      (r) =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        String(r.id).includes(q)
    );
  }, [riders, search]);

  // Compute stats
  const totalRiders = riders.length;
  const availableRiders = riders.filter((r) => r.isOnline && r.status !== "banned").length;
  const onDelivery = riders.filter((r) => r.isOnline).length; // approximate
  const suspendedRiders = riders.filter((r) => r.status === "banned").length;

  const getRiderStatusBadge = (rider: Rider) => {
    if (rider.status === "banned") {
      return <Badge variant="error">Suspended</Badge>;
    }
    if (rider.approvalStatus === "pending") {
      return <Badge variant="warning">Pending Approval</Badge>;
    }
    if (rider.approvalStatus === "rejected") {
      return <Badge variant="error">Rejected</Badge>;
    }
    if (rider.isOnline) {
      return <Badge variant="success">Online</Badge>;
    }
    return <Badge variant="default">Offline</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery personnel and track their status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Riders</p>
              <p className="text-xl font-bold">{isLoading ? "—" : totalRiders}</p>
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
              <p className="text-xl font-bold">{isLoading ? "—" : availableRiders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Online</p>
              <p className="text-xl font-bold">{isLoading ? "—" : onDelivery}</p>
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
              <p className="text-xl font-bold">{isLoading ? "—" : suspendedRiders}</p>
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
              placeholder="Search riders by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          </div>
        ) : (
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
              {filteredRiders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No riders found.
                  </TableCell>
                </TableRow>
              )}
              {filteredRiders.map((rider) => (
                <TableRow
                  key={rider.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/riders/${rider.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {rider.avatar ? (
                        <img
                          src={rider.avatar}
                          alt={rider.firstName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                          {rider.firstName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{rider.firstName} {rider.lastName}</p>
                        <p className="text-xs text-gray-500">{rider.phone || rider.email} • #{rider.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRiderStatusBadge(rider)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-700">
                    {rider.totalDeliveries}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-700">
                        {rider.rating ? Number(rider.rating).toFixed(1) : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 text-gray-400">
                      <button
                        className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded"
                        onClick={() => navigate(`/riders/${rider.id}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
