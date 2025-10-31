// src/pages/admin/PromotionPackAdmin.jsx
import { useEffect, useState } from 'react';
import promotionPackService from '../../services/promotionPackService';
import {
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const initialForm = {
  name: '',
  description: '',
  duration_days: '',
  price: '',
  is_active: true,
};

export default function PromotionPackAdmin() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Fetch all packs
  useEffect(() => {
    fetchPacks();
  }, [refresh]);

  const fetchPacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionPackService.getAll();
      const data = response.data || response;
      setPacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load promotion packs');
    } finally {
      setLoading(false);
    }
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Edit pack
  const handleEdit = (pack) => {
    setForm({
      name: pack.name || '',
      description: pack.description || '',
      duration_days: String(pack.duration_days ?? pack.durationDays ?? ''),
      price: String(pack.price ?? ''),
      is_active: Boolean(pack.is_active ?? pack.isActive),
    });
    setEditingId(String(pack.id));
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  // Delete pack
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;
    setLoading(true);
    setError(null);
    try {
      await promotionPackService.delete(id);
      setMessage('Pack deleted successfully');
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || 'Failed to delete pack');
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration_days: Number(form.duration_days),
      price: Number(form.price),
      is_active: form.is_active ? 1 : 0,
    };

    try {
      if (editingId) {
        await promotionPackService.update(editingId, payload);
        setMessage('Pack updated successfully');
      } else {
        await promotionPackService.create(payload);
        setMessage('Pack created successfully');
      }
      closeForm();
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || 'Failed to save pack');
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(initialForm);
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  // Filter packs
  const filteredPacks = packs.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Manage Promotion Packs
              </h1>
              <p className="text-gray-600 mt-1">Create, edit, and delete boost packages</p>
            </div>
            <button
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setShowForm(true);
                setMessage(null);
                setError(null);
              }}
              className="flex items-center gap-2 bg-[#D6BA69] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#c9a63a] transition-all"
            >
              <Plus className="w-5 h-5" />
              New Pack
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-center">
            <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && !packs.length && (
          <Loader text="Loading packs..." />
        )}

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPacks.map((pack) => {
                const isActive = pack.is_active ?? pack.isActive;
                const duration = pack.duration_days ?? pack.durationDays;
                return (
                  <tr key={pack.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pack.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{pack.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{duration} day{duration !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{pack.price} FCFA</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(pack)}
                          className="bg-[#D6BA69] text-black px-2 py-1 rounded hover:bg-[#c9a63a] transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(pack.id))}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPacks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No packs found matching your search.
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredPacks.map((pack) => {
            const isActive = pack.is_active ?? pack.isActive;
            const duration = pack.duration_days ?? pack.durationDays;
            return (
              <div key={pack.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{pack.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {pack.description && <p className="text-sm text-gray-600 mb-3">{pack.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-medium">{pack.price} FCFA</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(pack)}
                    className="flex items-center gap-1 bg-[#D6BA69] text-black font-medium text-sm px-2 py-1 rounded hover:bg-[#c9a63a]"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(String(pack.id))}
                    className="flex items-center gap-1 bg-red-600 text-white font-medium text-sm px-2 py-1 rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filteredPacks.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
              No packs found.
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Edit Pack' : 'Create New Pack'}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                      <input
                        type="number"
                        name="duration_days"
                        value={form.duration_days}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (FCFA)</label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={form.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                      {form.is_active ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <ToggleRight className="w-5 h-5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <ToggleLeft className="w-5 h-5" /> Inactive
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 bg-[#D6BA69] text-black font-medium rounded-lg hover:bg-[#c9a63a] transition disabled:opacity-50"
                    >
                      {loading ? (
                          <Loader className="w-6 h-6" text="Saving..." />
                        ) : (
                          <>{editingId ? 'Update' : 'Create'}</>
                        )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}