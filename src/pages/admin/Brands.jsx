// Brands.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Search as IconSearch, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

/**
 * Brands.jsx
 * - Fully translated to English
 * - Theme: no transparency, accent #D6BA69, subtle shadows
 * - Responsive and mobile-friendly
 * - useState-driven CRUD (mocked, ready for backend)
 * - useToast() for notifications (no icons in toasts)
 */

const initialBrandsMock = [
  { id: 1, name: "Samsung", subcategory: "Phones", adsCount: 145 },
  { id: 2, name: "Apple", subcategory: "Phones", adsCount: 189 },
  { id: 3, name: "Huawei", subcategory: "Phones", adsCount: 67 },
  { id: 4, name: "Toyota", subcategory: "Cars", adsCount: 234 },
  { id: 5, name: "Honda", subcategory: "Cars", adsCount: 156 },
  { id: 6, name: "HP", subcategory: "Computers", adsCount: 89 },
  { id: 7, name: "Dell", subcategory: "Computers", adsCount: 103 },
];

const SUBCATEGORY_OPTIONS = ["Phones", "Computers", "Cars", "Motorcycles"];

const Brands = () => {
  const { toast } = useToast();

  // Data state
  const [brands, setBrands] = useState(initialBrandsMock);
  const [searchTerm, setSearchTerm] = useState("");

  // Create form state
  const [createOpen, setCreateOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", subcategory: "" });
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Delete confirmation state
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Derived filtered list
  const filteredBrands = brands.filter((b) => {
    const q = (searchTerm || "").toLowerCase().trim();
    if (!q) return true;
    return (
      (b.name || "").toLowerCase().includes(q) ||
      (b.subcategory || "").toLowerCase().includes(q)
    );
  });

  // Create
  const handleCreateBrand = async (e) => {
    e?.preventDefault();
    if (!newBrand.name.trim() || !newBrand.subcategory) {
      toast({ description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      // front-end id generation
      const nextId = (brands.reduce((m, x) => Math.max(m, x.id || 0), 0) || 0) + 1;
      const brandToAdd = {
        id: nextId,
        name: newBrand.name.trim(),
        subcategory: newBrand.subcategory,
        adsCount: 0,
      };
      setBrands((prev) => [...prev, brandToAdd]);
      setNewBrand({ name: "", subcategory: "" });
      setCreateOpen(false);
      toast({ description: "Brand added successfully." });
    } catch (err) {
      console.error("Create brand error:", err);
      toast({ description: "Failed to add brand.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (brand) => {
    setEditingBrand({ ...brand });
    setEditOpen(true);
  };

  // Update
  const handleUpdateBrand = async (e) => {
    e?.preventDefault();
    if (!editingBrand) return;
    if (!editingBrand.name?.trim() || !editingBrand.subcategory) {
      toast({ description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      setUpdating(true);
      setBrands((prev) => prev.map((b) => (b.id === editingBrand.id ? { ...editingBrand, name: editingBrand.name.trim() } : b)));
      setEditingBrand(null);
      setEditOpen(false);
      toast({ description: "Brand updated successfully." });
    } catch (err) {
      console.error("Update brand error:", err);
      toast({ description: "Failed to update brand.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  // Confirm delete
  const confirmDelete = (brand) => {
    setDeleteCandidate(brand);
  };

  // Delete
  const handleDeleteBrand = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      setBrands((prev) => prev.filter((b) => b.id !== deleteCandidate.id));
      setDeleteCandidate(null);
      toast({ description: "Brand deleted successfully." });
    } catch (err) {
      console.error("Delete brand error:", err);
      toast({ description: "Failed to delete brand.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brands Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage brands per subcategory</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or subcategory..."
                className="pl-10 h-9 rounded-lg border-gray-200 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* New Brand Button */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg flex items-center gap-2 shadow-sm">
                  <Plus className="h-4 w-4" />
                  New Brand
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Add Brand</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateBrand} className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="brandName">Brand name</Label>
                    <Input
                      id="brandName"
                      value={newBrand.name}
                      onChange={(e) => setNewBrand((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Samsung, Toyota..."
                      className="h-10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="brandSubcat">Subcategory</Label>
                    <Select value={newBrand.subcategory} onValueChange={(v) => setNewBrand((p) => ({ ...p, subcategory: v }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {SUBCATEGORY_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="hover:bg-gray-100">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={creating}>
                      {creating ? (
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
          </div>
        </div>

        {/* Brands Search Card */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="px-4 py-3 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold">Search Brands</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or subcategory..."
                className="pl-10 h-10 rounded-lg border-gray-200 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Brands Table */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="px-4 py-3 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold">Brand List</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Brand</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Subcategory</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Ads</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBrands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-sm font-medium">No brands found</div>
                          <div className="text-xs text-gray-400">Try another search or add a new brand</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrands.map((brand) => (
                      <TableRow key={brand.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="px-4 py-3 font-medium text-gray-900">{brand.name}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge className="bg-gray-100 text-gray-800 text-xs">{brand.subcategory}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600">{brand.adsCount} ads</TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit */}
                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => openEditDialog(brand)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-bold">Edit Brand</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleUpdateBrand} className="space-y-4 p-4">
                                  <div>
                                    <Label>Brand name</Label>
                                    <Input
                                      value={editingBrand?.name || ""}
                                      onChange={(e) => setEditingBrand((p) => ({ ...p, name: e.target.value }))}
                                      className="h-10"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <Label>Subcategory</Label>
                                    <Select value={editingBrand?.subcategory || ""} onValueChange={(v) => setEditingBrand((p) => ({ ...p, subcategory: v }))}>
                                      <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select subcategory" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white">
                                        {SUBCATEGORY_OPTIONS.map((s) => (
                                          <SelectItem key={s} value={s} className="hover:bg-gray-100">
                                            {s}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex gap-2 justify-end pt-2">
                                    <Button type="button" variant="outline" onClick={() => { setEditOpen(false); setEditingBrand(null); }} disabled={updating}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={updating}>
                                      {updating ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        "Save"
                                      )}
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>

                            {/* Delete */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => confirmDelete(brand)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete confirmation modal (simple centered dialog) */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm deletion</h3>
                <p className="text-sm text-gray-600 mt-2">
                  This action cannot be undone. Do you want to delete the brand{" "}
                  <strong>{deleteCandidate.name}</strong>?
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteCandidate(null)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteBrand} className="bg-red-600 hover:bg-red-700 text-white" disabled={deleting}>
                    {deleting ? (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
