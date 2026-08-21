import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Store,
  MapPin,
  Star,
  ShoppingBag,
  List,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
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

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useCurrency();
  const [activeTab, setActiveTab] = useState("overview");
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 10;

  const { data, isLoading, isError } = useGetQuery<any>({
    url: `/restaurant/admin/${id}`,
    queryKey: ["admin-restaurant-details", id || ""],
    isPublic: false,
  });

  const restaurant = data?.restaurant;
  const orders = data?.orders || [];
  const menuItems = data?.menuItems || [];
  const reviews = data?.reviews || [];

  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "delivered":
      case "earning":
        return <Badge variant="success" className="capitalize">{status}</Badge>;
      case "cancelled":
      case "withdrawal":
      case "suspended":
      case "rejected":
        return <Badge variant="error" className="capitalize">{status}</Badge>;
      case "preparing":
      case "pending":
        return <Badge variant="warning" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="info" className="capitalize">{status}</Badge>;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Store },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "items", label: "Menu Items", icon: List },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Restaurant Not Found</h2>
        <p className="text-gray-500 mt-2">The restaurant you are looking for does not exist or an error occurred.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const logoUrl = restaurant.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=f97316&color=fff`;
  const coverUrl = restaurant.coverImage || "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80";

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
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Details</h1>
          <p className="text-sm text-gray-500 mt-1">Viewing details for {restaurant.name}</p>
        </div>
      </div>

      {/* Top Banner / Quick Info */}
      <Card className="overflow-hidden">
        <div className="h-32 w-full relative">
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-24 w-24 rounded-xl border-4 border-white shadow-md object-cover bg-white"
            />
          </div>
          <div className="ml-32 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(restaurant.status)}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {Number(restaurant.rating || 0).toFixed(1)} ({restaurant.totalReviews || 0} reviews)
                </span>
                {restaurant.cuisine && (
                  <span className="text-sm text-gray-500">• {restaurant.cuisine}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{currencySymbol}{Number(restaurant.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Restaurant Information</h3>
                <div className="space-y-4">
                  {restaurant.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-900 text-sm mt-1">{restaurant.description}</p>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{restaurant.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {[restaurant.address, restaurant.area, restaurant.city, restaurant.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  {restaurant.deliveryTime && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Est. Delivery: {restaurant.deliveryTime}</span>
                    </div>
                  )}
                  {restaurant.ownerFirstName && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {restaurant.ownerFirstName} {restaurant.ownerLastName || ""}
                      </p>
                      {restaurant.ownerEmail && (
                        <p className="text-xs text-gray-500 mt-0.5">{restaurant.ownerEmail}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
              <div className="p-6">
                <h3 className="font-semibold text-orange-50 mb-6">Performance Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-orange-100">Total Orders</p>
                    <p className="text-3xl font-bold mt-1">{restaurant.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Store className="h-4 w-4" /> Lifetime Earnings</p>
                    <p className="text-3xl font-bold mt-1">{currencySymbol}{Number(restaurant.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-100">Menu Items</p>
                    <p className="text-3xl font-bold mt-1">{menuItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-100">Joined Date</p>
                    <p className="text-lg font-medium mt-1">{formatDate(restaurant.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
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
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{currencySymbol}{Number(order.amount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {(ordersPage - 1) * ordersPerPage + 1} to{" "}
                  {Math.min(ordersPage * ordersPerPage, orders.length)} of {orders.length} orders
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    disabled={ordersPage === 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                    disabled={ordersPage === totalOrderPages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === "items" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No menu items found.
                    </TableCell>
                  </TableRow>
                )}
                {menuItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-gray-500">{item.category}</TableCell>
                    <TableCell className="font-medium">{currencySymbol}{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {item.isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="error">Out of Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <Card>
                <div className="p-6 text-center text-gray-500">No reviews yet.</div>
              </Card>
            )}
            {reviews.map((review: any) => (
              <Card key={review.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{review.customer}</span>
                      <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-4 w-4 ${idx < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
