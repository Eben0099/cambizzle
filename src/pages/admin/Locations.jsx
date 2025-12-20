"use client";
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin, Search, Download } from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";
import { useToast } from "@/components/ui/use-toast";

const Locations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [locations, setLocations] = useState([
    {
      id: 1,
      region: "Centre",
      cities: ["Yaoundé", "Mbalmayo", "Obala", "Mfou"],
      adsCount: 892,
    },
    {
      id: 2,
      region: "Littoral",
      cities: ["Douala", "Edéa", "Nkongsamba", "Dibombari"],
      adsCount: 1243,
    },
    {
      id: 3,
      region: "West",
      cities: ["Bafoussam", "Dschang", "Mbouda", "Foumban"],
      adsCount: 456,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [newCity, setNewCity] = useState("");

  // ---- CRUD FUNCTIONS ----
  const handleAddRegion = () => {
    if (!newRegion.trim()) {
      toast({ title: t('admin.locations.error'), description: t('admin.locations.regionEmpty'), variant: "destructive" });
      return;
    }
    const newLoc = {
      id: Date.now(),
      region: newRegion,
      cities: [],
      adsCount: 0,
    };
    setLocations([...locations, newLoc]);
    setNewRegion("");
    toast({ title: t('admin.locations.regionAdded'), description: `${newLoc.region} ${t('admin.locations.regionCreated')}` });
  };

  const handleDeleteRegion = (id) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    toast({ title: t('admin.locations.regionDeleted'), description: t('admin.locations.regionRemoved') });
  };

  const handleAddCity = () => {
    if (!newCity.trim() || !selectedRegion) {
      toast({ title: t('admin.locations.error'), description: t('admin.locations.cityEmpty'), variant: "destructive" });
      return;
    }
    const updated = locations.map((loc) =>
      loc.id === selectedRegion.id
        ? { ...loc, cities: [...loc.cities, newCity] }
        : loc
    );
    setLocations(updated);
    setNewCity("");
    toast({ title: t('admin.locations.cityAdded'), description: `${newCity} ${t('admin.locations.cityAddedTo')} ${selectedRegion.region}.` });
  };

  const handleDeleteCity = (regionId, city) => {
    const updated = locations.map((loc) =>
      loc.id === regionId
        ? { ...loc, cities: loc.cities.filter((c) => c !== city) }
        : loc
    );
    setLocations(updated);
    toast({ title: t('admin.locations.cityDeleted'), description: `${city} ${t('admin.locations.cityRemoved')}` });
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.cities.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              locations.flatMap(loc => loc.cities.map(city => ({
                region: loc.region,
                city: city,
                adsCount: loc.adsCount,
              }))),
              'locations',
              {
                columns: [
                  { header: 'Region', key: 'region' },
                  { header: t('admin.locations.city'), key: 'city' },
                  { header: 'Ads Count', key: 'adsCount' },
                ],
                sheetName: 'Locations'
              }
            )}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
            disabled={locations.length === 0}
          >
            <Download className="h-4 w-4" />
            {t('admin.locations.export')}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.locations.newRegion')}
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">{t('admin.locations.addNewRegion')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="regionname">{t('admin.locations.regionName')}</Label>
                <Input
                  id="regionname"
                  placeholder={t('admin.locations.regionPlaceholder')}
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                onClick={handleAddRegion}
              >
                {t('admin.locations.addRegion')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
              placeholder={t('admin.locations.searchPlaceholder')}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Region List */}
      <div className="grid gap-6">
        {filteredLocations.map((location) => (
          <Card
            key={location.id}
            className="border border-border bg-white shadow-sm hover:shadow-lg transition rounded-2xl"
          >
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-[#D6BA69]" />
                <div>
                  <CardTitle className="text-xl font-semibold">{location.region}</CardTitle>
                  {/* Nombre de villes retiré */}
                </div>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:border-[#D6BA69] hover:text-[#D6BA69] transition"
                      onClick={() => setSelectedRegion(location)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('admin.locations.addCity')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white rounded-xl p-6">
                    <DialogHeader>
                      <DialogTitle>{t('admin.locations.addCityTo')} {selectedRegion?.region}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cityname">{t('admin.locations.cityName')}</Label>
                        <Input
                          id="cityname"
                          placeholder={t('admin.locations.cityPlaceholder')}
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                        onClick={handleAddCity}
                      >
                        {t('admin.locations.addCity')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:border-[#D6BA69] hover:text-[#D6BA69] transition"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:border-red-500 hover:text-red-500 transition"
                  onClick={() => handleDeleteRegion(location.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Cities Table */}
            <CardContent>
              <div className="overflow-x-auto rounded-lg border mt-3">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>{t('admin.locations.city')}</TableHead>
                      <TableHead className="text-right">{t('admin.locations.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {location.cities.map((city, i) => (
                      <TableRow
                        key={i}
                        className="hover:bg-muted/30 transition cursor-pointer"
                      >
                        <TableCell className="font-medium">{city}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:border-[#D6BA69] hover:text-[#D6BA69]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:border-red-500 hover:text-red-500"
                              onClick={() => handleDeleteCity(location.id, city)}
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
        ))}
      </div>
    </div>
  );
};

export default Locations;
