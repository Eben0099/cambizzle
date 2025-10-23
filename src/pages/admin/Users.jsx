import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import Pagination from "../../components/ui/Pagination";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, UserCheck, UserX, Shield, Ban, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, Calendar, Phone, Mail, User, Loader2
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import adminService from "../../services/adminService";
import { API_CONFIG } from "../../utils/constants";

const Users = () => {
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendNotes, setSuspendNotes] = useState("");
  const [unsuspendNotes, setUnsuspendNotes] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");

  const USERS_PER_PAGE = 8;

  // Fetch all users (without server pagination)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers(); // No server pagination
      if (response.status === 'success') {
        setUsers(response.data.users || []);
      } else {
        throw new Error(response.message || 'Error loading users');
      }
    } catch (err) {
      console.error('Users error:', err);
      setError(err.message || 'Error loading users');
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
        throw new Error(response.message || 'Error loading details');
      }
    } catch (err) {
      console.error('User details error:', err);
      alert(err.message || 'Error loading details');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions
  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      alert('Please fill in the suspension reason');
      return;
    }
    try {
      setActionLoading(true);
      const response = await adminService.suspendUser(selectedUser.idUser, suspendReason, suspendNotes);
      if (response.status === 'success') {
        setSuspendModalOpen(false);
        resetSuspendForm();
        fetchUsers();
        alert('User suspended successfully');
      } else {
        throw new Error(response.message || 'Error during suspension');
      }
    } catch (err) {
      console.error('Suspension error:', err);
      alert(err.message || 'Error during suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.unsuspendUser(selectedUser.idUser, unsuspendNotes);
      if (response.status === 'success') {
        setUnsuspendModalOpen(false);
        resetUnsuspendForm();
        fetchUsers();
        alert('User reactivated successfully');
      } else {
        throw new Error(response.message || 'Error during reactivation');
      }
    } catch (err) {
      console.error('Reactivation error:', err);
      alert(err.message || 'Error during reactivation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await adminService.verifyUserIdentity(selectedUser.idUser, verifyNotes);
      if (response.status === 'success') {
        setVerifyModalOpen(false);
        resetVerifyForm();
        fetchUsers();
        alert('Identity verified successfully');
      } else {
        throw new Error(response.message || 'Error during verification');
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert(err.message || 'Error during verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset forms
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

  // Formatting and badges
  const getStatusBadge = (user) => {
    if (user.isSuspended === "1") {
      return <Badge className="bg-red-100 text-red-800 text-xs">Suspended</Badge>;
    }
    if (user.deleted) {
      return <Badge className="bg-gray-100 text-gray-800 text-xs">Deleted</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
  };

  const getRoleBadge = (roleId) => {
    const roles = {
      "1": { label: "Admin", className: "bg-red-100 text-red-800 text-xs" },
      "2": { label: "User", className: "bg-gray-100 text-gray-800 text-xs" },
    };
    const role = roles[roleId] || { label: "Unknown", className: "bg-gray-100 text-gray-800 text-xs" };
    return <Badge className={role.className}>{role.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Frontend filtering
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Frontend pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page to 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, verifiedFilter]);

  // Loading state
  if (loading && users.length === 0) {
    return <Loader text="Loading users..." className="min-h-[400px]" />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            onClick={fetchUsers}
            className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm px-4 rounded-lg"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{filteredUsers.length} users</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm">
          <User className="h-4 w-4 text-[#D6BA69]" />
          <span className="text-xs text-gray-600">{filteredUsers.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Filters & Search</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <div
              key={user.idUser}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {user.photoUrl ? (
                      <img
                        src={`${API_CONFIG.BASE_URL}/${user.photoUrl}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D6BA69] to-[#C5A952] flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-gray-500">ID: #{user.idUser}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getRoleBadge(user.roleId)}
                      {getStatusBadge(user)}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#D6BA69] hover:bg-[#C5A952] text-white h-8 text-xs px-3 rounded-lg shadow-sm"
                      onClick={() => fetchUserDetails(user.idUser)}
                      disabled={actionLoading}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {user.isIdentityVerified === "0" && (
                      <Button
                        size="sm"
                        className="bg-white border border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10 h-8 text-xs px-3 rounded-lg"
                        onClick={() => {
                          setSelectedUser(user);
                          setVerifyModalOpen(true);
                        }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className={`h-8 text-xs px-3 rounded-lg ${
                      user.isSuspended === "0"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      user.isSuspended === "0"
                        ? setSuspendModalOpen(true)
                        : setUnsuspendModalOpen(true);
                    }}
                  >
                    {user.isSuspended === "0" ? (
                      <>
                        <Ban className="h-3 w-3 mr-1" />
                        Suspend
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Reactivate
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                  </span>
                  <span className={`flex items-center gap-1 ${user.isIdentityVerified === "1" ? "text-green-600" : "text-gray-600"}`}>
                    <Shield className="h-3 w-3" />
                    {user.isIdentityVerified === "1" ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No users</h3>
            <p className="text-xs text-gray-500">Adjust filters to see results</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={currentPage < totalPages}
          hasPrevious={currentPage > 1}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal: User Details */}
      <Dialog open={userDetailsModalOpen} onOpenChange={setUserDetailsModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">User Details</DialogTitle>
          </DialogHeader>
          {selectedUserDetails ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {selectedUserDetails.photoUrl ? (
                  <img
                    src={`${API_CONFIG.BASE_URL}/${selectedUserDetails.photoUrl}`}
                    alt="Photo"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D6BA69] to-[#C5A952] flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {selectedUserDetails.firstName[0]}{selectedUserDetails.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{selectedUserDetails.firstName} {selectedUserDetails.lastName}</div>
                  <div className="text-xs text-gray-500">ID: #{selectedUserDetails.idUser}</div>
                </div>
              </div>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {selectedUserDetails.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {selectedUserDetails.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Role: {getRoleBadge(selectedUserDetails.roleId)}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Status: {getStatusBadge(selectedUserDetails)}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Registered: {formatDate(selectedUserDetails.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">Loading...</div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setUserDetailsModalOpen(false)}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Verify User */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Verify Identity</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="verifyNotes" className="text-sm font-medium text-gray-700">Notes (optional)</Label>
            <Textarea
              id="verifyNotes"
              placeholder="Verification reason"
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              className="h-20 text-sm rounded-lg"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => setVerifyModalOpen(false)}
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyUser}
              disabled={actionLoading}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Suspend User */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Suspend User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="suspendReason" className="text-sm font-medium text-gray-700">
              Suspension Reason *
            </Label>
            <Input
              id="suspendReason"
              placeholder="Reason (required)"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="h-10 text-sm rounded-lg"
              required
            />
            <Label htmlFor="suspendNotes" className="text-sm font-medium text-gray-700">
              Notes (optional)
            </Label>
            <Textarea
              id="suspendNotes"
              placeholder="Additional notes"
              value={suspendNotes}
              onChange={(e) => setSuspendNotes(e.target.value)}
              className="h-20 text-sm rounded-lg"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => setSuspendModalOpen(false)}
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSuspendUser}
              disabled={actionLoading || !suspendReason.trim()}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                'Suspend'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Unsuspend User */}
      <Dialog open={unsuspendModalOpen} onOpenChange={setUnsuspendModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Reactivate User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="unsuspendNotes" className="text-sm font-medium text-gray-700">
              Notes (optional)
            </Label>
            <Textarea
              id="unsuspendNotes"
              placeholder="Reactivation reason"
              value={unsuspendNotes}
              onChange={(e) => setUnsuspendNotes(e.target.value)}
              className="h-20 text-sm rounded-lg"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => setUnsuspendModalOpen(false)}
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnsuspendUser}
              disabled={actionLoading}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reactivating...
                </>
              ) : (
                'Reactivate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;