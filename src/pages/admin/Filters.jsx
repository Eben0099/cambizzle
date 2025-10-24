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
import adminService from "@/services/adminService";

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
  const [valuesOpenFor, setValuesOpenFor] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Forms
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
        subcategory_id: item.subcategory.id,
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
    setForm({ ...emptyForm });
    setCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
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
      const filterData = {
        name: form.name.trim(),
        subcategory_id: form.subcategory_id,
        type: form.type,
      };

      await adminService.updateFilter(form.id, filterData);
      console.log('✅ Filtre mis à jour');

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

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await adminService.deleteFilter(deleteCandidate.id);
      console.log('✅ Filtre supprimé');
      
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
      const optionData = {
        value: v,
        display_order: (valuesOpenFor.options || []).length + 1
      };
      
      await adminService.createFilterOption(valuesOpenFor.id, optionData);
      console.log('✅ Option ajoutée');
      
      await loadFilters();
      
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
      
      await loadFilters();
      
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#D6BA69]" />
            <p className="text-gray-600">Chargement des filtres...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Filtres</h1>
            <p className="text-sm text-gray-600 mt-1">Gérer les champs dynamiques par sous-catégorie</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 w-64 text-sm rounded-lg border-gray-200 focus:ring-[#D6BA69]"
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
                  <SelectItem value="all" className="hover:bg-gray-100">Toutes</SelectItem>
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
                  <SelectValue placeholder="Trier" />
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
            <Button
              onClick={openCreate}
              className="h-9 px-4 bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{filters.length}</div>
              <div className="text-sm text-gray-600">Filtres totaux</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{subcategoryOptions.length}</div>
              <div className="text-sm text-gray-600">Sous-catégories</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{displayed.length}</div>
              <div className="text-sm text-gray-600">Affichés</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Nom</TableHead>
                  <TableHead className="font-semibold text-gray-900">Sous-catégorie</TableHead>
                  <TableHead className="font-semibold text-gray-900">Catégorie</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Options</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun filtre trouvé
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
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Créer un Filtre</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du filtre</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Brand, Condition..."
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subcategory">Sous-catégorie</Label>
                <Select
                  value={form.subcategory_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, subcategory_id: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner une sous-catégorie" />
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

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="options">Options (séparées par des virgules)</Label>
                <Textarea
                  id="options"
                  value={form.optionsText}
                  onChange={(e) => setForm(prev => ({ ...prev, optionsText: e.target.value }))}
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
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D6BA69] hover:bg-[#C5A952]"
                >
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

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Modifier le Filtre</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom du filtre</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-subcategory">Sous-catégorie</Label>
                <Select
                  value={form.subcategory_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, subcategory_id: value }))}
                >
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1">
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

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D6BA69] hover:bg-[#C5A952]"
                >
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

        {/* Values Manager Dialog */}
        {valuesOpenFor && (
          <Dialog open={!!valuesOpenFor} onOpenChange={() => setValuesOpenFor(null)}>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Options - {valuesOpenFor.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  {valuesOpenFor.options.map((option) => (
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
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle option..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddValue(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input');
                      handleAddValue(input.value);
                      input.value = '';
                    }}
                    size="sm"
                    className="bg-[#D6BA69] hover:bg-[#C5A952]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteCandidate && (
          <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer le filtre "{deleteCandidate.name}" ?
                  Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteCandidate(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
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
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Filters;