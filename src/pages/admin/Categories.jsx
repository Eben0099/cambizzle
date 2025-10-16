import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import adminService from "@/services/adminService";

import { Switch } from "@/components/ui/Switch"; // Corrected import with proper casing

const Categories = () => {
  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_path: '',
    display_order: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Charger les catégories
  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCategories(currentPage, 20);
      
      if (response.status === 'success') {
        setCategories(response.data.categories);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des catégories');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Créer une catégorie
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await adminService.createCategory(formData);
      
      if (response.status === 'success') {
        setShowCreateModal(false);
        setFormData({ name: '', slug: '', icon_path: '', display_order: 1 });
        fetchCategories();
        alert('Catégorie créée avec succès !');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la création de la catégorie');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon_path: category.iconPath || '',
      display_order: category.displayOrder || 1
    });
    setShowEditModal(true);
  };

  // Mettre à jour une catégorie
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    try {
      setSubmitting(true);
      const response = await adminService.updateCategory(selectedCategory.id, formData);
      
      if (response.status === 'success') {
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({ name: '', slug: '', icon_path: '', display_order: 1 });
        fetchCategories();
        alert('Catégorie mise à jour avec succès !');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour de la catégorie');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Ouvrir le dialog de suppression
  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  // Supprimer une catégorie
  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      setSubmitting(true);
      const response = await adminService.deleteCategory(selectedCategory.id);
      
      if (response.status === 'success') {
        setShowDeleteDialog(false);
        setSelectedCategory(null);
        fetchCategories();
        alert('Catégorie supprimée avec succès !');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression de la catégorie');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

return (
  <div className="space-y-8">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {pagination?.total || 0} total categories
        </p>
      </div>
      <Button 
        onClick={() => setShowCreateModal(true)}
        className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Category
      </Button>
    </div>

    {/* Error Message */}
    {error && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    )}

    {/* Categories List - Enhanced Cards */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No categories found</p>
                  <p className="text-sm mt-1">Create your first category to get started</p>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {category.displayOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {category.iconPath ? (
                      <div className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {category.iconPath}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No icon</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm"
                        className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-3 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-3 py-2 rounded-lg font-medium transition-colors"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                size="sm"
                className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>


    {/* Create Category Modal - Enhanced */}
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#D6BA69]" />
            Create New Category
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-6 space-y-6">
          <form onSubmit={handleCreate}>
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-[#D6BA69]">*</span>
                Category Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Electronics"
                required
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-[#D6BA69]">*</span>
                Slug (URL-friendly)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">/</span>
                </div>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="electronics"
                  required
                  className="pl-8 border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used in URLs - lowercase, no spaces, use hyphens
              </p>
            </div>

            {/* Icon Path */}
            <div className="space-y-2">
              <Label htmlFor="icon_path" className="text-sm font-semibold text-gray-700">
                Icon Path
              </Label>
              <Input
                id="icon_path"
                name="icon_path"
                value={formData.icon_path}
                onChange={handleInputChange}
                placeholder="e.g. icons/electronics.svg"
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
              />
              <p className="text-xs text-gray-500">
                Path to SVG/PNG icon file (optional)
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-sm font-semibold text-gray-700">
                Display Order
              </Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
                placeholder="1"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first (optional)
              </p>
            </div>

            {/* Status Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Status
              </Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Make category active on creation</span>
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-[#D6BA69]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-white border border-black text-black hover:bg-gray-50 rounded-lg py-3 font-medium transition-colors"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                disabled={submitting || !formData.name || !formData.slug}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Category Modal - Enhanced */}
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit className="h-5 w-5 text-[#D6BA69]" />
            Edit Category
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-6 space-y-6">
          <form onSubmit={handleUpdate}>
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-[#D6BA69]">*</span>
                Category Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Electronics"
                required
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="edit-slug" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-[#D6BA69]">*</span>
                Slug (URL-friendly)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">/</span>
                </div>
                <Input
                  id="edit-slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="electronics"
                  required
                  className="pl-8 border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used in URLs - lowercase, no spaces, use hyphens
              </p>
            </div>

            {/* Icon Path */}
            <div className="space-y-2">
              <Label htmlFor="edit-icon_path" className="text-sm font-semibold text-gray-700">
                Icon Path
              </Label>
              <Input
                id="edit-icon_path"
                name="icon_path"
                value={formData.icon_path}
                onChange={handleInputChange}
                placeholder="e.g. icons/electronics.svg"
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
              />
              <p className="text-xs text-gray-500">
                Path to SVG/PNG icon file (optional)
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="edit-display_order" className="text-sm font-semibold text-gray-700">
                Display Order
              </Label>
              <Input
                id="edit-display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                className="border-gray-300 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg py-3 px-4 text-sm bg-white"
                placeholder="1"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first (optional)
              </p>
            </div>

            {/* Status Toggle - Added */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Status
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Make category active</span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-[#D6BA69]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-white border border-black text-black hover:bg-gray-50 rounded-lg py-3 font-medium transition-colors"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                disabled={submitting || !formData.name || !formData.slug}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Category'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The category "<strong>{selectedCategory?.name}</strong>" will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-white border-black text-black hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
};

export default Categories;