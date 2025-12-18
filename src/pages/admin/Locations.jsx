"use client";
import { useState } from "react";
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
import { Plus, Edit, Trash2, MapPin, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Locations = () => {
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
      toast({ title: "Error", description: "Region name cannot be empty.", variant: "destructive" });
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
    toast({ title: "Region added", description: `${newLoc.region} has been created successfully.` });
  };

  const handleDeleteRegion = (id) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    toast({ title: "Region deleted", description: "Region removed successfully." });
  };

  const handleAddCity = () => {
    if (!newCity.trim() || !selectedRegion) {
      toast({ title: "Error", description: "City name cannot be empty.", variant: "destructive" });
      return;
    }
    const updated = locations.map((loc) =>
      loc.id === selectedRegion.id
        ? { ...loc, cities: [...loc.cities, newCity] }
        : loc
    );
    setLocations(updated);
    setNewCity("");
    toast({ title: "City added", description: `${newCity} added to ${selectedRegion.region}.` });
  };

  const handleDeleteCity = (regionId, city) => {
    const updated = locations.map((loc) =>
      loc.id === regionId
        ? { ...loc, cities: loc.cities.filter((c) => c !== city) }
        : loc
    );
    setLocations(updated);
    toast({ title: "City deleted", description: `${city} removed successfully.` });
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
          <h1 className="text-3xl font-bold text-foreground">Location Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage regions and their respective cities
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Region
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add New Region</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="regionname">Region Name</Label>
                <Input
                  id="regionname"
                  placeholder="e.g. Centre, Littoral..."
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                onClick={handleAddRegion}
              >
                Add Region
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border border-border shadow-sm hover:shadow-md transition bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Regions or Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by region or city..."
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
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white rounded-xl p-6">
                    <DialogHeader>
                      <DialogTitle>Add City to {selectedRegion?.region}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cityname">City Name</Label>
                        <Input
                          id="cityname"
                          placeholder="e.g. Yaoundé"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                        onClick={handleAddCity}
                      >
                        Add City
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
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
