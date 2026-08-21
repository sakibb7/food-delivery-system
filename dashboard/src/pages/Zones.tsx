import { useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  X,
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
import ZoneMap from "../components/ZoneMap";
import { ConfirmModal } from "../components/ui/ConfirmModal";

interface Zone {
  id: number;
  name: string;
  description: string | null;
  status: string;
  coordinates: { lat: number, lng: number }[];
  createdAt: string;
  updatedAt: string;
}

export default function Zones() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinates: [] as { lat: number, lng: number }[]
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const { data: zones, isLoading, refetch } = useGetQuery<Zone[]>({
    url: "/zone",
    queryKey: ["zones"],
  });

  const { mutate: createZone, isLoading: isCreating } = useQueryMutation({
    url: "/zone",
    method: "POST",
  });

  const { mutate: updateZone, isLoading: isUpdating } = useQueryMutation({
    url: "/zone",
    method: "PUT",
  });

  const { mutate: deleteZone } = useQueryMutation({
    url: "/zone",
    method: "DELETE",
  });

  const handleOpenModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        description: zone.description || "",
        coordinates: zone.coordinates
      });
    } else {
      setEditingZone(null);
      setFormData({ name: "", description: "", coordinates: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    setFormData({ name: "", description: "", coordinates: [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.coordinates.length < 3) {
      toast.error("Please draw a valid area on the map (at least 3 points)");
      return;
    }

    if (editingZone) {
      updateZone(
        { updatedUrl: `/zone/${editingZone.id}`, ...formData },
        {
          onSuccess: () => {
            toast.success("Zone updated successfully");
            handleCloseModal();
            refetch();
          }
        }
      );
    } else {
      createZone(formData, {
        onSuccess: () => {
          toast.success("Zone created successfully");
          handleCloseModal();
          refetch();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = () => {
    if (deleteConfirm.id !== null) {
      deleteZone(
        { updatedUrl: `/zone/${deleteConfirm.id}` },
        {
          onSuccess: () => {
            toast.success("Zone deleted successfully");
            refetch();
          }
        }
      );
    }
  };

  const filteredZones = zones?.filter(z => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zone Management</h1>
          <p className="text-sm text-gray-500 mt-1">Define and manage business operation areas.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Zone
          </button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MapPin className="h-12 w-12 mb-2" />
            <p>No zones found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{zone.name}</p>
                      <p className="text-xs text-gray-500">{zone.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.status === 'active' ? 'success' : 'warning'}>
                      {zone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{zone.coordinates.length} points</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(zone.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(zone)}
                        className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-md transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingZone ? 'Edit Zone' : 'Add New Zone'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dhaka Central"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Briefly describe this zone..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                    />
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Drawing Guide
                    </h4>
                    <ul className="text-xs text-orange-700 space-y-1 list-disc pl-4">
                      <li>Use the drawing tool on the map to define the area.</li>
                      <li>Click to add points, close the shape to finish.</li>
                      <li>The area should cover the operation boundaries.</li>
                    </ul>
                  </div>
                </div>

                <div className="h-[400px] bg-gray-50 rounded-xl relative">
                  <ZoneMap
                    onPolygonComplete={(coords) => setFormData({ ...formData, coordinates: coords })}
                    initialPolygon={formData.coordinates}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Zone"
        message="Are you sure you want to delete this zone? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        confirmText="Yes, delete"
      />
    </div>
  );
}
