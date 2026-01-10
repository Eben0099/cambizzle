"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin, Search, Download, Loader2 } from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";
import { useToast } from "../../components/toast/useToast";
import adminService from "@/services/adminService";
import Loader from "@/components/ui/Loader";

const Locations = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [locationsRaw, setLocationsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    id: null,
    city: "",
    region: "",
    country: "Cameroun",
    is_active: 1
  };
  const [form, setForm] = useState(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLocations();
      // Expecting array of {id, city, region, country, is_active}
      setLocationsRaw(Array.isArray(res?.data) ? res.data : (res?.data?.locations || []));
    } catch (err) {
      showToast({ type: 'error', message: t('admin.locations.loadError') || "Erreur lors du chargement des localisations" });
    } finally {
      setLoading(false);
    }
  };

  // Group raw locations by region for the grouped UI
  const groupedLocations = useMemo(() => {
    const grouped = locationsRaw.reduce((acc, loc) => {
      const region = loc.region || "Autre";
      if (!acc[region]) {
        acc[region] = {
          region,
          items: [],
          adsCount: 0
        };
      }
      acc[region].items.push(loc);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.region.localeCompare(b.region));
  }, [locationsRaw]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedLocations;
    const q = searchTerm.toLowerCase();
    return groupedLocations.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.city.toLowerCase().includes(q) ||
        group.region.toLowerCase().includes(q)
      )
    })).filter(group => group.items.length > 0 || group.region.toLowerCase().includes(q));
  }, [groupedLocations, searchTerm]);

  const handleOpenCreate = (region = "") => {
    setForm({ ...emptyForm, region });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (location) => {
    setForm({
      id: location.id,
      city: location.city,
      region: location.region,
      country: location.country || "Cameroun",
      is_active: location.is_active
    });
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.city.trim() || !form.region.trim()) {
      showToast({ type: 'error', message: t('admin.locations.fieldsRequired') || "City and Region are required" });
      return;
    }

    setSubmitting(true);
    try {
      if (form.id) {
        await adminService.updateLocation(form.id, form);
        showToast({ type: 'success', message: t('admin.locations.updateSuccess') || "Localisation mise à jour" });
      } else {
        await adminService.createLocation(form);
        showToast({ type: 'success', message: t('admin.locations.createSuccess') || "Localisation créée" });
      }
      await loadLocations();
      setIsDialogOpen(false);
    } catch (err) {
      showToast({ type: 'error', message: t('admin.locations.saveError') || "Erreur lors de l'enregistrement" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await adminService.deleteLocation(deleteCandidate.id);
      showToast({ type: 'success', message: t('admin.locations.deleteSuccess') || "Localisation supprimée" });
      await loadLocations();
      setDeleteCandidate(null);
    } catch (err) {
      showToast({ type: 'error', message: t('admin.locations.deleteError') || "Erreur lors de la suppression" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text={t('admin.locations.loading')} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.locations.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.locations.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToExcel(
              locationsRaw.map(loc => ({
                id: loc.id,
                region: loc.region,
                city: loc.city,
                country: loc.country,
                status: loc.is_active ? 'Active' : 'Inactive'
              })),
              'locations',
              {
                columns: [
                  { header: 'ID', key: 'id' },
                  { header: 'Region', key: 'region' },
                  { header: t('admin.locations.city'), key: 'city' },
                  { header: 'Country', key: 'country' },
                  { header: 'Status', key: 'status' },
                ],
                sheetName: 'Locations'
              }
            )}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
            disabled={locationsRaw.length === 0}
          >
            <Download className="h-4 w-4" />
            {t('admin.locations.export')}
          </Button>

          <Button
            className="bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition-colors"
            onClick={() => handleOpenCreate()}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.locations.newRegion') || "Nouvelle Localisation"}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border border-border shadow-sm hover:shadow-md transition bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('admin.locations.searchTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={t('admin.locations.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Region List */}
      <div className="grid gap-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t('common.noResults') || "Aucune localisation trouvée."}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <Card
              key={group.region}
              className="border border-border bg-white shadow-sm hover:shadow-lg transition rounded-2xl overflow-hidden"
            >
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#D6BA69]" />
                  <div>
                    <CardTitle className="text-xl font-semibold">{group.region}</CardTitle>
                    <p className="text-xs text-muted-foreground">{group.items.length} {t('admin.locations.cities')}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:border-[#D6BA69] hover:text-[#D6BA69] transition"
                    onClick={() => handleOpenCreate(group.region)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('admin.locations.addCity')}
                  </Button>
                </div>
              </CardHeader>

              {/* Cities Table */}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="pl-6">{t('admin.locations.city')}</TableHead>
                        <TableHead>{t('admin.locations.country')}</TableHead>
                        <TableHead>{t('admin.locations.status')}</TableHead>
                        <TableHead className="text-right pr-6">{t('admin.locations.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((location) => (
                        <TableRow
                          key={location.id}
                          className="hover:bg-muted/30 transition"
                        >
                          <TableCell className="font-medium pl-6">{location.city}</TableCell>
                          <TableCell>{location.country}</TableCell>
                          <TableCell>
                            <Badge className={location.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {location.is_active ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:border-[#D6BA69] hover:text-[#D6BA69]"
                                onClick={() => handleOpenEdit(location)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:border-red-500 hover:text-red-500"
                                onClick={() => setDeleteCandidate(location)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {form.id ? t('admin.locations.editLocation') || "Modifier Localisation" : t('admin.locations.addNewLocation') || "Ajouter une Localisation"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('admin.locations.cityName')}</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder={t('admin.locations.cityPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">{t('admin.locations.regionName')}</Label>
              <Input
                id="region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder={t('admin.locations.regionPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t('admin.locations.country')}</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.is_active === 1}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                className="rounded border-gray-300 text-[#D6BA69] focus:ring-[#D6BA69] w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">{t('common.active')}</Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition mt-2"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {form.id ? t('common.save') : t('common.create')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
        <DialogContent className="max-w-md bg-white rounded-xl p-6">
          <DialogHeader>
            <DialogTitle>{t('common.confirm') || "Confirmer la suppression"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t('admin.locations.deleteConfirmMessage', { city: deleteCandidate?.city, region: deleteCandidate?.region })}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
