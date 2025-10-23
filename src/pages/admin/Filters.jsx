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
import { cn } from "@/lib/utils";

/**
 * Filters management screen
 * - Front-end search and sorting
 * - useState-driven filters (mock data ready to be wired to API)
 * - Toast notifications via useToast()
 * - Responsive, no transparency, pro design
 *
 * Theme: primary accent #D6BA69
 */

const initialFiltersMock = [
  {
    id: 1,
    position: 1,
    name: "Brand",
    subcategory: "Phones",
    type: "dropdown", // dropdown | multi-select | text | number
    values: ["Samsung", "Apple", "Huawei", "Xiaomi"],
  },
  {
    id: 2,
    position: 2,
    name: "Condition",
    subcategory: "Phones",
    type: "dropdown",
    values: ["New", "Like new", "Good", "Used"],
  },
  {
    id: 3,
    position: 3,
    name: "Storage",
    subcategory: "Phones",
    type: "multi-select",
    values: ["64 GB", "128 GB", "256 GB", "512 GB"],
  },
  {
    id: 4,
    position: 4,
    name: "Color",
    subcategory: "Phones",
    type: "multi-select",
    values: ["Black", "White", "Blue", "Red", "Gold"],
  },
];

const typeLabel = (type) => {
  const map = {
    "dropdown": "Dropdown",
    "multi-select": "Multi-select",
    "text": "Text",
    "number": "Number",
  };
  return map[type] || type;
};

const getTypeBadge = (type) => {
  return (
    <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
      {typeLabel(type)}
    </Badge>
  );
};

const SORT_OPTIONS = [
  { id: "position_asc", label: "Position ▲" },
  { id: "position_desc", label: "Position ▼" },
  { id: "name_asc", label: "Name ▲" },
  { id: "name_desc", label: "Name ▼" },
];

const Filters = () => {
  const [filters, setFilters] = useState(initialFiltersMock);
  const [loading, setLoading] = useState(false); // keep for future API hooks
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].id);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState("all");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [valuesOpenFor, setValuesOpenFor] = useState(null); // filter object or null
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Forms
  const emptyForm = {
    id: null,
    name: "",
    subcategory: "Phones",
    type: "dropdown",
    position: 1,
    valuesText: "", // comma-separated in UI for create/edit
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // Derived lists
  const subcategoryOptions = useMemo(() => {
    const setNames = new Set(filters.map((f) => f.subcategory));
    return Array.from(setNames).sort();
  }, [filters]);

  // Search + sort + filter
  const displayed = useMemo(() => {
    let list = filters.slice();

    // filter by subcategory
    if (selectedSubcategoryFilter !== "all") {
      list = list.filter((f) => f.subcategory === selectedSubcategoryFilter);
    }

    // search by name / subcategory / values
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => {
        if ((f.name || "").toLowerCase().includes(q)) return true;
        if ((f.subcategory || "").toLowerCase().includes(q)) return true;
        if ((f.values || []).some((v) => v.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    // sort
    switch (sortBy) {
      case "position_asc":
        list.sort((a, b) => (a.position || 0) - (b.position || 0));
        break;
      case "position_desc":
        list.sort((a, b) => (b.position || 0) - (a.position || 0));
        break;
      case "name_asc":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        break;
    }

    return list;
  }, [filters, search, sortBy, selectedSubcategoryFilter]);

  // Handlers: Create / Edit / Delete / Manage Values
  const openCreate = () => {
    setForm({
      ...emptyForm,
      position: filters.length ? Math.max(...filters.map((f) => f.position || 0)) + 1 : 1,
    });
    setCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      // parse values
      const values = (form.valuesText || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      // simple id generator (front-end)
      const newId = (filters.reduce((mx, f) => Math.max(mx, f.id || 0), 0) || 0) + 1;

      const newFilter = {
        id: newId,
        name: form.name.trim(),
        subcategory: form.subcategory,
        type: form.type,
        position: Number(form.position) || 1,
        values,
      };

      setFilters((prev) => [...prev, newFilter]);
      setCreateOpen(false);
      toast({ description: "Filter created successfully." });
    } catch (err) {
      toast({ description: "Failed to create filter.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (filter) => {
    setForm({
      id: filter.id,
      name: filter.name,
      subcategory: filter.subcategory,
      type: filter.type,
      position: filter.position || 1,
      valuesText: (filter.values || []).join(", "),
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (form.id == null) return;
    setSubmitting(true);
    try {
      const values = (form.valuesText || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      setFilters((prev) =>
        prev.map((f) =>
          f.id === form.id
            ? {
                ...f,
                name: form.name.trim(),
                subcategory: form.subcategory,
                type: form.type,
                position: Number(form.position) || 1,
                values,
              }
            : f
        )
      );
      setEditOpen(false);
      toast({ description: "Filter updated successfully." });
    } catch (err) {
      toast({ description: "Failed to update filter.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (filter) => {
    setDeleteCandidate(filter);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      setFilters((prev) => prev.filter((f) => f.id !== deleteCandidate.id));
      setDeleteCandidate(null);
      toast({ description: "Filter deleted successfully." });
    } catch (err) {
      toast({ description: "Failed to delete filter.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openValuesManager = (filter) => {
    setValuesOpenFor(filter);
  };

  const handleAddValue = (newVal) => {
    if (!valuesOpenFor) return;
    const v = (newVal || "").trim();
    if (!v) {
      toast({ description: "Value cannot be empty.", variant: "destructive" });
      return;
    }
    // avoid duplicates
    setFilters((prev) =>
      prev.map((f) =>
        f.id === valuesOpenFor.id ? { ...f, values: Array.from(new Set([...(f.values || []), v])) } : f
      )
    );
    // keep valuesOpenFor reference updated
    setValuesOpenFor((prev) => prev && { ...prev, values: Array.from(new Set([...(prev.values || []), v])) });
    toast({ description: "Value added." });
  };

  const handleRemoveValue = (val) => {
    if (!valuesOpenFor) return;
    setFilters((prev) => prev.map((f) => (f.id === valuesOpenFor.id ? { ...f, values: (f.values || []).filter((x) => x !== val) } : f)));
    setValuesOpenFor((prev) => prev && { ...prev, values: (prev.values || []).filter((x) => x !== val) });
    toast({ description: "Value removed." });
  };

  // small responsive helpers for table columns on narrow screens
  const isCompact = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Filters Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage dynamic fields per subcategory</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search by name, subcategory or value..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 w-full sm:w-72 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Subcategory filter */}
            <div className="hidden sm:block">
              <Select value={selectedSubcategoryFilter} onValueChange={setSelectedSubcategoryFilter}>
                <SelectTrigger className="h-9 w-44 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69]">
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="hover:bg-gray-100">All</SelectItem>
                  {subcategoryOptions.map((s) => (
                    <SelectItem key={s} value={s} className="hover:bg-gray-100">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="hidden sm:block">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-40 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69]">
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

            {/* Create */}
            <div className="flex-shrink-0">
              <Button
                onClick={openCreate}
                className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Card/Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="px-4 py-3 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold">Filters by Subcategory</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Position</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Filter Name</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Subcategory</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Type</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Values</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {displayed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <List className="h-8 w-8 text-gray-300" />
                          <div className="text-sm font-medium">No filters found</div>
                          <div className="text-xs text-gray-400">Try another search or create a new filter</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayed.map((f) => (
                      <TableRow key={f.id} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-3">
                          <Badge className="bg-gray-100 text-gray-800 text-xs">{f.position}</Badge>
                        </TableCell>

                        <TableCell className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{f.name}</TableCell>

                        <TableCell className="px-4 py-3 text-sm text-gray-600">{f.subcategory}</TableCell>

                        <TableCell className="px-4 py-3">{getTypeBadge(f.type)}</TableCell>

                        <TableCell className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 max-w-[360px]">
                            {(f.values || []).slice(0, 4).map((v, idx) => (
                              <Badge key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {v}
                              </Badge>
                            ))}
                            {(f.values || []).length > 4 && (
                              <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                +{(f.values || []).length - 4}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Manage Values */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => openValuesManager(f)}
                            >
                              <List className="h-4 w-4 mr-1" />
                              Values
                            </Button>

                            {/* Edit */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => openEdit(f)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Delete */}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 text-xs"
                              onClick={() => confirmDelete(f)}
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

        {/* Footer / Pagination (simple client-side) */}
        {/* For now skip large pagination; can be added later if needed */}

        {/* CREATE DIALOG */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Create Dynamic Filter</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Filter name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="e.g. Brand, Color..."
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={form.subcategory} onValueChange={(v) => setForm((p) => ({ ...p, subcategory: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {/* populate with existing subcategories (mock) */}
                      {["Phones", "Computers", "Cars"].map((s) => (
                        <SelectItem key={s} value={s} className="hover:bg-gray-100">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Field type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="dropdown" className="hover:bg-gray-100">Dropdown</SelectItem>
                      <SelectItem value="multi-select" className="hover:bg-gray-100">Multi-select</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Display position</Label>
                  <Input
                    id="position"
                    type="number"
                    value={form.position}
                    onChange={(e) => setForm((p) => ({ ...p, position: Number(e.target.value || 1) }))}
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <Label>Values (comma separated)</Label>
                <Textarea
                  placeholder="e.g. New, Like new, Good, Used"
                  value={form.valuesText}
                  onChange={(e) => setForm((p) => ({ ...p, valuesText: e.target.value }))}
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">Only used for dropdown and multi-select types</p>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={submitting}>
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

        {/* EDIT DIALOG */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Edit Filter</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Filter name</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="h-10" />
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <Select value={form.subcategory} onValueChange={(v) => setForm((p) => ({ ...p, subcategory: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Phones", "Computers", "Cars"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Field type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="multi-select">Multi-select</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Display position</Label>
                  <Input type="number" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: Number(e.target.value || 1) }))} className="h-10" />
                </div>
              </div>

              <div>
                <Label>Values (comma separated)</Label>
                <Textarea value={form.valuesText} onChange={(e) => setForm((p) => ({ ...p, valuesText: e.target.value }))} className="h-24" />
                <p className="text-xs text-gray-500 mt-1">Only used for dropdown and multi-select types</p>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={submitting}>
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

        {/* VALUES MANAGER (custom dialog, not using Dialog component so we can keep a simple panel) */}
        {valuesOpenFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Manage Values - {valuesOpenFor.name}</h3>
                  <p className="text-xs text-gray-500">Add or remove values for this filter</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setValuesOpenFor(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label>New value</Label>
                    <Input id="newValue" placeholder="e.g. Mint" className="h-10" />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        const el = document.getElementById("newValue");
                        if (!el) return;
                        const v = el.value.trim();
                        if (!v) {
                          toast({ description: "Value cannot be empty.", variant: "destructive" });
                          return;
                        }
                        handleAddValue(v);
                        el.value = "";
                      }}
                      className="h-10 bg-[#D6BA69] hover:bg-[#C5A952] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Existing values</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(valuesOpenFor.values || []).length === 0 ? (
                      <div className="text-xs text-gray-500">No values defined</div>
                    ) : (
                      (valuesOpenFor.values || []).map((v) => (
                        <div key={v} className="flex items-center justify-between gap-2 p-2 border rounded">
                          <div className="text-sm text-gray-800">{v}</div>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveValue(v)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM (simple centered modal) */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm deletion</h3>
                <p className="text-sm text-gray-600 mt-2">
                  This action cannot be undone. Are you sure you want to delete the filter{" "}
                  <strong>{deleteCandidate.name}</strong>?
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteCandidate(null)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting}>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
