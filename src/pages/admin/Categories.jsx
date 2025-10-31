import { useState, useEffect } from "react";
import { SERVER_BASE_URL } from "../../config/api";
import { API_BASE_URL } from "../../config/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import adminService from "@/services/adminService";
import { useToast } from "@/components/ui/use-toast";

const Categories = () => {
  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    display_order: 1,
    is_active: true,
  });
  const [iconFile, setIconFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCategories();
      if (response.status === "success") {
        setCategories(response.data.categories || []);
      } else {
        throw new Error(response.message || "Failed to load categories.");
      }
    } catch (err) {
      setError(err.message || "Error loading categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setIconFile(e.target.files[0] || null);
  };

  // CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('name', formData.name);
  // slug supprimé, généré côté backend
      form.append('is_active', formData.is_active ? '1' : '0');
      form.append('display_order', formData.display_order);
      if (iconFile) form.append('icon', iconFile);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/referentials/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json();
      if (data.status === "success") {
        setShowCreateModal(false);
        setFormData({
          name: "",
          display_order: 1,
          is_active: true,
        });
        setIconFile(null);
        fetchCategories();
        toast({
          description: "Category created successfully.",
        });
      } else {
        throw new Error(data.message || "Error creating category.");
      }
    } catch (err) {
      toast({
        description: err.message || "Error creating category.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN EDIT
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      display_order: category.displayOrder || 1,
      is_active: category.isActive,
    });
    setShowEditModal(true);
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('name', formData.name);
      // slug supprimé, généré côté backend
      form.append('is_active', formData.is_active ? '1' : '0');
      form.append('display_order', formData.display_order);
      if (iconFile) form.append('icon', iconFile);
      // Log FormData content
      for (let pair of form.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/referentials/categories/${selectedCategory.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json();
      if (data.status === "success") {
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({
          name: "",
          display_order: 1,
          is_active: true,
        });
        setIconFile(null);
        fetchCategories();
        toast({
          description: "Category updated successfully.",
        });
      }
    } catch (err) {
      toast({
        description: err.message || "Error updating category.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      setSubmitting(true);
      const response = await adminService.deleteCategory(selectedCategory.id);
      if (response.status === "success") {
        setShowDeleteDialog(false);
        setSelectedCategory(null);
        fetchCategories();
        toast({
          description: "Category deleted successfully.",
        });
      }
    } catch (err) {
      toast({
        description: err.message || "Error deleting category.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Tri alphabétique des catégories
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
  // Pagination
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && !categories.length) {
    return <Loader text="Loading categories..." className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Category Management
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {categories.length} categories
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg shadow-sm flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900">Category List</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Order
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Name
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Slug
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Icon
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-base font-medium">No categories found</p>
                    <p className="text-xs mt-1">
                      Create your first category to get started
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-4 py-3">
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        {category.displayOrder}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                      {category.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-600">
                      {category.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {category.iconPath ? (
                        <img
                          src={category.iconPath.startsWith('http') ? category.iconPath : `${SERVER_BASE_URL}${category.iconPath}`}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded-md border"
                          style={{ background: '#f9fafb' }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No icon</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        className={
                          category.isActive
                            ? "bg-green-100 text-green-800 text-xs"
                            : "bg-red-100 text-red-800 text-xs"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
              <span className="text-xs text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
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
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#D6BA69]" />
              New Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Electronics"
                required
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
            </div>
            {/* Slug field removed, now generated by backend */}

            <div>
              <Label htmlFor="icon-edit" className="text-sm font-medium text-gray-700">
                Icon (image)
              </Label>
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
              <Label htmlFor="icon" className="text-sm font-medium text-gray-700">
                Icon (image)
              </Label>
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
              <Label
                htmlFor="display_order"
                className="text-sm font-medium text-gray-700"
              >
                Display Order
              </Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                placeholder="1"
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Smaller numbers appear first (optional)
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                <span className="text-xs text-gray-600">
                  Enable this category
                </span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
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
                disabled={submitting || !formData.name || !formData.slug}
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

      {/* EDIT MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#D6BA69]" />
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
              <Label
                htmlFor="display_order"
                className="text-sm font-medium text-gray-700"
              >
                Display Order
              </Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mt-1">
                <span className="text-xs text-gray-600">
                  Enable this category
                </span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
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
                disabled={submitting}
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

      {/* DELETE DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white rounded-xl border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              This action cannot be undone. Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedCategory?.name}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3">
            <AlertDialogCancel className="bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50"
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

export default Categories;
