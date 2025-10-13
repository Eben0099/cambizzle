import { useState } from "react";
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
import { Plus, Edit, Trash2, List } from "lucide-react";
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

const Filters = () => {
  const filters = [
    {
      id: 1,
      name: "Marque",
      subcategory: "Téléphones",
      type: "dropdown",
      values: ["Samsung", "Apple", "Huawei", "Xiaomi"],
      position: 1,
    },
    {
      id: 2,
      name: "État",
      subcategory: "Téléphones",
      type: "dropdown",
      values: ["Neuf", "Très bon état", "Bon état", "Utilisé"],
      position: 2,
    },
    {
      id: 3,
      name: "Capacité",
      subcategory: "Téléphones",
      type: "multi-select",
      values: ["64 Go", "128 Go", "256 Go", "512 Go"],
      position: 3,
    },
    {
      id: 4,
      name: "Couleur",
      subcategory: "Téléphones",
      type: "multi-select",
      values: ["Noir", "Blanc", "Bleu", "Rouge", "Or"],
      position: 4,
    },
  ];

  const getTypeBadge = (type) => {
    const labels = {
      dropdown: "Liste déroulante",
      "multi-select": "Multi-sélection",
      text: "Texte",
      number: "Numérique",
    };
    return <Badge variant="secondary">{labels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Filtres</h1>
          <p className="text-muted-foreground mt-1">
            Gérer les champs dynamiques par sous-catégorie
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Filtre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Filtre Dynamique</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filtername">Nom du filtre</Label>
                  <Input id="filtername" placeholder="Ex: Marque, Couleur..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phones">Téléphones</SelectItem>
                      <SelectItem value="computers">Ordinateurs</SelectItem>
                      <SelectItem value="cars">Voitures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtertype">Type de champ</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dropdown">Liste déroulante</SelectItem>
                    <SelectItem value="multi-select">Multi-sélection</SelectItem>
                    <SelectItem value="text">Texte libre</SelectItem>
                    <SelectItem value="number">Numérique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position d'affichage</Label>
                <Input id="position" type="number" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label>Valeurs (séparées par des virgules)</Label>
                <Input placeholder="Ex: Neuf, Bon état, Utilisé" />
              </div>
              <Button className="w-full">Créer le filtre</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Filtres par Sous-catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Nom du Filtre</TableHead>
                <TableHead>Sous-catégorie</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valeurs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filters.map((filter) => (
                <TableRow key={filter.id}>
                  <TableCell>
                    <Badge variant="outline">{filter.position}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{filter.name}</TableCell>
                  <TableCell className="text-muted-foreground">{filter.subcategory}</TableCell>
                  <TableCell>{getTypeBadge(filter.type)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {filter.values.slice(0, 3).map((value, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                      {filter.values.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{filter.values.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <List className="h-4 w-4 mr-1" />
                            Valeurs
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gérer les Valeurs - {filter.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              {filter.values.map((value, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border rounded">
                                  <span className="text-foreground">{value}</span>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input placeholder="Nouvelle valeur" />
                              <Button>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Filters;
