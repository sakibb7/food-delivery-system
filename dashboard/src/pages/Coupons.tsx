import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Tag,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  Pencil,
  Power,
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
import { useCurrency } from "../hooks/useCurrency";
import { toast } from "sonner";

interface Coupon {
  id: number;
  code: string;
  type: string;
  discountValue: string;
  maxDiscount: string | null;
  minPurchase: string | null;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type FilterTab = "all" | "active" | "inactive" | "expired";

function getCouponStatus(coupon: Coupon): { label: string; variant: "success" | "warning" | "error" | "default" } {
  const isExpired = new Date(coupon.expiryDate) <= new Date();
  const isExhausted = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  if (isExpired) return { label: "Expired", variant: "warning" };
  if (isExhausted) return { label: "Exhausted", variant: "default" };
  if (!coupon.isActive) return { label: "Inactive", variant: "error" };
  return { label: "Active", variant: "success" };
}

export default function Coupons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const { currencySymbol } = useCurrency();

  const {
    data: couponsData,
    isLoading: couponsLoading,
    refetch,
  } = useGetQuery<{ coupons: Coupon[] }>({
    url: "/coupon",
    queryKey: ["admin-coupons"],
    isPublic: false,
  });

  const { mutate: createCoupon, isLoading: creating } = useQueryMutation({
    url: "/coupon",
    method: "POST",
  });

  const { mutate: updateCoupon, isLoading: updating } = useQueryMutation({
    url: "/coupon",
    method: "PATCH",
  });

  const { mutate: deleteCoupon, isLoading: deleting } = useQueryMutation({
    url: "/coupon",
    method: "DELETE",
  });

  const { mutate: toggleCoupon } = useQueryMutation({
    url: "/coupon",
    method: "PATCH",
  });

  const coupons = couponsData?.coupons ?? [];

  const filteredCoupons = useMemo(() => {
    let filtered = coupons;

    // Apply tab filter
    const now = new Date();
    switch (activeTab) {
      case "active":
        filtered = filtered.filter(
          (c) =>
            c.isActive &&
            new Date(c.expiryDate) > now &&
            (c.usageLimit === null || c.usedCount < c.usageLimit)
        );
        break;
      case "inactive":
        filtered = filtered.filter((c) => !c.isActive);
        break;
      case "expired":
        filtered = filtered.filter(
          (c) =>
            new Date(c.expiryDate) <= now ||
            (c.usageLimit !== null && c.usedCount >= c.usageLimit)
        );
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => c.code.toLowerCase().includes(q));
    }
    return filtered;
  }, [coupons, searchQuery, activeTab]);

  const tabCounts = useMemo(() => {
    const now = new Date();
    return {
      all: coupons.length,
      active: coupons.filter(
        (c) =>
          c.isActive &&
          new Date(c.expiryDate) > now &&
          (c.usageLimit === null || c.usedCount < c.usageLimit)
      ).length,
      inactive: coupons.filter((c) => !c.isActive).length,
      expired: coupons.filter(
        (c) =>
          new Date(c.expiryDate) <= now ||
          (c.usageLimit !== null && c.usedCount >= c.usageLimit)
      ).length,
    };
  }, [coupons]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      code: code.toUpperCase(),
      type,
      discountValue: parseFloat(discountValue),
      expiryDate: new Date(expiryDate).toISOString(),
    };

    if (maxDiscount) payload.maxDiscount = parseFloat(maxDiscount);
    if (minPurchase) payload.minPurchase = parseFloat(minPurchase);
    if (usageLimit) payload.usageLimit = parseInt(usageLimit, 10);

    createCoupon(payload, {
      onSuccess: () => {
        toast.success("Coupon created successfully");
        setIsModalOpen(false);
        resetForm();
        refetch();
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    const payload: any = {
      updatedUrl: `/coupon/${editingCoupon.id}`,
      code: code.toUpperCase(),
      type,
      discountValue: parseFloat(discountValue),
      expiryDate: new Date(expiryDate).toISOString(),
    };

    if (maxDiscount) payload.maxDiscount = parseFloat(maxDiscount);
    else payload.maxDiscount = null;
    if (minPurchase) payload.minPurchase = parseFloat(minPurchase);
    else payload.minPurchase = null;
    if (usageLimit) payload.usageLimit = parseInt(usageLimit, 10);
    else payload.usageLimit = null;

    updateCoupon(payload, {
      onSuccess: () => {
        toast.success("Coupon updated successfully");
        setEditingCoupon(null);
        resetForm();
        refetch();
      },
    });
  };

  const handleToggle = (coupon: Coupon) => {
    toggleCoupon(
      { updatedUrl: `/coupon/${coupon.id}/toggle` },
      {
        onSuccess: () => {
          toast.success(
            `Coupon ${coupon.isActive ? "deactivated" : "activated"} successfully`
          );
          refetch();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;

    deleteCoupon(
      { updatedUrl: `/coupon/${deleteConfirm}` },
      {
        onSuccess: () => {
          toast.success("Coupon deleted successfully");
          setDeleteConfirm(null);
          refetch();
        },
      }
    );
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setDiscountValue(coupon.discountValue);
    setMaxDiscount(coupon.maxDiscount || "");
    setMinPurchase(coupon.minPurchase || "");
    setExpiryDate(
      new Date(coupon.expiryDate).toISOString().slice(0, 16)
    );
    setUsageLimit(coupon.usageLimit?.toString() || "");
  };

  const resetForm = () => {
    setCode("");
    setType("percentage");
    setDiscountValue("");
    setMaxDiscount("");
    setMinPurchase("");
    setExpiryDate("");
    setUsageLimit("");
    setEditingCoupon(null);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "expired", label: "Expired" },
  ];

  const isFormOpen = isModalOpen || editingCoupon !== null;
  const isFormSubmitting = creating || updating;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${
                activeTab === tab.key ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <span className="text-xs text-gray-400">
            {filteredCoupons.length} result
            {filteredCoupons.length !== 1 ? "s" : ""}
          </span>
        </div>

        {couponsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex items-center justify-center py-20 flex-col gap-3 text-gray-400">
            <Tag className="h-12 w-12" />
            <p className="text-sm">No coupons found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Purchase</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md tracking-wider">
                        {coupon.code}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{coupon.type}</TableCell>
                    <TableCell>
                      {coupon.type === "percentage" ? (
                        <>
                          {coupon.discountValue}%
                          {coupon.maxDiscount && (
                            <span className="text-gray-400 text-xs ml-1">
                              (Max: {currencySymbol}{coupon.maxDiscount})
                            </span>
                          )}
                        </>
                      ) : (
                        <>{currencySymbol}{coupon.discountValue}</>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.minPurchase ? (
                        <span>{currencySymbol}{coupon.minPurchase}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={
                        coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit
                          ? "text-red-600 font-medium"
                          : ""
                      }>
                        {coupon.usedCount}
                      </span>
                      {" / "}
                      {coupon.usageLimit || "∞"}
                    </TableCell>
                    <TableCell>
                      <span className={
                        new Date(coupon.expiryDate) <= new Date()
                          ? "text-red-600"
                          : "text-gray-700"
                      }>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(coupon)}
                          className={`p-1.5 rounded-md transition-colors ${
                            coupon.isActive
                              ? "hover:bg-amber-50 hover:text-amber-600 text-gray-400"
                              : "hover:bg-green-50 hover:text-green-600 text-gray-400"
                          }`}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-gray-400"
                          title="Edit Coupon"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(coupon.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              setEditingCoupon(null);
              resetForm();
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingCoupon(null);
                resetForm();
              }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>
              <form
                onSubmit={editingCoupon ? handleEdit : handleCreate}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                    placeholder="e.g. SUMMER50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {type === "percentage" ? "Discount %" : "Discount Amount"}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step={type === "percentage" ? "1" : "0.01"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {type === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Amount (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Purchase (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isFormSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isFormSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Delete Coupon
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Are you sure you want to delete this coupon? This action cannot
                be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
