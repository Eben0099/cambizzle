// Subcategories.jsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, SERVER_BASE_URL } from "../../config/api";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const Subcategories = () => {
  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI & interactions
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals & selection
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    slug: "",
    display_order: 1,
    is_active: true,
  });
  const [iconFile, setIconFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Toasts
  const { toast } = useToast();

  // Fetch categories + stats on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/categories/stats`);
      if (response.data?.status === "success") {
        const data = response.data.data || [];
        setCategories(data);

        // Expand all categories by default (same behavior as original)
        const initialExpanded = {};
        data.forEach((c) => {
          initialExpanded[c.id] = true;
        });
        setExpandedCategories(initialExpanded);
      } else {
        throw new Error(response.data?.message || "Failed to load categories");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error loading categories";
      setError(message);
      toast({
        description: message,
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  // Toggle accordion for a category
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Form handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setIconFile(e.target.files[0] || null);
  };

  // CREATE subcategory
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('category_id', formData.category_id);
      form.append('name', formData.name);
  // slug supprimé, généré côté backend
      form.append('is_active', formData.is_active ? '1' : '0');
      form.append('display_order', formData.display_order);
      if (iconFile) form.append('icon', iconFile);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/referentials/subcategories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json();
      if (data.status === "success") {
        setShowCreateModal(false);
        setFormData({
          category_id: "",
          name: "",
          display_order: 1,
          is_active: true,
        });
        setIconFile(null);
        await fetchCategories();
        toast({ description: "Subcategory created successfully." });
      } else {
        throw new Error(data.message || "Failed to create subcategory");
      }
    } catch (err) {
      const message = err.message || "Error creating subcategory";
      toast({ description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN edit modal
  const openEditModal = (subcategory, categoryId) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      category_id: categoryId.toString(),
      name: subcategory.name,
      display_order: subcategory.displayOrder || 1,
      is_active: subcategory.isActive,
    });
    setShowEditModal(true);
  };

  // UPDATE subcategory
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSubcategory) return;
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('category_id', formData.category_id);
      form.append('name', formData.name);
  // slug supprimé, généré côté backend
      form.append('is_active', formData.is_active ? '1' : '0');
      form.append('display_order', formData.display_order);
      if (iconFile) form.append('icon', iconFile);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/referentials/subcategories/${selectedSubcategory.id}`, {
        method: 'POST', // POST pour upload fichier
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json();
      if (data.status === "success") {
        setShowEditModal(false);
        setSelectedSubcategory(null);
        setFormData({
          category_id: "",
          name: "",
          display_order: 1,
          is_active: true,
        });
        setIconFile(null);
        await fetchCategories();
        toast({ description: "Subcategory updated successfully." });
      } else {
        throw new Error(data.message || "Failed to update subcategory");
      }
    } catch (err) {
      const message = err.message || "Error updating subcategory";
      toast({ description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN delete dialog (prevent delete if has ads)
  const openDeleteDialog = (subcategory) => {
    if (subcategory.totalAds > 0) {
      toast({
        description: "Cannot delete this subcategory because it contains ads.",
        variant: "destructive",
      });
      return;
    }
    setSelectedSubcategory(subcategory);
    setShowDeleteDialog(true);
  };

  // DELETE subcategory
  const handleDelete = async () => {
    if (!selectedSubcategory) return;
    try {
      setSubmitting(true);
      const response = await axios.delete(
        `${API_BASE_URL}/admin/referentials/subcategories/${selectedSubcategory.id}`
      );

      if (response.data?.status === "success") {
        setShowDeleteDialog(false);
        setSelectedSubcategory(null);
        await fetchCategories();
        toast({ description: "Subcategory deleted successfully." });
      } else {
        throw new Error(response.data?.message || "Failed to delete subcategory");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error deleting subcategory";
      toast({ description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Tri alphabétique des catégories
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Filtering
  const filteredCategories = sortedCategories.filter((category) => {
    if (selectedCategoryId !== "all" && category.id.toString() !== selectedCategoryId) {
      return false;
    }
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      (category.subcategories || []).some(
        (sub) =>
          sub.name.toLowerCase().includes(searchLower) ||
          sub.slug.toLowerCase().includes(searchLower)
      )
    );
  });

  // Pagination on filtered categories
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchTerm]);

  if (loading && !categories.length) {
    return (
      <div className="min-h-[360px] flex items-center justify-center">
        <Loader text="Loading subcategories..." className="min-h-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 bg-white py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Subcategory Management</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)} subcategories
          </p>
        </div>

        <Button
          onClick={() => {
            // Pre-select category if one is selected in filter
            setFormData((prev) => ({
              ...prev,
              category_id: selectedCategoryId !== "all" ? selectedCategoryId : prev.category_id,
            }));
            setShowCreateModal(true);
          }}
          className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg shadow-sm flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Subcategory
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] bg-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2 text-[#D6BA69]" />
              Search
            </Label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            />
          </div>
        </div>
      </div>

      {/* Categories accordion */}
      <div className="space-y-3">
        {paginatedCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No categories</h3>
            <p className="text-xs text-gray-500">Adjust filters or create a category</p>
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <Card
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Category header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {category.iconPath ? (
                    <img
                      src={(() => {
                        if (category.iconPath.startsWith('http')) return category.iconPath;
                        return SERVER_BASE_URL.replace(/\/$/, '') + '/' + category.iconPath.replace(/^\//, '');
                      })()}
                      alt={category.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <FolderTree className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={
                          category.isActive
                            ? "bg-green-100 text-green-800 text-xs"
                            : "bg-red-100 text-red-800 text-xs"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-600">{category.totalAds} ads</span>
                      </div>

                      <span className="text-xs text-gray-600">
                        {category.subcategories?.length || 0} subcategories
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, category_id: category.id.toString() }));
                      setShowCreateModal(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>

                  {expandedCategories[category.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Subcategories list with transition */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  expandedCategories[category.id] ? "max-h-[1000px]" : "max-h-0"
                )}
              >
                {expandedCategories[category.id] && (
                  <div className="border-t border-gray-100">
                    {(!category.subcategories || category.subcategories.length === 0) ? (
                      <div className="p-4 text-center text-xs text-gray-500">No subcategories in this category</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {category.subcategories.map((sub) => (
                          <li
                            key={sub.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              {sub.iconPath ? (
                                <img
                                  src={(() => {
                                    if (sub.iconPath.startsWith('http')) return sub.iconPath;
                                    return SERVER_BASE_URL.replace(/\/$/, '') + '/' + sub.iconPath.replace(/^\//, '');
                                  })()}
                                  alt={sub.name}
                                  className="w-8 h-8 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                  <FolderTree className="h-4 w-4 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium text-gray-900">{sub.name}</h4>
                                  <Badge
                                    className={
                                      sub.isActive
                                        ? "bg-green-100 text-green-800 text-xs"
                                        : "bg-red-100 text-red-800 text-xs"
                                    }
                                  >
                                    {sub.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-600 mt-1">Slug: {sub.slug}</p>

                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1 text-gray-500" />
                                    <span>{sub.totalAds} ads</span>
                                  </div>
                                  <div>Order: {sub.displayOrder}</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg"
                                onClick={() => openEditModal(sub, category.id)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                onClick={() => openDeleteDialog(sub)}
                                disabled={sub.totalAds > 0}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || submitting}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-600">Page {currentPage} / {totalPages}</span>
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || submitting}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* CREATE Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#D6BA69]" />
              New Subcategory
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                Parent Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] bg-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Cars"
                required
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
            </div>

            {/* Slug field removed, now generated by backend */}

            <div>
              <Label htmlFor="icon-edit" className="text-sm font-medium text-gray-700">Icon (image)</Label>
              <input
                id="icon-edit"
                name="icon"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              {iconFile && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(iconFile)} alt="Preview" className="h-12 w-12 object-contain rounded" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload an icon image (PNG, JPG, SVG...)</p>
            </div>

            <div>
              <Label htmlFor="icon" className="text-sm font-medium text-gray-700">Icon (image)</Label>
              <input
                id="icon"
                name="icon"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              {iconFile && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(iconFile)} alt="Preview" className="h-12 w-12 object-contain rounded" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload an icon image (PNG, JPG, SVG...)</p>
            </div>

            <div>
              <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">Smaller numbers appear first (optional)</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                <span className="text-xs text-gray-600">Enable this subcategory</span>
                <Switch
                  checked={formData.is_active}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-[#D6BA69]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg disabled:opacity-50"
                disabled={submitting || !formData.name || !formData.category_id}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#D6BA69]" />
              Edit Subcategory
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                Parent Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] bg-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Cars"
                required
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
            </div>

            {/* Slug field removed, now generated by backend */}

            <div>
              <Label htmlFor="icon-edit" className="text-sm font-medium text-gray-700">Icon (image)</Label>
              <input
                id="icon-edit"
                name="icon"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              {iconFile && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(iconFile)} alt="Preview" className="h-12 w-12 object-contain rounded" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload an icon image (PNG, JPG, SVG...)</p>
            </div>

            <div>
              <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">Smaller numbers appear first (optional)</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                <span className="text-xs text-gray-600">Enable this subcategory</span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-[#D6BA69]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg disabled:opacity-50"
                disabled={submitting || !formData.name || !formData.category_id}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              This action cannot be undone. The subcategory{" "}
              <strong>{selectedSubcategory?.name}</strong> will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-2 pt-4 justify-end">
            <AlertDialogCancel
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              disabled={submitting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="h-9 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subcategories;
