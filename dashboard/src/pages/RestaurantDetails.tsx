import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Store,
  MapPin,
  Star,
  Wallet,
  ShoppingBag,
  List,
  MessageSquare,
  Clock,
  Phone,
  Mail,
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

// Dummy Data
const dummyRestaurant = {
  id: 1,
  name: "Burger King",
  status: "approved",
  rating: 4.5,
  totalReviews: 128,
  logo: "https://ui-avatars.com/api/?name=Burger+King&background=f97316&color=fff",
  coverImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
  description: "The home of the Whopper. Serving premium fast food since 1954.",
  phone: "+1 (555) 987-6543",
  email: "contact@bk-ny.com",
  address: "123 Broadway, New York, NY 10001",
  cuisine: "Fast Food, Burgers",
  deliveryTime: "30-45 mins",
  joinedAt: "2023-01-15T10:30:00Z",
  balance: 4500.5,
  totalOrders: 1432,
  totalRevenue: 28450.75,
};

const dummyOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `ORD-800${i}`,
  customer: ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"][i % 4],
  date: new Date(Date.now() - i * 86400000).toISOString(),
  amount: 25 + (i * 3.5) % 40,
  status: i < 2 ? "preparing" : i % 7 === 0 ? "cancelled" : "delivered",
}));

const dummyTransactions = Array.from({ length: 10 }, (_, i) => ({
  id: `TXN-300${i}`,
  type: i % 4 === 0 ? "withdrawal" : "earning",
  amount: i % 4 === 0 ? 500 : 20 + (i * 5.5) % 50,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  description: i % 4 === 0 ? "Payout to Bank Account" : "Order Earnings",
}));

const dummyItems = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: ["Whopper", "Cheeseburger", "French Fries", "Onion Rings", "Coca Cola", "Chicken Nuggets", "Milkshake", "Sundae"][i],
  price: 2.99 + i,
  category: i < 2 ? "Burgers" : i < 4 ? "Sides" : i < 6 ? "Beverages & Chicken" : "Desserts",
  isAvailable: i !== 5, // make one unavailable
}));

const dummyReviews = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  customer: ["Alice Smith", "John Doe", "Emma Wilson", "Michael Brown", "Sarah Davis"][i],
  rating: 5 - (i % 3), // 5, 4, 3
  comment: ["Amazing food and fast delivery!", "Good burgers but fries were cold.", "Standard fast food, nothing special.", "Always my go-to place.", "Order was missing an item."][i],
  date: new Date(Date.now() - i * 172800000).toISOString(),
}));

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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
    { id: "transactions", label: "Transactions", icon: Wallet },
  ];

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
          <p className="text-sm text-gray-500 mt-1">Viewing details for Restaurant #{id}</p>
        </div>
      </div>

      {/* Top Banner / Quick Info */}
      <Card className="overflow-hidden">
        <div className="h-32 w-full relative">
          <img
            src={dummyRestaurant.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            <img
              src={dummyRestaurant.logo}
              alt="Logo"
              className="h-24 w-24 rounded-xl border-4 border-white shadow-md object-cover bg-white"
            />
          </div>
          <div className="ml-32 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{dummyRestaurant.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(dummyRestaurant.status)}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {dummyRestaurant.rating} ({dummyRestaurant.totalReviews} reviews)
                </span>
                <span className="text-sm text-gray-500">• {dummyRestaurant.cuisine}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">${dummyRestaurant.balance.toFixed(2)}</p>
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
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                isActive
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
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-900 text-sm mt-1">{dummyRestaurant.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{dummyRestaurant.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{dummyRestaurant.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{dummyRestaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">Est. Delivery: {dummyRestaurant.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
              <div className="p-6">
                <h3 className="font-semibold text-orange-50 mb-6">Performance Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-orange-100">Total Orders</p>
                    <p className="text-3xl font-bold mt-1">{dummyRestaurant.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-100">Total Revenue</p>
                    <p className="text-3xl font-bold mt-1">${dummyRestaurant.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-orange-100">Joined Date</p>
                    <p className="text-lg font-medium mt-1">{formatDate(dummyRestaurant.joinedAt)}</p>
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
                {dummyOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(order.date)}</TableCell>
                    <TableCell className="font-medium">${order.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {dummyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-gray-500">{item.category}</TableCell>
                    <TableCell className="font-medium">${item.price.toFixed(2)}</TableCell>
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
            {dummyReviews.map((review) => (
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
                          className={`h-4 w-4 ${
                            idx < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
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

        {activeTab === "transactions" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-gray-900">{txn.id}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(txn.date)}</TableCell>
                    <TableCell>{getStatusBadge(txn.type)}</TableCell>
                    <TableCell className={`text-right font-medium ${txn.type === 'earning' ? 'text-green-600' : 'text-gray-900'}`}>
                      {txn.type === 'earning' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
