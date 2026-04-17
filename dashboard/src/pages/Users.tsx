import { useState, useMemo } from "react";
import {
  Search,
  Ban,
  Users as UsersIcon,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
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

interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  status: string | null;
  provider: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type ConfirmAction = {
  type: "ban" | "unban";
  user: User;
} | null;

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Fetch all users for admin
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch,
  } = useGetQuery<{ users: User[] }>({
    url: "/user/admin/all",
    queryKey: ["admin-users"],
  });

  // Ban/unban mutation
  const { mutate: toggleBan, isLoading: toggling } = useQueryMutation({
    url: "/user",
    method: "PATCH",
  });

  const users = usersData?.users ?? [];

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const banned = users.filter((u) => u.status === "banned").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, active, banned, admins };
  }, [users]);

  // Filtered & searched users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [users, statusFilter, roleFilter, searchQuery]);

  // Action handlers
  const handleBan = (user: User) => {
    setConfirmAction({ type: "ban", user });
  };

  const handleUnban = (user: User) => {
    setConfirmAction({ type: "unban", user });
  };

  const executeAction = () => {
    if (!confirmAction) return;

    const { type, user } = confirmAction;

    toggleBan(
      { updatedUrl: `/user/${user.id}/ban` },
      {
        onSuccess: () => {
          toast.success(
            type === "ban"
              ? `"${user.firstName} ${user.lastName}" has been banned.`
              : `"${user.firstName} ${user.lastName}" has been unbanned.`
          );
          setConfirmAction(null);
          refetch();
        },
      }
    );
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "banned":
        return <Badge variant="error">Banned</Badge>;
      case "inactive":
        return <Badge variant="warning">Inactive</Badge>;
      default:
        return <Badge variant="warning">{status ?? "Unknown"}</Badge>;
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        );
      case "restaurant":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700">
            Restaurant
          </span>
        );
      case "rider":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
            Rider
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-700">
            Customer
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Users Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all registered users across the platform.
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
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">
                  Total Users
                </p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <UsersIcon className="h-6 w-6" />
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
                <p className="text-green-100 text-sm font-medium">
                  Active Users
                </p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <UserCheck className="h-6 w-6" />
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
                <p className="text-red-100 text-sm font-medium">
                  Banned Users
                </p>
                <p className="text-3xl font-bold mt-1">{stats.banned}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <UserX className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="border-none relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
          }}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold mt-1">{stats.admins}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
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
              id="search-users"
              type="text"
              placeholder="Search by name, email, phone..."
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
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
              <option value="restaurant">Restaurant</option>
              <option value="rider">Rider</option>
            </select>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {filteredUsers.length} result
              {filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <UsersIcon className="h-12 w-12" />
              <p className="text-sm">
                {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                  ? "No users match your filters."
                  : "No users found."}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* User Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          user.firstName.charAt(0) + user.lastName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>{getRoleBadge(user.role)}</TableCell>

                  {/* Provider */}
                  <TableCell>
                    <span className="text-sm text-gray-600 capitalize">
                      {user.provider || "local"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(user.status)}</TableCell>

                  {/* Joined */}
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Don't show ban for admin users */}
                      {user.role !== "admin" && (
                        <>
                          {user.status === "banned" ? (
                            <button
                              id={`unban-${user.id}`}
                              onClick={() => handleUnban(user)}
                              className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors text-gray-400"
                              title="Unban User"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              id={`ban-${user.id}`}
                              onClick={() => handleBan(user)}
                              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400"
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
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
            onClick={() => !toggling && setConfirmAction(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={() => !toggling && setConfirmAction(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div
                className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${
                  confirmAction.type === "ban" ? "bg-red-50" : "bg-green-50"
                }`}
              >
                {confirmAction.type === "ban" ? (
                  <ShieldOff className="h-7 w-7 text-red-500" />
                ) : (
                  <CheckCircle className="h-7 w-7 text-green-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {confirmAction.type === "ban" ? "Ban User" : "Unban User"}
              </h3>

              <p className="text-sm text-gray-500 text-center mt-2">
                {confirmAction.type === "ban" ? (
                  <>
                    Are you sure you want to ban{" "}
                    <strong className="text-gray-700">
                      {confirmAction.user.firstName}{" "}
                      {confirmAction.user.lastName}
                    </strong>
                    ? They will no longer be able to log in or use the platform.
                  </>
                ) : (
                  <>
                    Are you sure you want to unban{" "}
                    <strong className="text-gray-700">
                      {confirmAction.user.firstName}{" "}
                      {confirmAction.user.lastName}
                    </strong>
                    ? They will regain access to the platform.
                  </>
                )}
              </p>

              {/* User info summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                    {confirmAction.user.firstName.charAt(0)}
                    {confirmAction.user.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {confirmAction.user.firstName}{" "}
                      {confirmAction.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {confirmAction.user.email} • {confirmAction.user.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={toggling}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={toggling}
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmAction.type === "ban"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmAction.type === "ban" ? "Ban User" : "Unban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
