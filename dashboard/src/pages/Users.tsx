import { Search, Filter, Edit, Trash2, Ban } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

const USERS = [
  { id: 1, name: "Admin Manager", email: "admin@tomato.com", role: "Admin", status: "Active", joined: "Jan 12, 2026" },
  { id: 2, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", joined: "Feb 05, 2026" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "Customer", status: "Suspended", joined: "Feb 10, 2026" },
  { id: 4, name: "Bob Smith", email: "bob.rider@example.com", role: "Rider", status: "Active", joined: "Mar 01, 2026" },
  { id: 5, name: "Pizza Hut Owner", email: "owner@pizzahut.com", role: "Restaurant", status: "Active", joined: "Mar 15, 2026" },
];

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered users across the platform.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Add User
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {USERS.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{user.role}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "Active" ? "success" : "error"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{user.joined}</span>
                </TableCell>
                <TableCell className="text-right text-gray-500">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    {user.status === "Active" ? (
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-orange-600 transition-colors" title="Suspend">
                        <Ban className="h-4 w-4" />
                      </button>
                    ) : (
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-green-600 transition-colors" title="Activate">
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1 to 5 of 1204 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
