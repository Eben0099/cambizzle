import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Brands = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const brands = [
    { id: 1, name: "Samsung", subcategory: "Téléphones", adsCount: 145 },
    { id: 2, name: "Apple", subcategory: "Téléphones", adsCount: 189 },
    { id: 3, name: "Huawei", subcategory: "Téléphones", adsCount: 67 },
    { id: 4, name: "Toyota", subcategory: "Voitures", adsCount: 234 },
    { id: 5, name: "Honda", subcategory: "Voitures", adsCount: 156 },
    { id: 6, name: "HP", subcategory: "Ordinateurs", adsCount: 89 },
    { id: 7, name: "Dell", subcategory: "Ordinateurs", adsCount: 103 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Marques</h1>
          <p className="text-muted-foreground mt-1">
            Gérer les marques par sous-catégorie
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Marque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Marque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="brandname">Nom de la marque</Label>
                <Input id="brandname" placeholder="Ex: Samsung, Toyota..." />
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
                    <SelectItem value="motos">Motos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Ajouter la marque</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Rechercher une Marque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou sous-catégorie..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Liste des Marques</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marque</TableHead>
                <TableHead>Sous-catégorie</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium text-foreground">
                    {brand.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{brand.subcategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{brand.adsCount} annonces</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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

export default Brands;
