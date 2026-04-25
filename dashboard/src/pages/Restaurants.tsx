import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Ban,
  CheckCircle,
  Trash2,
  Store,
  Clock,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { useQueryMutation } from "../hooks/mutate/useQueryMutation";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { toast } from "sonner";

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  area: string | null;
  cuisine: string | null;
  deliveryTime: string | null;
  isOpen: boolean;
  isActive: boolean;
  isVerified: boolean;
  status: string | null;
  rating: string | null;
  totalReviews: number | null;
  createdAt: string;
  ownerId: number;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  ownerEmail: string | null;
}

type ConfirmAction = {
  type: "approve" | "suspend" | "reject" | "delete";
  restaurant: Restaurant;
} | null;

export default function Restaurants() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Fetch all restaurants for admin
  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    refetch,
  } = useGetQuery<{ restaurants: Restaurant[] }>({
    url: "/restaurant/admin/all",
    queryKey: ["admin-restaurants"],
  });

  // Mutations
  const { mutate: approveRestaurant, isLoading: approving } = useQueryMutation({
    url: "/restaurant",
    method: "PATCH",
  });

  const { mutate: suspendRestaurant, isLoading: suspending } =
    useQueryMutation({
      url: "/restaurant",
      method: "PATCH",
    });

  const { mutate: rejectRestaurant, isLoading: rejecting } = useQueryMutation({
    url: "/restaurant",
    method: "PATCH",
  });

  const { mutate: deleteRestaurant, isLoading: deleting } = useQueryMutation({
    url: "/restaurant",
    method: "DELETE",
  });

  const restaurants = restaurantsData?.restaurants ?? [];

  // Stats
  const stats = useMemo(() => {
    const total = restaurants.length;
    const pending = restaurants.filter((r) => r.status === "pending").length;
    const approved = restaurants.filter((r) => r.status === "approved").length;
    const suspended = restaurants.filter(
      (r) => r.status === "suspended"
    ).length;
    const rejected = restaurants.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, suspended, rejected };
  }, [restaurants]);

  // Filtered & searched restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.ownerFirstName?.toLowerCase().includes(q) ||
          r.ownerLastName?.toLowerCase().includes(q) ||
          r.ownerEmail?.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [restaurants, statusFilter, searchQuery]);

  // Action handlers
  const handleApprove = (restaurant: Restaurant) => {
    setConfirmAction({ type: "approve", restaurant });
  };

  const handleSuspend = (restaurant: Restaurant) => {
    setConfirmAction({ type: "suspend", restaurant });
  };

  const handleReject = (restaurant: Restaurant) => {
    setConfirmAction({ type: "reject", restaurant });
  };

  const handleDelete = (restaurant: Restaurant) => {
    setConfirmAction({ type: "delete", restaurant });
  };

  const executeAction = () => {
    if (!confirmAction) return;

    const { type, restaurant } = confirmAction;

    if (type === "approve") {
      approveRestaurant(
        { updatedUrl: `/restaurant/${restaurant.id}/approve` },
        {
          onSuccess: () => {
            toast.success(`"${restaurant.name}" has been approved!`);
            setConfirmAction(null);
            refetch();
          },
        }
      );
    } else if (type === "suspend") {
      suspendRestaurant(
        { updatedUrl: `/restaurant/${restaurant.id}/suspend` },
        {
          onSuccess: () => {
            toast.success(`"${restaurant.name}" has been suspended.`);
            setConfirmAction(null);
            refetch();
          },
        }
      );
    } else if (type === "reject") {
      rejectRestaurant(
        { updatedUrl: `/restaurant/${restaurant.id}/reject` },
        {
          onSuccess: () => {
            toast.success(`"${restaurant.name}" has been rejected.`);
            setConfirmAction(null);
            refetch();
          },
        }
      );
    } else if (type === "delete") {
      deleteRestaurant(
        { updatedUrl: `/restaurant/${restaurant.id}/admin` },
        {
          onSuccess: () => {
            toast.success(`"${restaurant.name}" has been deleted.`);
            setConfirmAction(null);
            refetch();
          },
        }
      );
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "suspended":
        return <Badge variant="error">Suspended</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="warning">{status ?? "Unknown"}</Badge>;
    }
  };

  const isActionLoading = approving || suspending || rejecting || deleting;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage restaurant partners, approvals, and performance.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="border-none relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Total Restaurants
                </p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="border-none relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="border-none relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold mt-1">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="border-none relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Suspended</p>
                <p className="text-3xl font-bold mt-1">{stats.suspended}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="search-restaurants"
              type="text"
              placeholder="Search by name, owner, city, cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {filteredRestaurants.length} result
              {filteredRestaurants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {restaurantsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading restaurants...</p>
            </div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Store className="h-12 w-12" />
              <p className="text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "No restaurants match your filters."
                  : "No restaurants found."}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant Info</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.map((restaurant) => (
                <TableRow
                  key={restaurant.id}

                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {/* Restaurant Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                        {restaurant.logo ? (
                          <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {restaurant.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {restaurant.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        {restaurant.ownerFirstName} {restaurant.ownerLastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {restaurant.ownerEmail}
                      </p>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {restaurant.area
                          ? `${restaurant.area}, ${restaurant.city}`
                          : restaurant.city}
                      </span>
                    </div>
                  </TableCell>

                  {/* Cuisine */}
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {restaurant.cuisine || "—"}
                    </span>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star
                        className={`h-3.5 w-3.5 ${Number(restaurant.rating) > 0
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                          }`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {Number(restaurant.rating) > 0
                          ? Number(restaurant.rating).toFixed(1)
                          : "N/A"}
                      </span>
                      {restaurant.totalReviews ? (
                        <span className="text-xs text-gray-400">
                          ({restaurant.totalReviews})
                        </span>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(restaurant.status)}</TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {restaurant.status === "pending" && (
                        <>
                          <button
                            id={`approve-${restaurant.id}`}
                            onClick={(e) => { e.stopPropagation(); handleApprove(restaurant); }}
                            className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors text-gray-400"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            id={`reject-${restaurant.id}`}
                            onClick={(e) => { e.stopPropagation(); handleReject(restaurant); }}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {restaurant.status === "approved" && (
                        <button
                          id={`suspend-${restaurant.id}`}
                          onClick={(e) => { e.stopPropagation(); handleSuspend(restaurant); }}
                          className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-md transition-colors text-gray-400"
                          title="Suspend"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      {restaurant.status === "suspended" && (
                        <button
                          id={`reactivate-${restaurant.id}`}
                          onClick={(e) => { e.stopPropagation(); handleApprove(restaurant); }}
                          className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors text-gray-400"
                          title="Reactivate"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        id={`delete-${restaurant.id}`}
                        onClick={(e) => { e.stopPropagation(); handleDelete(restaurant); }}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => navigate(`/restaurants/${restaurant.id}`)}>
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isActionLoading && setConfirmAction(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={() => !isActionLoading && setConfirmAction(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div
                className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${confirmAction.type === "approve"
                  ? "bg-green-50"
                  : confirmAction.type === "suspend"
                    ? "bg-amber-50"
                    : "bg-red-50"
                  }`}
              >
                {confirmAction.type === "approve" ? (
                  <CheckCircle className="h-7 w-7 text-green-500" />
                ) : confirmAction.type === "suspend" ? (
                  <AlertTriangle className="h-7 w-7 text-amber-500" />
                ) : confirmAction.type === "reject" ? (
                  <XCircle className="h-7 w-7 text-red-500" />
                ) : (
                  <Trash2 className="h-7 w-7 text-red-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {confirmAction.type === "approve"
                  ? "Approve Restaurant"
                  : confirmAction.type === "suspend"
                    ? "Suspend Restaurant"
                    : confirmAction.type === "reject"
                      ? "Reject Application"
                      : "Delete Restaurant"}
              </h3>

              <p className="text-sm text-gray-500 text-center mt-2">
                {confirmAction.type === "approve" ? (
                  <>
                    Are you sure you want to approve{" "}
                    <strong className="text-gray-700">
                      {confirmAction.restaurant.name}
                    </strong>
                    ? It will become visible to customers.
                  </>
                ) : confirmAction.type === "suspend" ? (
                  <>
                    Are you sure you want to suspend{" "}
                    <strong className="text-gray-700">
                      {confirmAction.restaurant.name}
                    </strong>
                    ? It will be hidden from customers.
                  </>
                ) : confirmAction.type === "reject" ? (
                  <>
                    Are you sure you want to reject the application from{" "}
                    <strong className="text-gray-700">
                      {confirmAction.restaurant.name}
                    </strong>
                    ? The restaurant owner will be notified.
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete{" "}
                    <strong className="text-gray-700">
                      {confirmAction.restaurant.name}
                    </strong>
                    ? This action cannot be undone.
                  </>
                )}
              </p>

              {/* Restaurant info summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Store className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {confirmAction.restaurant.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Owner: {confirmAction.restaurant.ownerFirstName}{" "}
                      {confirmAction.restaurant.ownerLastName} •{" "}
                      {confirmAction.restaurant.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={isActionLoading}
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmAction.type === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : confirmAction.type === "suspend"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {isActionLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {confirmAction.type === "approve"
                  ? "Approve"
                  : confirmAction.type === "suspend"
                    ? "Suspend"
                    : confirmAction.type === "reject"
                      ? "Reject"
                      : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
