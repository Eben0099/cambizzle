// Brands.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Edit, Trash2, Search as IconSearch, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/ui/Loader";
import adminService from '@/services/adminService';

/**
 * Brands management screen
 * - Integrated with backend API for brands management
 * - Toast notifications via useToast()
 * - Fully responsive, professional design
 * - Theme: primary accent #D6BA69
 *
 * Assume adminService endpoints: getBrands, createBrand, updateBrand, deleteBrand
 */

const Brands = () => {
  const { toast } = useToast();

  // Data state
  const [brandsData, setBrandsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form state
  const emptyForm = {
    id: null,
    name: "",
    subcategory_id: "",
    description: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      // Fetch brands with pagination, but since admin, fetch all
      const res = await adminService.getBrands(1, 1000);
      // Assuming res.data.brands is array of {id, name, subcategoryName, subcategoryId?}
      // But to group, need to group by subcategory
      // If backend doesn't group, group here
      const apiBrands = res?.data?.brands || [];
      const grouped = apiBrands.reduce((acc, b) => {
        const sub = b.subcategoryName || 'Unknown';
        const subId = b.subcategoryId || ''; // Assume available or fetch subcategories separately
        if (!acc[sub]) acc[sub] = { subcategory: { id: subId, name: sub, category_name: '' }, brands: [] }; // category_name unknown
        acc[sub].brands.push({
          id: Number(b.id),
          name: b.name,
          adsCount: b.adsCount || 0,
        });
        return acc;
      }, {});
      setBrandsData(Object.values(grouped));
    } catch (err) {
      toast({ description: 'Failed to load brands.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Unique subcategory options for select (for create/edit)
  const subcategoryOptions = useMemo(() => {
    const subs = brandsData.map((g) => g.subcategory);
    return subs.sort((a, b) => a.name.localeCompare(b.name));
  }, [brandsData]);

  // Filter and search pipeline
  const filteredData = useMemo(() => {
    let data = brandsData.slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((g) =>
        g.subcategory.name.toLowerCase().includes(q) ||
        g.subcategory.category_name.toLowerCase().includes(q) ||
        g.brands.some((b) => b.name.toLowerCase().includes(q))
      );
    }

    // Sort groups by subcategory name
    data.sort((a, b) => a.subcategory.name.localeCompare(b.subcategory.name));

    return data;
  }, [brandsData, search]);

  const totalBrands = useMemo(() => {
    return brandsData.reduce((sum, g) => sum + g.brands.length, 0);
  }, [brandsData]);

  const displayedCount = useMemo(() => {
    return filteredData.reduce((sum, g) => sum + g.brands.length, 0);
  }, [filteredData]);

  // Open create dialog
  const openCreate = () => {
    setForm({ ...emptyForm });
    setCreateOpen(true);
  };

  // Create brand
  const handleCreate = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const brandData = {
        name: form.name.trim(),
        subcategory_id: Number(form.subcategory_id),
        description: form.description,
        is_active: form.is_active ? 1 : 0,
      };
      const response = await adminService.createBrand(brandData);
      console.log("✅ Brand created:", response);
      await loadBrands();
      setCreateOpen(false);
      toast({ description: "Brand created successfully." });
    } catch (err) {
      console.error("❌ Error creating brand:", err);
      toast({ description: "Error creating brand.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog and populate form
  const openEdit = (brand, subcategoryId) => {
    setForm({
      id: brand.id,
      name: brand.name,
      subcategory_id: subcategoryId.toString(),
      description: brand.description || "",
      is_active: brand.isActive !== undefined ? brand.isActive : true,
    });
    setEditOpen(true);
  };

  // Update brand
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (form.id == null) return;
    setSubmitting(true);
    try {
      const brandData = {
        name: form.name.trim(),
        subcategory_id: Number(form.subcategory_id),
        description: form.description,
        is_active: form.is_active ? 1 : 0,
      };
      await adminService.updateBrand(form.id, brandData);
      console.log("✅ Brand updated");
      await loadBrands();
      setEditOpen(false);
      toast({ description: "Brand updated successfully." });
    } catch (err) {
      console.error("❌ Error updating brand:", err);
      toast({ description: "Error updating brand.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete flow
  const confirmDelete = (brand) => {
    setDeleteCandidate(brand);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await adminService.deleteBrand(deleteCandidate.id);
      console.log("✅ Brand deleted");
      await loadBrands();
      setDeleteCandidate(null);
      toast({ description: "Brand deleted successfully." });
    } catch (err) {
      console.error("❌ Error deleting brand:", err);
      toast({ description: "Error deleting brand.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading brands..." />;
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brands Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage brands by subcategory</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 w-full sm:w-64 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Create button */}
            <Button
              onClick={openCreate}
              className="h-9 px-4 bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{totalBrands}</div>
              <div className="text-sm text-gray-600">Total Brands</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{subcategoryOptions.length}</div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{displayedCount}</div>
              <div className="text-sm text-gray-600">Displayed</div>
            </CardContent>
          </Card>
        </div>

        {/* Groups */}
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No brands found</div>
        ) : (
          <Accordion type="single" collapsible className="w-full border border-gray-200 rounded-lg">
            {filteredData.map((group, index) => (
              <AccordionItem value={`item-${index}`} key={group.subcategory.id} className="border-b border-gray-200 last:border-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{group.subcategory.name}</span>
                    <span className="text-sm text-gray-600">{group.subcategory.category_name}</span>
                    <span className="text-sm text-gray-600">- {group.brands.length} brands</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="font-semibold text-gray-900">Name</TableHead>
                        <TableHead className="font-semibold text-gray-900">Ads</TableHead>
                        <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.brands.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            No brands in this subcategory
                          </TableCell>
                        </TableRow>
                      ) : (
                        group.brands.map((brand) => (
                          <TableRow key={brand.id} className="border-gray-200 hover:bg-gray-50">
                            <TableCell className="font-medium">{brand.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800 text-xs">{brand.adsCount} ads</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEdit(brand, group.subcategory.id)}
                                  className="h-7 px-2 border-gray-200 hover:bg-gray-50"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmDelete(brand)}
                                  className="h-7 px-2 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="bg-white max-w-md sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a Brand</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="brandDescription">Description</Label>
                <Input
                  id="brandDescription"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brand description"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="brandActive"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="brandActive">Active</Label>
              </div>
              <div>
                <Label htmlFor="name">Brand name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Samsung, Toyota..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={form.subcategory_id}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, subcategory_id: value }))}
                >
                  <SelectTrigger className="mt-1 h-9 w-full bg-white">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {subcategoryOptions.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} {sub.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D6BA69] hover:bg-[#C5A952]"
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

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-white max-w-md sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="editBrandDescription">Description</Label>
                <Input
                  id="editBrandDescription"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="editBrandActive"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="editBrandActive">Active</Label>
              </div>
              <div>
                <Label htmlFor="edit-name">Brand name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-subcategory">Subcategory</Label>
                <Select
                  value={form.subcategory_id}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, subcategory_id: value }))}
                >
                  <SelectTrigger className="mt-1 h-9 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {subcategoryOptions.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} {sub.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D6BA69] hover:bg-[#C5A952]"
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

        {/* Delete Confirmation Dialog */}
        {deleteCandidate && (
          <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the brand "<strong>{deleteCandidate.name}</strong>"?
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
                  <Button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Brands;