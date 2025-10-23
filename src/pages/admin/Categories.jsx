import { useState, useEffect } from "react";
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
    icon_path: "",
    display_order: 1,
    is_active: true,
  });
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await adminService.createCategory(formData);
      if (response.status === "success") {
        setShowCreateModal(false);
        setFormData({
          name: "",
          slug: "",
          icon_path: "",
          display_order: 1,
          is_active: true,
        });
        fetchCategories();
        toast({
          description: "Category created successfully.",
        });
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
      slug: category.slug,
      icon_path: category.iconPath || "",
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
      const response = await adminService.updateCategory(selectedCategory.id, formData);
      if (response.status === "success") {
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({
          name: "",
          slug: "",
          icon_path: "",
          display_order: 1,
          is_active: true,
        });
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

  // Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
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
                        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {category.iconPath}
                        </span>
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
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  /
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="electronics"
                  required
                  className="h-9 pl-8 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used in URLs - lowercase, no spaces, use hyphens.
              </p>
            </div>
            <div>
              <Label
                htmlFor="icon_path"
                className="text-sm font-medium text-gray-700"
              >
                Icon Path
              </Label>
              <Input
                id="icon_path"
                name="icon_path"
                value={formData.icon_path}
                onChange={handleInputChange}
                placeholder="e.g. icons/electronics.svg"
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Path to SVG/PNG file (optional)
              </p>
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
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
            </div>
            <div>
              <Label
                htmlFor="icon_path"
                className="text-sm font-medium text-gray-700"
              >
                Icon Path
              </Label>
              <Input
                id="icon_path"
                name="icon_path"
                value={formData.icon_path}
                onChange={handleInputChange}
                className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
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
