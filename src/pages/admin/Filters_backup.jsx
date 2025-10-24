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
import adminService from "../../services/adminService";

/**
 * Filters management screen
 * - Integrated with backend API for filters management
 * - Toast notifications via useToast()
 * - Responsive, no transparency, pro design
 *
 * Theme: primary accent #D6BA69
 */

const typeLabel = (type) => {
  const map = {
    "select": "Select",
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
  const [valuesOpenFor, setValuesOpenFor] = useState(null); // filter object or null
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Forms
  const emptyForm = {
    id: null,
    name: "",
    subcategory_id: "",
    type: "select",
    optionsText: "", // comma-separated in UI for create/edit
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // Charger les filtres depuis l'API
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFilters();
      console.log('🔄 Filtres chargés:', response);
      setFiltersData(response.data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des filtres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les filtres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Transformer les données API en format utilisable
  const filters = useMemo(() => {
    return filtersData.flatMap(item => 
      item.filters.map(filter => ({
        id: filter.id,
        name: filter.name,
        type: filter.type,
        subcategory: item.subcategory.name,
        subcategory_slug: item.subcategory.slug,
        category_name: item.subcategory.category_name,
        options: filter.options || []
      }))
    );
  }, [filtersData]);

  // Derived lists
  const subcategoryOptions = useMemo(() => {
    const subcategories = filtersData.map(item => item.subcategory);
    const uniqueSubcategories = subcategories.filter((sub, index, self) => 
      index === self.findIndex(s => s.id === sub.id)
    );
    return uniqueSubcategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [filtersData]);

    // Search + sort + filter
  const displayed = useMemo(() => {
    let list = filters.slice();

    // filter by subcategory
    if (selectedSubcategoryFilter !== "all") {
      list = list.filter((f) => f.subcategory === selectedSubcategoryFilter);
    }

    // filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => {
        if ((f.name || "").toLowerCase().includes(q)) return true;
        if ((f.subcategory || "").toLowerCase().includes(q)) return true;
        if ((f.category_name || "").toLowerCase().includes(q)) return true;
        if ((f.options || []).some((opt) => opt.value.toLowerCase().includes(q))) return true;
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

  // Handlers: Create / Edit / Delete / Manage Values
  const openCreate = () => {
    setForm({
      ...emptyForm,
    });
    setCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      // Préparer les données pour l'API
      const filterData = {
        name: form.name.trim(),
        subcategory_id: form.subcategory_id,
        type: form.type,
      };

      const response = await adminService.createFilter(filterData);
      console.log('✅ Filtre créé:', response);

      // Si on a des options à ajouter
      if (form.optionsText.trim()) {
        const options = form.optionsText
          .split(',')
          .map(opt => opt.trim())
          .filter(Boolean)
          .map((value, index) => ({
            value,
            display_order: index + 1
          }));

        // Créer chaque option
        for (const option of options) {
          await adminService.createFilterOption(response.data.id, option);
        }
      }

      // Recharger les données
      await loadFilters();
      setCreateOpen(false);
      toast({ description: "Filtre créé avec succès." });
    } catch (err) {
      toast({ description: "Erreur lors de la création du filtre.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (filter) => {
    const subcategory = subcategoryOptions.find(sub => sub.name === filter.subcategory);
    setForm({
      id: filter.id,
      name: filter.name,
      subcategory_id: subcategory?.id || "",
      type: filter.type,
      optionsText: (filter.options || []).map(opt => opt.value).join(", "),
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (form.id == null) return;
    setSubmitting(true);
    try {
      // Mettre à jour le filtre
      const filterData = {
        name: form.name.trim(),
        subcategory_id: form.subcategory_id,
        type: form.type,
      };

      await adminService.updateFilter(form.id, filterData);
      console.log('✅ Filtre mis à jour');

      // Recharger les données pour obtenir la structure complète
      await loadFilters();
      setEditOpen(false);
      toast({ description: "Filtre mis à jour avec succès." });
    } catch (err) {
      toast({ description: "Erreur lors de la mise à jour du filtre.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (filter) => {
    setDeleteCandidate(filter);
  };
    setDeleteCandidate(filter);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await adminService.deleteFilter(deleteCandidate.id);
      console.log('✅ Filtre supprimé');
      
      // Recharger les données
      await loadFilters();
      setDeleteCandidate(null);
      toast({ description: "Filtre supprimé avec succès." });
    } catch (err) {
      toast({ description: "Erreur lors de la suppression du filtre.", variant: "destructive" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openValuesManager = (filter) => {
    setValuesOpenFor(filter);
  };

  const handleAddValue = async (newVal) => {
    if (!valuesOpenFor) return;
    const v = (newVal || "").trim();
    if (!v) {
      toast({ description: "La valeur ne peut pas être vide.", variant: "destructive" });
      return;
    }
    
    try {
      // Créer une nouvelle option pour ce filtre
      const optionData = {
        value: v,
        display_order: (valuesOpenFor.options || []).length + 1
      };
      
      await adminService.createFilterOption(valuesOpenFor.id, optionData);
      console.log('✅ Option ajoutée');
      
      // Recharger les données
      await loadFilters();
      
      // Mettre à jour valuesOpenFor avec les nouvelles données
      const updatedFilter = filters.find(f => f.id === valuesOpenFor.id);
      if (updatedFilter) {
        setValuesOpenFor(updatedFilter);
      }
      
      toast({ description: "Option ajoutée avec succès." });
    } catch (err) {
      toast({ description: "Erreur lors de l'ajout de l'option.", variant: "destructive" });
      console.error(err);
    }
  };

  const handleRemoveValue = async (option) => {
    if (!valuesOpenFor) return;
    
    try {
      await adminService.deleteFilterOption(valuesOpenFor.id, option.id);
      console.log('✅ Option supprimée');
      
      // Recharger les données
      await loadFilters();
      
      // Mettre à jour valuesOpenFor avec les nouvelles données
      const updatedFilter = filters.find(f => f.id === valuesOpenFor.id);
      if (updatedFilter) {
        setValuesOpenFor(updatedFilter);
      }
      
      toast({ description: "Option supprimée avec succès." });
    } catch (err) {
      toast({ description: "Erreur lors de la suppression de l'option.", variant: "destructive" });
      console.error(err);
    }
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
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Filter Name</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Subcategory</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Category</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Type</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase">Options</TableHead>
                    <TableHead className="px-4 py-3 text-xs text-gray-500 uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
                          <div className="text-sm font-medium">Chargement des filtres...</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <List className="h-8 w-8 text-gray-300" />
                          <div className="text-sm font-medium">Aucun filtre trouvé</div>
                          <div className="text-xs text-gray-400">Essayez une autre recherche ou créez un nouveau filtre</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayed.map((f) => (
                      <TableRow key={f.id} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{f.name}</TableCell>

                        <TableCell className="px-4 py-3 text-sm text-gray-600">{f.subcategory}</TableCell>

                        <TableCell className="px-4 py-3 text-sm text-gray-500">{f.category_name}</TableCell>

                        <TableCell className="px-4 py-3">{getTypeBadge(f.type)}</TableCell>

                        <TableCell className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 max-w-[360px]">
                            {(f.options || []).slice(0, 4).map((option) => (
                              <Badge key={option.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {option.value}
                              </Badge>
                            ))}
                            {(f.options || []).length > 4 && (
                              <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                +{(f.options || []).length - 4}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Manage Options */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => openValuesManager(f)}
                            >
                              <List className="h-4 w-4 mr-1" />
                              Options
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
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Select value={form.subcategory_id} onValueChange={(v) => setForm((p) => ({ ...p, subcategory_id: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sélectionner une sous-catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {subcategoryOptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()} className="hover:bg-gray-100">
                          {sub.name} ({sub.category_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de champ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="select" className="hover:bg-gray-100">Select</SelectItem>
                      <SelectItem value="multi-select" className="hover:bg-gray-100">Multi-select</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="optionsText">Options initiales (optionnel)</Label>
                <Textarea
                  id="optionsText"
                  value={form.optionsText}
                  onChange={(e) => setForm((p) => ({ ...p, optionsText: e.target.value }))}
                  placeholder="Séparer les options par des virgules: Option1, Option2, Option3"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-gray-500 mt-1">Utilisé seulement pour les types select et multi-select</p>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer"
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
              <DialogTitle>Modifier le filtre</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nom du filtre</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="h-10" />
                </div>

                <div>
                  <Label>Sous-catégorie</Label>
                  <Select value={form.subcategory_id} onValueChange={(v) => setForm((p) => ({ ...p, subcategory_id: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.name} ({sub.category_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Type de champ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multi-select">Multi-select</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#D6BA69] hover:bg-[#C5A952] text-white" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour"
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
                  <Label className="mb-2">Options existantes</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(valuesOpenFor.options || []).length === 0 ? (
                      <div className="text-xs text-gray-500">Aucune option définie</div>
                    ) : (
                      (valuesOpenFor.options || []).map((option) => (
                        <div key={option.id} className="flex items-center justify-between gap-2 p-2 border rounded">
                          <div className="text-sm text-gray-800">{option.value}</div>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveValue(option)}>
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

        {/* CONFIRMATION SUPPRESSION */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteCandidate(null)} />
            <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer le filtre{" "}
                  <strong>{deleteCandidate.name}</strong> ?
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteCandidate(null)} disabled={submitting}>
                    Annuler
                  </Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      "Supprimer"
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
