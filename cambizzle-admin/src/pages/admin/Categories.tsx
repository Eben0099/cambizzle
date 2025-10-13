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
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const categories = [
    {
      id: 1,
      name: "Électronique",
      subcategories: [
        { id: 1, name: "Téléphones", adsCount: 234 },
        { id: 2, name: "Ordinateurs", adsCount: 156 },
        { id: 3, name: "Accessoires", adsCount: 89 },
      ],
      adsCount: 479,
      icon: "📱",
    },
    {
      id: 2,
      name: "Véhicules",
      subcategories: [
        { id: 4, name: "Voitures", adsCount: 312 },
        { id: 5, name: "Motos", adsCount: 178 },
        { id: 6, name: "Pièces détachées", adsCount: 92 },
      ],
      adsCount: 582,
      icon: "🚗",
    },
    {
      id: 3,
      name: "Immobilier",
      subcategories: [
        { id: 7, name: "Locations", adsCount: 267 },
        { id: 8, name: "Ventes", adsCount: 143 },
        { id: 9, name: "Colocations", adsCount: 54 },
      ],
      adsCount: 464,
      icon: "🏠",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Catégories</h1>
          <p className="text-muted-foreground mt-1">Gérer les catégories et sous-catégories</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input id="name" placeholder="Ex: Électronique" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icône (emoji)</Label>
                <Input id="icon" placeholder="📱" />
              </div>
              <Button className="w-full">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.adsCount} annonces au total
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Sous-catégorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nouvelle Sous-catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="subcatname">Nom de la sous-catégorie</Label>
                          <Input id="subcatname" placeholder="Ex: Téléphones" />
                        </div>
                        <Button className="w-full">Créer</Button>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sous-catégorie</TableHead>
                    <TableHead>Annonces</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.subcategories.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          {sub.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sub.adsCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            Gérer Filtres
                          </Button>
                          <Button size="sm" variant="outline">
                            Gérer Marques
                          </Button>
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
        ))}
      </div>
    </div>
  );
};

export default Categories;
