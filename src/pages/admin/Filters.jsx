// Filters.jsx
import { useEffect, useMemo, useState } from "react";
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
import {
  Plus,
  Edit,
  Trash2,
  List,
  Search as IconSearch,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/ui/Loader";
import adminService from "@/services/adminService";

/**
 * Filters management screen (ENGLISH)
 * - Integrated with backend API for filters management
 * - Toast notifications via useToast()
 * - Fully responsive, professional design
 * - Theme: primary accent #D6BA69
 *
 * Keep adminService endpoints available: getFilters, createFilter, updateFilter,
 * deleteFilter, createFilterOption, deleteFilterOption
 */

const typeLabel = (type) => {
  const map = {
    select: "Select",
    multiselect: "Multi-select",
    text: "Text",
    number: "Number",
    boolean: "Boolean",
    date: "Date",
  };
  return map[type] || type;
};

const getTypeBadge = (type) => (
  <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
    {typeLabel(type)}
  </Badge>
);

const SORT_OPTIONS = [
  { id: "name_asc", label: "Name ▲" },
  { id: "name_desc", label: "Name ▼" },
  { id: "subcategory_asc", label: "Subcategory ▲" },
  { id: "subcategory_desc", label: "Subcategory ▼" },
];

const Filters = () => {
  const [filtersData, setFiltersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].id);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState("all");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [valuesOpenFor, setValuesOpenFor] = useState(null); // filter object
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form state
  const emptyForm = {
    id: null,
    name: "",
    subcategory_id: "",
    type: "select",
    optionsText: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // Load filters on mount
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFilters();
      // Expecting response.data = [{ subcategory: {...}, filters: [...] }, ...]
      console.log("🔄 Filters loaded:", response);
      setFiltersData(response.data || []);
    } catch (error) {
      console.error("❌ Error loading filters:", error);
      toast({
        title: "Error",
        description: "Unable to load filters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Flattened filters list for table
  const filters = useMemo(() => {
    return filtersData.flatMap((item) =>
      (item.filters || []).map((filter) => ({
        id: filter.id,
        name: filter.name,
        type: filter.type,
        subcategory: item.subcategory.name,
        subcategory_id: item.subcategory.id,
        subcategory_slug: item.subcategory.slug,
        category_name: item.subcategory.category_name,
        options: filter.options || [],
      }))
    );
  }, [filtersData]);

  // Unique subcategory options for select
  const subcategoryOptions = useMemo(() => {
    const subcategories = filtersData.map((item) => item.subcategory);
    const uniqueSubcategories = subcategories.filter(
      (sub, index, self) => index === self.findIndex((s) => s.id === sub.id)
    );
    return uniqueSubcategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [filtersData]);

  // Filter, search and sort pipeline
  const displayed = useMemo(() => {
    let list = filters.slice();

    // subcategory filter
    if (selectedSubcategoryFilter !== "all") {
      list = list.filter((f) => f.subcategory === selectedSubcategoryFilter);
    }

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => {
        if ((f.name || "").toLowerCase().includes(q)) return true;
        if ((f.subcategory || "").toLowerCase().includes(q)) return true;
        if ((f.category_name || "").toLowerCase().includes(q)) return true;
        if ((f.options || []).some((opt) => (opt.value || "").toLowerCase().includes(q))) return true;
        return false;
      });
    }

    // sort
    switch (sortBy) {
      case "name_asc":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "subcategory_asc":
        list.sort((a, b) => (a.subcategory || "").localeCompare(b.subcategory || ""));
        break;
      case "subcategory_desc":
        list.sort((a, b) => (b.subcategory || "").localeCompare(a.subcategory || ""));
        break;
      default:
        break;
    }

    return list;
  }, [filters, search, sortBy, selectedSubcategoryFilter]);

  // Open create dialog
  const openCreate = () => {
    setForm({ ...emptyForm });
    setCreateOpen(true);
  };

  // Create filter (single API call with options)
  const handleCreate = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      // Parse options from textarea
      let options = [];
      if (form.optionsText.trim()) {
        options = form.optionsText
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
          .map((value, index) => ({ value, display_order: index + 1 }));
      }

      // Compose full filter body
      const filterData = {
        subcategory_id: Number(form.subcategory_id),
        name: form.name.trim(),
        type: form.type,
        is_required: false, // Ajoutez la logique si besoin
        display_order: 1, // Peut être modifié selon le besoin
        options,
      };

      const response = await adminService.createFilter(filterData);
      console.log("✅ Filter created:", response);
      await loadFilters();
      setCreateOpen(false);
      toast({ description: "Filter created successfully." });
    } catch (err) {
      console.error("❌ Error creating filter:", err);
      toast({ description: "Error creating filter.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog and populate form
  const openEdit = (filter) => {
    const subcategory = subcategoryOptions.find((sub) => sub.name === filter.subcategory);
    // Harmonise le type pour l'édition (multi-select -> multiselect)
    let type = filter.type;
    if (type === "multi-select") type = "multiselect";
    setForm({
      id: filter.id,
      name: filter.name,
      subcategory_id: subcategory?.id || "",
      type,
      optionsText: (filter.options || []).map((opt) => opt.value).join(", "),
    });
    setEditOpen(true);
  };

  // Update filter
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (form.id == null) return;
    setSubmitting(true);
    try {
      const filterData = {
        name: form.name.trim(),
        subcategory_id: form.subcategory_id,
        type: form.type,
      };

      await adminService.updateFilter(form.id, filterData);
      console.log("✅ Filter updated");
      await loadFilters();
      setEditOpen(false);
      toast({ description: "Filter updated successfully." });
    } catch (err) {
      console.error("❌ Error updating filter:", err);
      toast({ description: "Error updating filter.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete flow
  const confirmDelete = (filter) => {
    setDeleteCandidate(filter);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await adminService.deleteFilter(deleteCandidate.id);
      console.log("✅ Filter deleted");
      await loadFilters();
      setDeleteCandidate(null);
      toast({ description: "Filter deleted successfully." });
    } catch (err) {
      console.error("❌ Error deleting filter:", err);
      toast({ description: "Error deleting filter.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Values manager (options) open
  const openValuesManager = (filter) => {
    setValuesOpenFor(filter);
  };

  // Add option to a filter
  const handleAddValue = async (newVal) => {
    if (!valuesOpenFor) return;
    const v = (newVal || "").trim();
    if (!v) {
      toast({ description: "Value cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      const optionData = {
        value: v,
        display_order: (valuesOpenFor.options || []).length + 1,
      };
      await adminService.createFilterOption(valuesOpenFor.id, optionData);
      console.log("✅ Option added");
      await loadFilters();

      // Update local valuesOpenFor with new data from server
      const updated = filters.find((f) => f.id === valuesOpenFor.id);
      if (updated) setValuesOpenFor(updated);

      toast({ description: "Option added successfully." });
    } catch (err) {
      console.error("❌ Error adding option:", err);
      toast({ description: "Error adding option.", variant: "destructive" });
    }
  };

  // Remove option from filter
  const handleRemoveValue = async (option) => {
    if (!valuesOpenFor) return;
    setSubmitting(true);
    try {
      await adminService.deleteFilterOption(valuesOpenFor.id, option.id);
      console.log("✅ Option removed");
      await loadFilters();

      const updated = filters.find((f) => f.id === valuesOpenFor.id);
      if (updated) setValuesOpenFor(updated);

      toast({ description: "Option removed successfully." });
    } catch (err) {
      console.error("❌ Error removing option:", err);
      toast({ description: "Error removing option.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading filters..." />;
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Filters Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage dynamic fields by subcategory</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 w-64 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Subcategory filter */}
            <div className="hidden sm:block">
              <Select value={selectedSubcategoryFilter} onValueChange={setSelectedSubcategoryFilter}>
                <SelectTrigger className="h-9 w-44 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69] bg-white">
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="hover:bg-gray-100">All</SelectItem>
                  {subcategoryOptions.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name} className="hover:bg-gray-100">
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="hidden sm:block">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-40 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69] bg-white">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id} className="hover:bg-gray-100">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Create button */}
            <Button
              onClick={openCreate}
              className="h-9 px-4 bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg transition-colors duration-200"
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
              <div className="text-2xl font-bold text-gray-900">{filters.length}</div>
              <div className="text-sm text-gray-600">Total Filters</div>
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
              <div className="text-2xl font-bold text-gray-900">{displayed.length}</div>
              <div className="text-sm text-gray-600">Displayed</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Name</TableHead>
                  <TableHead className="font-semibold text-gray-900">Subcategory</TableHead>
                  <TableHead className="font-semibold text-gray-900">Category</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Options</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No filters found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayed.map((filter) => (
                    <TableRow key={filter.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium">{filter.name}</TableCell>
                      <TableCell>{filter.subcategory}</TableCell>
                      <TableCell className="text-gray-600">{filter.category_name}</TableCell>
                      <TableCell>{getTypeBadge(filter.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {filter.options.length} option(s)
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openValuesManager(filter)}
                            className="h-7 px-2 text-xs border-gray-200 hover:bg-gray-50"
                          >
                            <List className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(filter)}
                            className="h-7 px-2 border-gray-200 hover:bg-gray-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(filter)}
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
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a Filter</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Filter name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Brand, Condition..."
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
                        {sub.name} ({sub.category_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1 h-9 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="options">Options (comma separated)</Label>
                <Textarea
                  id="options"
                  value={form.optionsText}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionsText: e.target.value }))}
                  placeholder="Option 1, Option 2, Option 3..."
                  className="mt-1"
                  rows={3}
                />
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
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Filter</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Filter name</Label>
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
                        {sub.name} ({sub.category_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1 h-9 w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
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

        {/* Values Manager Dialog */}
        {valuesOpenFor && (
          <Dialog open={!!valuesOpenFor} onOpenChange={() => setValuesOpenFor(null)}>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Options - {valuesOpenFor.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  {valuesOpenFor.options.length === 0 ? (
                    <div className="text-sm text-gray-500">No options</div>
                  ) : (
                    valuesOpenFor.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{option.value}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveValue(option)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="New option..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddValue(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector("input");
                      if (input) {
                        handleAddValue(input.value);
                        input.value = "";
                      }
                    }}
                    size="sm"
                    className="bg-[#D6BA69] hover:bg-[#C5A952]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setValuesOpenFor(null)}>Close</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteCandidate && (
          <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the filter "<strong>{deleteCandidate.name}</strong>"?
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

export default Filters;
