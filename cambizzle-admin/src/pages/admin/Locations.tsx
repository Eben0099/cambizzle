import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, MapPin as MapPinIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Locations = () => {
  const locations = [
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
      region: "Ouest",
      cities: ["Bafoussam", "Dschang", "Mbouda", "Foumban"],
      adsCount: 456,
    },
    {
      id: 4,
      region: "Nord-Ouest",
      cities: ["Bamenda", "Kumbo", "Ndop", "Wum"],
      adsCount: 234,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Localisations</h1>
          <p className="text-muted-foreground mt-1">
            Gérer les régions et villes
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Région
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Région</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="regionname">Nom de la région</Label>
                <Input id="regionname" placeholder="Ex: Centre, Littoral..." />
              </div>
              <Button className="w-full">Ajouter la région</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{location.region}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {location.adsCount} annonces • {location.cities.length} villes
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter Ville
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter une Ville - {location.region}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cityname">Nom de la ville</Label>
                          <Input id="cityname" placeholder="Ex: Yaoundé" />
                        </div>
                        <Button className="w-full">Ajouter la ville</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {location.cities.map((city, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                    <span className="text-sm font-medium text-foreground">{city}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Locations;
