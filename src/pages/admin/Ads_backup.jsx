import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  Ban, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import adminService from "../../services/adminService";

const Users = () => {
  // États pour les données
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  // États pour les modales
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  
  // États pour les actions
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendNotes, setSuspendNotes] = useState("");
  const [unsuspendNotes, setUnsuspendNotes] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers(currentPage, usersPerPage);
      
      if (response.status === 'success') {
        setUsers(response.data.users);
        setTotalUsers(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setActionLoading(true);
      const response = await adminService.getUserDetails(userId);
      
      if (response.status === 'success') {
        setSelectedUserDetails(response.data);
        setUserDetailsModalOpen(true);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des détails');
      }
    } catch (err) {
      console.error('Erreur détails utilisateur:', err);
      alert(err.message || 'Erreur lors du chargement des détails');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions pour les actions
  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      alert('Veuillez remplir la raison de la suspension');
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.suspendUser(
        selectedUser.idUser, 
        suspendReason, 
        suspendNotes
      );
      
      if (response.status === 'success') {
        setSuspendModalOpen(false);
        resetSuspendForm();
        fetchUsers(); // Recharger la liste
        alert('Utilisateur suspendu avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la suspension');
      }
    } catch (err) {
      console.error('Erreur suspension:', err);
      alert(err.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await adminService.unsuspendUser(
        selectedUser.idUser, 
        unsuspendNotes
      );
      
      if (response.status === 'success') {
        setUnsuspendModalOpen(false);
        resetUnsuspendForm();
        fetchUsers(); // Recharger la liste
        alert('Utilisateur réactivé avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la réactivation');
      }
    } catch (err) {
      console.error('Erreur réactivation:', err);
      alert(err.message || 'Erreur lors de la réactivation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await adminService.verifyUserIdentity(
        selectedUser.idUser, 
        verifyNotes
      );
      
      if (response.status === 'success') {
        setVerifyModalOpen(false);
        resetVerifyForm();
        fetchUsers(); // Recharger la liste
        alert('Identité vérifiée avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la vérification');
      }
    } catch (err) {
      console.error('Erreur vérification:', err);
      alert(err.message || 'Erreur lors de la vérification');
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions utilitaires
  const resetSuspendForm = () => {
    setSuspendReason("");
    setSuspendNotes("");
    setSelectedUser(null);
  };

  const resetUnsuspendForm = () => {
    setUnsuspendNotes("");
    setSelectedUser(null);
  };

  const resetVerifyForm = () => {
    setVerifyNotes("");
    setSelectedUser(null);
  };

  const getStatusBadge = (user) => {
    if (user.isSuspended === "1") {
      return <Badge variant="destructive">Suspendu</Badge>;
    }
    if (user.deleted) {
      return <Badge variant="secondary">Supprimé</Badge>;
    }
    return <Badge variant="default">Actif</Badge>;
  };

  const getRoleBadge = (roleId) => {
    const roles = {
      "1": { label: "Admin", variant: "destructive" },
      "2": { label: "Utilisateur", variant: "secondary" },
    };
    const role = roles[roleId] || { label: "Inconnu", variant: "secondary" };
    return <Badge variant={role.variant}>{role.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isSuspended === "0" && !user.deleted) ||
      (statusFilter === "suspended" && user.isSuspended === "1") ||
      (statusFilter === "deleted" && user.deleted);
    
    const matchesRole = roleFilter === "all" || user.roleId === roleFilter;
    
    const matchesVerified = verifiedFilter === "all" ||
      (verifiedFilter === "verified" && user.isVerified === "1") ||
      (verifiedFilter === "unverified" && user.isVerified === "0");
    
    return matchesSearch && matchesStatus && matchesRole && matchesVerified;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-2">Erreur</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchUsers}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérer et modérer les comptes utilisateurs</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{totalUsers} utilisateurs au total</span>
        </div>
      </div>

      {/* Filtres */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
                <SelectItem value="deleted">Supprimés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Utilisateur</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="unverified">Non vérifiés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Vérification</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.idUser}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">#{user.idUser}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.roleId)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.isVerified === "1" ? (
                          <Badge variant="default" className="w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Email vérifié
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">
                            <XCircle className="h-3 w-3 mr-1" />
                            Non vérifié
                          </Badge>
                        )}
                        {user.isIdentityVerified === "1" && (
                          <Badge variant="default" className="w-fit">
                            <Shield className="h-3 w-3 mr-1" />
                            Identité vérifiée
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => fetchUserDetails(user.idUser)}
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {user.isIdentityVerified === "0" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setVerifyModalOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {user.isSuspended === "0" ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setSuspendModalOpen(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              setSelectedUser(user);
                              setUnsuspendModalOpen(true);
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Modales d'action */}
      {/* Modal Suspension */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir suspendre {selectedUser?.firstName} {selectedUser?.lastName} ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspend-reason">Raison de la suspension *</Label>
              <Input
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Ex: Violation des conditions d'utilisation"
              />
            </div>
            <div>
              <Label htmlFor="suspend-notes">Notes complémentaires</Label>
              <Textarea
                id="suspend-notes"
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                placeholder="Détails supplémentaires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuspendModalOpen(false);
              resetSuspendForm();
            }}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspendUser}
              disabled={actionLoading || !suspendReason.trim()}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Réactivation */}
      <Dialog open={unsuspendModalOpen} onOpenChange={setUnsuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réactiver l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réactiver {selectedUser?.firstName} {selectedUser?.lastName} ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="unsuspend-notes">Notes complémentaires</Label>
              <Textarea
                id="unsuspend-notes"
                value={unsuspendNotes}
                onChange={(e) => setUnsuspendNotes(e.target.value)}
                placeholder="Raison de la réactivation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUnsuspendModalOpen(false);
              resetUnsuspendForm();
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleUnsuspendUser}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Réactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Vérification */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérifier l'identité</DialogTitle>
            <DialogDescription>
              Confirmer la vérification d'identité de {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="verify-notes">Notes de vérification</Label>
              <Textarea
                id="verify-notes"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Ex: Documents validés - CNI conforme"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVerifyModalOpen(false);
              resetVerifyForm();
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleVerifyUser}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Vérifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Détails utilisateur */}
      <Dialog open={userDetailsModalOpen} onOpenChange={setUserDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          
          {selectedUserDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nom complet</Label>
                  <p>{selectedUserDetails.firstName} {selectedUserDetails.lastName}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedUserDetails.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Téléphone</Label>
                  <p>{selectedUserDetails.phone}</p>
                </div>
                <div>
                  <Label className="font-semibold">Date d'inscription</Label>
                  <p>{formatDate(selectedUserDetails.createdAt)}</p>
                </div>
              </div>
              
              {selectedUserDetails.identityDocumentType && (
                <div>
                  <Label className="font-semibold">Vérification d'identité</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Type:</span> {selectedUserDetails.identityDocumentType}</p>
                    <p><span className="font-medium">Numéro:</span> {selectedUserDetails.identityDocumentNumber}</p>
                    {selectedUserDetails.identityVerifiedAt && (
                      <p><span className="font-medium">Vérifié le:</span> {formatDate(selectedUserDetails.identityVerifiedAt)}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedUserDetails.isSuspended === "1" && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <Label className="font-semibold text-red-800">Informations de suspension</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedUserDetails.suspendedAt && (
                      <p><span className="font-medium">Suspendu le:</span> {formatDate(selectedUserDetails.suspendedAt)}</p>
                    )}
                    {selectedUserDetails.suspensionReason && (
                      <p><span className="font-medium">Raison:</span> {selectedUserDetails.suspensionReason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setUserDetailsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
