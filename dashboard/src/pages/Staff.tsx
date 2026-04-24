import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Shield, UserCog, Check, X, Search, Loader2 } from 'lucide-react';
import { useGetQuery } from '../hooks/mutate/useGetQuery';
import { useQueryMutation } from '../hooks/mutate/useQueryMutation';
import { toast } from 'sonner';

const availablePermissions = [
  { id: 'view_orders', name: 'View Orders', description: 'Can view all system orders' },
  { id: 'manage_orders', name: 'Manage Orders', description: 'Can update order statuses and issue refunds' },
  { id: 'view_users', name: 'View Users', description: 'Can view customer and rider profiles' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can suspend or edit user profiles' },
  { id: 'manage_restaurants', name: 'Manage Restaurants', description: 'Can approve or edit restaurant listings' },
  { id: 'view_financials', name: 'View Financials', description: 'Can view revenue and payouts' },
  { id: 'manage_settings', name: 'System Settings', description: 'Can modify platform settings and fees' },
  { id: 'edit_admins', name: 'Edit Admins', description: 'Can edit admin and staff accounts' },
  { id: 'delete_admins', name: 'Delete Admins', description: 'Can delete admin and staff accounts' },
];

export default function Staff() {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', password: '', adminRoleId: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });

  const { data: rolesRes, isLoading: rolesLoading, refetch: refetchRoles } = useGetQuery<any>({
    url: "/role",
    queryKey: ["roles"],
  });

  const { data: staffRes, isLoading: staffLoading, refetch: refetchStaff } = useGetQuery<any>({
    url: "/staff",
    queryKey: ["staff"],
  });

  const { mutate: createStaff, isLoading: creatingStaff } = useQueryMutation({ url: "/staff", method: "POST" });
  const { mutate: createRole, isLoading: creatingRole } = useQueryMutation({ url: "/role", method: "POST" });
  const { mutate: deleteStaff, isLoading: deletingStaff } = useQueryMutation({ method: "DELETE", url: "/staff" });
  const { mutate: deleteRole, isLoading: deletingRole } = useQueryMutation({ method: "DELETE", url: "/role" });

  const roles = useMemo(() => rolesRes?.data || [], [rolesRes]);
  const staffList = useMemo(() => staffRes?.data || [], [staffRes]);

  const filteredStaff = staffList.filter((s: any) => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStaff = () => {
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email || !staffForm.password || !staffForm.adminRoleId) {
      return toast.error("Please fill in all fields.");
    }
    createStaff(
      { ...staffForm, adminRoleId: parseInt(staffForm.adminRoleId) },
      {
        onSuccess: () => {
          toast.success("Staff created successfully");
          setIsStaffModalOpen(false);
          setStaffForm({ firstName: '', lastName: '', email: '', password: '', adminRoleId: '' });
          refetchStaff();
        }
      }
    );
  };

  const handleCreateRole = () => {
    if (!roleForm.name || roleForm.permissions.length === 0) {
      return toast.error("Please provide a name and at least one permission.");
    }
    createRole(
      roleForm,
      {
        onSuccess: () => {
          toast.success("Role created successfully");
          setIsRoleModalOpen(false);
          setRoleForm({ name: '', description: '', permissions: [] });
          refetchRoles();
        }
      }
    );
  };

  const handleDeleteStaff = (id: number) => {
    if (confirm("Are you sure you want to revoke this staff's access?")) {
      deleteStaff({ updatedUrl: `/staff/${id}` }, {
        onSuccess: () => {
          toast.success("Staff deactivated successfully");
          refetchStaff();
        }
      });
    }
  };

  const handleDeleteRole = (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRole({ updatedUrl: `/role/${id}` }, {
        onSuccess: () => {
          toast.success("Role deleted successfully");
          refetchRoles();
        }
      });
    }
  };

  const togglePermission = (permId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            Staff & Roles
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage admin accounts, support staff, and system permissions.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'staff' ? (
            <button 
              onClick={() => setIsStaffModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Staff
            </button>
          ) : (
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Role
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'staff' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Staff Directory
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'roles' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {staffLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStaff.map((staff: any) => (
                        <tr key={staff.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold uppercase">
                                  {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{staff.firstName} {staff.lastName}</div>
                                <div className="text-sm text-gray-500">{staff.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {staff.role || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center text-sm text-gray-500 capitalize">
                              <span className={`h-2 w-2 rounded-full mr-2 ${staff.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                              {staff.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(staff.lastActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleDeleteStaff(staff.id)}
                              disabled={deletingStaff}
                              className="text-red-600 hover:text-red-900" title="Revoke Access"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              {rolesLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {roles.map((role: any) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-5 hover:border-orange-200 transition-colors bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {role.name}
                            {role.isSystem && (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Protected</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {!role.isSystem && (
                            <button 
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={deletingRole}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-gray-50 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Permissions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                          {availablePermissions.map(permission => {
                            const hasPermission = (role.permissions || []).includes(permission.id);
                            return (
                              <div key={permission.id} className="flex items-start">
                                <div className={`mt-0.5 mr-2 rounded-full p-0.5 ${hasPermission ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                  {hasPermission ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                </div>
                                <div>
                                  <span className={`text-sm ${hasPermission ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {permission.name}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Add New Staff Member</h2>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={staffForm.firstName} onChange={(e) => setStaffForm({...staffForm, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="John" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={staffForm.lastName} onChange={(e) => setStaffForm({...staffForm, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input type="password" value={staffForm.password} onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="********" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <select value={staffForm.adminRoleId} onChange={(e) => setStaffForm({...staffForm, adminRoleId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="">Select a role...</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateStaff}
                disabled={creatingStaff}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {creatingStaff ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Create Custom Role</h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input type="text" value={roleForm.name} onChange={(e) => setRoleForm({...roleForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g. Finance Manager" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={roleForm.description} onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Brief description of this role" />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-3">Select Permissions</label>
                <div className="space-y-3">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          checked={roleForm.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                        <span className="text-xs text-gray-500">{permission.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateRole}
                disabled={creatingRole}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {creatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

