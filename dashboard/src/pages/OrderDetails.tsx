import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Truck, CreditCard, ShoppingBag, Clock, Store, Loader2, AlertCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useCurrency } from "../hooks/useCurrency";

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

interface RiderInfo {
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  vehicleType: string | null;
  vehicleMakeModel: string | null;
  vehicleRegistration: string | null;
}

interface OrderData {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryPhone: string;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  total: string;
  notes: string | null;
  estimatedDeliveryTime: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAvatar: string | null;
  restaurantName: string;
  restaurantLogo: string | null;
  restaurantSlug: string | null;
  restaurantPhone: string | null;
  items: OrderItem[];
  rider: RiderInfo | null;
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useCurrency();

  const { data, isLoading, isError } = useGetQuery<{ order: OrderData }>({
    url: `/order/admin/${id}`,
    queryKey: ["admin-order-details", id || ""],
    isPublic: false,
  });

  const order = data?.order;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <Badge variant="success">Delivered</Badge>;
      case "cancelled": return <Badge variant="error">Cancelled</Badge>;
      case "out_for_delivery": return <Badge variant="info">Out for Delivery</Badge>;
      case "ready_for_pickup": return <Badge variant="info">Ready for Pickup</Badge>;
      case "confirmed": return <Badge variant="info">Confirmed</Badge>;
      case "preparing": return <Badge variant="warning">Preparing</Badge>;
      case "pending": return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cod": return "Cash on Delivery";
      case "card": return "Credit/Debit Card";
      case "mobile_banking": return "Mobile Banking";
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist or an error occurred.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const customerName = `${order.customerFirstName} ${order.customerLastName}`;
  const subtotal = parseFloat(order.subtotal);
  const tax = parseFloat(order.tax);
  const deliveryFee = parseFloat(order.deliveryFee);
  const total = parseFloat(order.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #ORD-{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Summary */}
          <Card>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Item Summary</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const price = parseFloat(item.price);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{currencySymbol}{price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">{currencySymbol}{(item.quantity * price).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Order Summary inside the same card below items */}
            <div className="p-6 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
              <div className="w-full max-w-sm ml-auto space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-gray-900">{currencySymbol}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-gray-900">{currencySymbol}{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600 text-lg">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Delivery Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">{order.estimatedDeliveryTime || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium text-gray-900 leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Phone</p>
                    <p className="font-medium text-gray-900">{order.deliveryPhone}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium text-gray-900">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">Payment Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">{formatPaymentMethod(order.paymentMethod)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'} className="mt-1">
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column - People Details */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <User className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Customer Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {order.customerAvatar ? (
                    <img
                      src={order.customerAvatar}
                      alt={customerName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                      {customerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{order.customerEmail}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">{order.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Restaurant */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <Store className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Restaurant</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {order.restaurantLogo ? (
                    <img
                      src={order.restaurantLogo}
                      alt={order.restaurantName}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                      {order.restaurantName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{order.restaurantName}</p>
                    {order.restaurantPhone && (
                      <p className="text-sm text-gray-500">{order.restaurantPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Rider */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <Truck className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Rider Details</h3>
              </div>
              {order.rider ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {order.rider.avatar ? (
                      <img
                        src={order.rider.avatar}
                        alt={`${order.rider.firstName} ${order.rider.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {order.rider.firstName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.rider.firstName} {order.rider.lastName}
                      </p>
                      <p className="text-sm text-gray-500">Delivery Partner</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    {order.rider.phone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium text-gray-900">{order.rider.phone}</span>
                      </div>
                    )}
                    {order.rider.vehicleMakeModel && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Vehicle</span>
                        <span className="font-medium text-gray-900">
                          {order.rider.vehicleMakeModel}
                          {order.rider.vehicleRegistration && ` (${order.rider.vehicleRegistration})`}
                        </span>
                      </div>
                    )}
                    {order.rider.vehicleType && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Vehicle Type</span>
                        <span className="font-medium text-gray-900 capitalize">{order.rider.vehicleType}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No rider assigned yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
