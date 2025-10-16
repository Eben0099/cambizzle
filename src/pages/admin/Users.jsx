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
import { API_CONFIG } from "../../utils/constants";

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
  <div className="space-y-8">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and moderate user accounts</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
        <User className="h-4 w-4 text-[#D6BA69]" />
        <span>{totalUsers} total users</span>
      </div>
    </div>

    {/* Filters - Fixed Selects */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-11 pr-4 py-3 border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="py-3 border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="bg-white hover:bg-gray-50">All Statuses</SelectItem>
            <SelectItem value="active" className="bg-white hover:bg-gray-50">Active</SelectItem>
            <SelectItem value="suspended" className="bg-white hover:bg-gray-50">Suspended</SelectItem>
            <SelectItem value="deleted" className="bg-white hover:bg-gray-50">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="py-3 border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg bg-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="bg-white hover:bg-gray-50">All Roles</SelectItem>
            <SelectItem value="1" className="bg-white hover:bg-gray-50">Admin</SelectItem>
            <SelectItem value="2" className="bg-white hover:bg-gray-50">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
          <SelectTrigger className="py-3 border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg bg-white">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="bg-white hover:bg-gray-50">All</SelectItem>
            <SelectItem value="verified" className="bg-white hover:bg-gray-50">Verified</SelectItem>
            <SelectItem value="unverified" className="bg-white hover:bg-gray-50">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Users Grid - 4 per row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user.idUser} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* User Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  {user.photoUrl ? (
                    <img 
                      src={`${API_CONFIG.BASE_URL}/${user.photoUrl}`} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#D6BA69] flex items-center justify-center ring-2 ring-gray-200">
                      <span className="text-white text-base sm:text-lg font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">ID: #{user.idUser}</p>
                  
                  {/* Status & Role Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getRoleBadge(user.roleId)}
                    {getStatusBadge(user)}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Footer - Actions */}
            <div className="p-4 bg-gray-50">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-between items-center">
                {/* Actions */}
                <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
                  <Button 
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                    onClick={() => fetchUserDetails(user.idUser)}
                    disabled={actionLoading}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    View
                  </Button>
                  
                  {user.isIdentityVerified === "0" && (
                    <Button 
                      size="sm"
                      className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors shadow-sm text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setVerifyModalOpen(true);
                      }}
                    >
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Verify
                    </Button>
                  )}
                </div>

                {/* Suspend/Unsuspend Button */}
                <div className="flex gap-1 sm:gap-2">
                  {user.isSuspended === "0" ? (
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setSuspendModalOpen(true);
                      }}
                    >
                      <Ban className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setUnsuspendModalOpen(true);
                      }}
                    >
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Unsuspend
                    </Button>
                  )}
                </div>
              </div>

              {/* Registration Date & Verification */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  {user.isVerified === "1" ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Email verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Email unverified
                    </span>
                  )}
                  {user.isIdentityVerified === "1" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      ID verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex items-center justify-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <Button
          className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <span className="px-4 py-2 text-sm text-gray-600 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )}

    {/* Modale - Détails utilisateur (View) */}
    <Dialog open={userDetailsModalOpen} onOpenChange={setUserDetailsModalOpen}>
      <DialogContent className="max-w-lg bg-white shadow-xl border border-gray-200" style={{background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'}}>
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>
        {selectedUserDetails ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {selectedUserDetails.photoUrl ? (
                <img src={`${API_CONFIG.BASE_URL}/${selectedUserDetails.photoUrl}`} alt="Photo" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[#D6BA69] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{selectedUserDetails.firstName[0]}{selectedUserDetails.lastName[0]}</span>
                </div>
              )}
              <div>
                <div className="font-semibold">{selectedUserDetails.firstName} {selectedUserDetails.lastName}</div>
                <div className="text-xs text-gray-500">ID: #{selectedUserDetails.idUser}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700">Email: {selectedUserDetails.email}</div>
            <div className="text-sm text-gray-700">Téléphone: {selectedUserDetails.phone || 'N/A'}</div>
            <div className="text-sm text-gray-700">Rôle: {getRoleBadge(selectedUserDetails.roleId)}</div>
            <div className="text-sm text-gray-700">Statut: {getStatusBadge(selectedUserDetails)}</div>
            <div className="text-sm text-gray-700">Inscrit le: {formatDate(selectedUserDetails.createdAt)}</div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Chargement...</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setUserDetailsModalOpen(false)} className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-white border-[#D6BA69]">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modale - Vérification identité (Verify) */}
    <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
      <DialogContent className="max-w-md bg-white shadow-xl border border-gray-200" style={{background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'}}>
        <DialogHeader>
          <DialogTitle>Vérifier l'identité</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-gray-700">Raison de la vérification :</div>
          <Textarea
            placeholder="Ajouter une note ou raison (optionnel)"
            value={verifyNotes}
            onChange={e => setVerifyNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setVerifyModalOpen(false)} className="bg-gray-200 text-gray-700">Annuler</Button>
          <Button onClick={handleVerifyUser} disabled={actionLoading} className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-white border-[#D6BA69]">Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modale - Suspension utilisateur (Suspend) */}
    <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
      <DialogContent className="max-w-md bg-white shadow-xl border border-gray-200" style={{background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'}}>
        <DialogHeader>
          <DialogTitle>Suspendre l'utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="suspendReason">Raison de la suspension *</Label>
          <Input
            id="suspendReason"
            placeholder="Raison de la suspension"
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
            required
          />
          <Label htmlFor="suspendNotes">Notes (optionnel)</Label>
          <Textarea
            id="suspendNotes"
            placeholder="Notes supplémentaires"
            value={suspendNotes}
            onChange={e => setSuspendNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSuspendModalOpen(false)} className="bg-gray-200 text-gray-700">Annuler</Button>
          <Button onClick={handleSuspendUser} disabled={actionLoading} className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-white border-[#D6BA69]">Suspendre</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
};

export default Users;
