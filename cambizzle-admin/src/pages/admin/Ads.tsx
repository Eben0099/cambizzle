import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check, X, Eye, Trash2, Star } from "lucide-react";

const Ads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const ads = [
    {
      id: 1,
      title: "Samsung Galaxy S23 - Neuf sous garantie",
      seller: "Jean Dupont",
      category: "Électronique / Téléphones",
      price: "350,000 XAF",
      status: "pending",
      isPremium: false,
      views: 45,
      date: "10/01/2025",
    },
    {
      id: 2,
      title: "Toyota Corolla 2018 - Bon état",
      seller: "Marie Claire",
      category: "Véhicules / Voitures",
      price: "4,500,000 XAF",
      status: "approved",
      isPremium: true,
      views: 120,
      date: "11/01/2025",
    },
    {
      id: 3,
      title: "Appartement 3 pièces - Yaoundé",
      seller: "Paul Martin",
      category: "Immobilier / Locations",
      price: "150,000 XAF/mois",
      status: "rejected",
      isPremium: false,
      views: 32,
      date: "12/01/2025",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      approved: { variant: "default", label: "Approuvée" },
      rejected: { variant: "destructive", label: "Rejetée" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modération des Annonces</h1>
          <p className="text-muted-foreground mt-1">Approuver, rejeter ou gérer les annonces</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, vendeur ou catégorie..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="electronics">Électronique</SelectItem>
                <SelectItem value="vehicles">Véhicules</SelectItem>
                <SelectItem value="realestate">Immobilier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Liste des Annonces</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Annonce</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground max-w-[300px]">
                        {ad.title}
                        {ad.isPremium && (
                          <Star className="inline-block h-4 w-4 ml-2 text-primary fill-primary" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{ad.seller}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ad.category}</TableCell>
                  <TableCell className="font-medium text-foreground">{ad.price}</TableCell>
                  <TableCell>{getStatusBadge(ad.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{ad.views}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ad.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {ad.status === "pending" && (
                        <>
                          <Button size="sm" variant="default">
                            <Check className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="destructive">
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
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

export default Ads;
