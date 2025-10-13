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
import { Search, UserCheck, UserX, Shield, Ban } from "lucide-react";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const users = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "+237 6 XX XX XX XX",
      role: "vendeur",
      verified: true,
      status: "active",
      adsCount: 12,
      joinDate: "15/01/2025",
    },
    {
      id: 2,
      name: "Marie Claire",
      email: "marie.c@email.com",
      phone: "+237 6 XX XX XX XX",
      role: "acheteur",
      verified: false,
      status: "active",
      adsCount: 0,
      joinDate: "20/01/2025",
    },
    {
      id: 3,
      name: "Paul Martin",
      email: "paul.m@email.com",
      phone: "+237 6 XX XX XX XX",
      role: "vendeur",
      verified: true,
      status: "suspended",
      adsCount: 8,
      joinDate: "10/01/2025",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Actif" },
      suspended: { variant: "destructive", label: "Suspendu" },
      banned: { variant: "destructive", label: "Banni" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérer et modérer les comptes utilisateurs</p>
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
                placeholder="Rechercher par nom, email ou téléphone..."
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
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
                <SelectItem value="banned">Bannis</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="acheteur">Acheteur</SelectItem>
                <SelectItem value="vendeur">Vendeur</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {user.name}
                          {user.verified && (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-foreground">{user.email}</div>
                      <div className="text-muted-foreground">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <span className="text-foreground font-medium">{user.adsCount}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!user.verified && (
                        <Button size="sm" variant="outline">
                          <Shield className="h-4 w-4 mr-1" />
                          Vérifier
                        </Button>
                      )}
                      {user.status === "active" ? (
                        <Button size="sm" variant="destructive">
                          <Ban className="h-4 w-4 mr-1" />
                          Suspendre
                        </Button>
                      ) : (
                        <Button size="sm" variant="default">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activer
                        </Button>
                      )}
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

export default Users;
