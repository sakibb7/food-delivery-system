import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Truck, CreditCard, ShoppingBag, Clock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";

const dummyOrder = {
  id: "ORD-1234",
  status: "out_for_delivery",
  createdAt: "2026-04-25T14:30:00Z",
  deliveryType: "Express Delivery",
  
  customer: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  },
  
  shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
  
  rider: {
    name: "Michael Smith",
    phone: "+1 (555) 987-6543",
    vehicle: "Honda CB Shine (NY-1234)"
  },
  
  payment: {
    method: "Credit Card (ending in 4242)",
    status: "paid",
    transactionId: "TXN-987654321"
  },
  
  items: [
    { id: 1, name: "Margherita Pizza", quantity: 2, price: 14.99 },
    { id: 2, name: "Garlic Bread", quantity: 1, price: 4.99 },
    { id: 3, name: "Coca Cola", quantity: 2, price: 1.99 }
  ],
  
  summary: {
    subtotal: 38.95,
    tax: 3.50,
    deliveryFee: 2.99,
    discount: 0.00,
    total: 45.44
  }
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <Badge variant="success">Delivered</Badge>;
      case "cancelled": return <Badge variant="error">Cancelled</Badge>;
      case "out_for_delivery": return <Badge variant="info">Out for Delivery</Badge>;
      case "preparing": return <Badge variant="warning">Preparing</Badge>;
      case "pending": return <Badge variant="info">Pending</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Order #{id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(dummyOrder.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(dummyOrder.status)}
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
                {dummyOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${(item.quantity * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Order Summary inside the same card below items */}
            <div className="p-6 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
              <div className="w-full max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${dummyOrder.summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">${dummyOrder.summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">${dummyOrder.summary.deliveryFee.toFixed(2)}</span>
                </div>
                {dummyOrder.summary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-${dummyOrder.summary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600 text-lg">${dummyOrder.summary.total.toFixed(2)}</span>
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
                    <p className="text-sm text-gray-500">Delivery Type</p>
                    <p className="font-medium text-gray-900">{dummyOrder.deliveryType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium text-gray-900 leading-relaxed">{dummyOrder.shippingAddress}</p>
                  </div>
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
                    <p className="font-medium text-gray-900">{dummyOrder.payment.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900">{dummyOrder.payment.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={dummyOrder.payment.status === 'paid' ? 'success' : 'warning'} className="mt-1">
                      {dummyOrder.payment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column - People Details */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <User className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Customer Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    {dummyOrder.customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dummyOrder.customer.name}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{dummyOrder.customer.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{dummyOrder.customer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <Truck className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Rider Details</h3>
              </div>
              {dummyOrder.rider ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {dummyOrder.rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dummyOrder.rider.name}</p>
                      <p className="text-sm text-gray-500">Delivery Partner</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">{dummyOrder.rider.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Vehicle</span>
                      <span className="font-medium text-gray-900">{dummyOrder.rider.vehicle}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200">
                    Contact Rider
                  </button>
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
