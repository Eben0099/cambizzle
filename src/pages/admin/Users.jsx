import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import logger from "../../utils/logger";
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
  AlertTriangle, Calendar, Phone, Mail, User, Loader2, Download
} from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";
import Loader from "../../components/ui/Loader";
import adminService from "../../services/adminService";
import { API_CONFIG } from "../../utils/constants";
import { SERVER_BASE_URL } from "../../config/api";
import { useToast } from "../../components/toast/useToast";

// PDF Viewer imports
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const Users = () => {
  // States
  const { t } = useTranslation();
  const { showToast } = useToast();
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
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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
        throw new Error(response.message || t('admin.users.errorLoading'));
      }
    } catch (err) {
      logger.error('Users error:', err);
      setError(err.message || t('admin.users.errorLoading'));
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
        throw new Error(response.message || t('admin.users.errorLoadingDetails'));
      }
    } catch (err) {
      logger.error('User details error:', err);
      showToast({ type: 'error', message: err.message || t('admin.users.errorLoadingDetails') });
    } finally {
      setActionLoading(false);
    }
  };

  // Actions
  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      showToast({ type: 'error', message: t('admin.users.fillSuspensionReason') });
      return;
    }
    try {
      setActionLoading(true);
      const response = await adminService.suspendUser(selectedUser.idUser, suspendReason, suspendNotes);
      if (response.status === 'success') {
        setSuspendModalOpen(false);
        resetSuspendForm();
        fetchUsers();
        showToast({ type: 'success', message: t('admin.users.userSuspended') });
      } else {
        throw new Error(response.message || t('admin.users.errorSuspension'));
      }
    } catch (err) {
      logger.error('Suspension error:', err);
      showToast({ type: 'error', message: err.message || t('admin.users.errorSuspension') });
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
        showToast({ type: 'success', message: t('admin.users.userReactivated') });
      } else {
        throw new Error(response.message || t('admin.users.errorReactivation'));
      }
    } catch (err) {
      logger.error('Reactivation error:', err);
      showToast({ type: 'error', message: err.message || t('admin.users.errorReactivation') });
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
        showToast({ type: 'success', message: t('admin.users.identityVerified') });
      } else {
        throw new Error(response.message || t('admin.users.errorVerification'));
      }
    } catch (err) {
      logger.error('Verification error:', err);
      showToast({ type: 'error', message: err.message || t('admin.users.errorVerification') });
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
      return <Badge className="bg-red-100 text-red-800 text-xs">{t('admin.users.suspended')}</Badge>;
    }
    if (user.deleted) {
      return <Badge className="bg-gray-100 text-gray-800 text-xs">{t('admin.users.deleted')}</Badge>;
    }
    if ((user.identityDocumentUrl || user.identity_document_url) && !(user.isVerified === "1" || user.isVerified === 1 || user.isIdentityVerified === "1" || user.isIdentityVerified === 1)) {
      return <Badge className="bg-blue-100 text-blue-100 hover:bg-blue-100 text-blue-800 text-xs border-blue-200">{t('admin.users.documentSubmitted')}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 text-xs">{t('admin.users.active')}</Badge>;
  };

  const getRoleBadge = (roleId) => {
    const roles = {
      "1": { label: t('admin.users.admin'), className: "bg-red-100 text-red-800 text-xs" },
      "2": { label: t('admin.users.user'), className: "bg-gray-100 text-gray-800 text-xs" },
    };
    const role = roles[roleId] || { label: t('admin.users.unknown'), className: "bg-gray-100 text-gray-800 text-xs" };
    return <Badge className={role.className}>{role.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Frontend filtering
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && user.isSuspended === "0" && !user.deleted) ||
      (statusFilter === "suspended" && user.isSuspended === "1") ||
      (statusFilter === "deleted" && user.deleted);

    const matchesRole = roleFilter === "all" || user.roleId === roleFilter;

    const matchesVerified = verifiedFilter === "all" ||
      (verifiedFilter === "verified" && (user.isVerified === "1" || user.isVerified === 1 || user.isIdentityVerified === "1" || user.isIdentityVerified === 1)) ||
      (verifiedFilter === "unverified" && (user.isVerified === "0" || user.isVerified === 0 || !user.isVerified) && (user.isIdentityVerified === "0" || user.isIdentityVerified === 0 || !user.isIdentityVerified));

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
    return <Loader text={t('admin.users.loading')} className="min-h-[400px]" />;
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
            {t('admin.users.retry')}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{filteredUsers.length} {t('admin.users.users')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToExcel(filteredUsers, 'users', {
              columns: [
                { header: 'ID', key: 'idUser' },
                { header: 'First Name', key: 'firstName' },
                { header: 'Last Name', key: 'lastName' },
                { header: 'Email', key: 'email' },
                { header: 'Phone', key: 'phone' },
                { header: 'Role', key: 'roleId' },
                { header: 'Status', key: 'isSuspended' },
                { header: 'Verified', key: 'isVerified' },
                { header: 'Created At', key: 'createdAt' },
              ],
              sheetName: 'Users'
            })}
            className="h-9 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4" />
            {t('admin.users.exportExcel')}
          </Button>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm">
            <User className="h-4 w-4 text-[#D6BA69]" />
            <span className="text-xs text-gray-600">{filteredUsers.length} {t('admin.users.total')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">{t('admin.users.filtersAndSearch')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('admin.users.search')}
              className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder={t('admin.users.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.users.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('admin.users.active')}</SelectItem>
              <SelectItem value="suspended">{t('admin.users.suspended')}</SelectItem>
              <SelectItem value="deleted">{t('admin.users.deleted')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder={t('admin.users.role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.users.allRoles')}</SelectItem>
              <SelectItem value="1">{t('admin.users.admin')}</SelectItem>
              <SelectItem value="2">{t('admin.users.user')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="h-10 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
              <SelectValue placeholder={t('admin.users.verification')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.users.all')}</SelectItem>
              <SelectItem value="verified">{t('admin.users.verified')}</SelectItem>
              <SelectItem value="unverified">{t('admin.users.unverified')}</SelectItem>
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
                        src={`${SERVER_BASE_URL}/${user.photoUrl}`.replace(/\/+/g, '/')}
                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-12 w-12 rounded-full bg-gradient-to-br from-[#D6BA69] to-[#C5A952] items-center justify-center ${user.photoUrl ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-white text-sm font-bold">
                        {(user.firstName || 'U')[0]}{(user.lastName || '')[0] || ''}
                      </span>
                    </div>
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
                      {t('admin.users.details')}
                    </Button>
                    {!(user.isVerified === "1" || user.isVerified === 1 || user.isIdentityVerified === "1" || user.isIdentityVerified === 1) && (
                      <Button
                        size="sm"
                        className="bg-white border border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10 h-8 text-xs px-3 rounded-lg"
                        onClick={() => {
                          setSelectedUser(user);
                          setVerifyModalOpen(true);
                        }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {t('admin.users.verify')}
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className={`h-8 text-xs px-3 rounded-lg ${user.isSuspended === "0"
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
                        {t('admin.users.suspend')}
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        {t('admin.users.reactivate')}
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                  </span>
                  <span className={`flex items-center gap-1 ${(user.isVerified === "1" || user.isVerified === 1 || user.isIdentityVerified === "1" || user.isIdentityVerified === 1)
                      ? "text-green-600"
                      : (user.identityDocumentUrl || user.identity_document_url)
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}>
                    <Shield className="h-3 w-3" />
                    {(user.isVerified === "1" || user.isVerified === 1 || user.isIdentityVerified === "1" || user.isIdentityVerified === 1)
                      ? t('admin.users.verified')
                      : (user.identityDocumentUrl || user.identity_document_url)
                        ? t('admin.users.documentSubmitted')
                        : t('admin.users.unverified')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">{t('admin.users.noUsers')}</h3>
            <p className="text-xs text-gray-500">{t('admin.users.noUsersHint')}</p>
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
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.users.userDetails')}</DialogTitle>
          </DialogHeader>
          {selectedUserDetails ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {(selectedUserDetails.photo_url || selectedUserDetails.photoUrl) ? (
                  <img
                    src={`${SERVER_BASE_URL}/${selectedUserDetails.photo_url || selectedUserDetails.photoUrl}`.replace(/\/+/g, '/')}
                    alt="Photo"
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br from-[#D6BA69] to-[#C5A952] items-center justify-center ${(selectedUserDetails.photo_url || selectedUserDetails.photoUrl) ? 'hidden' : 'flex'}`}
                >
                  <span className="text-white text-sm font-bold">
                    {(selectedUserDetails.first_name || selectedUserDetails.firstName || 'U')[0]}{(selectedUserDetails.last_name || selectedUserDetails.lastName || '')[0] || ''}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{selectedUserDetails.first_name || selectedUserDetails.firstName} {selectedUserDetails.last_name || selectedUserDetails.lastName}</div>
                  <div className="text-xs text-gray-500">ID: #{selectedUserDetails.id_user || selectedUserDetails.idUser}</div>
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
                  {t('admin.users.roleLabel')} <span className="ml-1">{selectedUserDetails.role || selectedUserDetails.roleId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  {t('admin.users.statusLabel')} <span className="ml-1">{
                    selectedUserDetails.is_verified !== undefined
                      ? (selectedUserDetails.is_verified === 1 || selectedUserDetails.is_verified === "1" ? t('admin.users.verified') : selectedUserDetails.is_verified === 2 || selectedUserDetails.is_verified === "2" ? t('admin.users.pending') : t('admin.users.unverified'))
                      : (selectedUserDetails.isVerified === 1 || selectedUserDetails.isVerified === "1" ? t('admin.users.verified') : selectedUserDetails.isVerified === 2 || selectedUserDetails.isVerified === "2" ? t('admin.users.pending') : t('admin.users.unverified'))
                  }</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {t('admin.users.registered')} {formatDate(selectedUserDetails.created_at || selectedUserDetails.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('admin.users.referralCode')}</span> {selectedUserDetails.referral_code || selectedUserDetails.referralCode || 'N/A'}
                </div>
                {/* Identity Section */}
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                  <div className="font-semibold mb-1">{t('admin.users.identity')}</div>
                  <div className="text-xs text-gray-600">{t('admin.users.identityType')} <span className="font-medium">{selectedUserDetails.identity_document_type || selectedUserDetails.identityDocumentType || 'N/A'}</span></div>
                  <div className="text-xs text-gray-600">{t('admin.users.identityNumber')} <span className="font-medium">{selectedUserDetails.identity_document_number || selectedUserDetails.identityDocumentNumber || 'N/A'}</span></div>
                  <div className="text-xs text-gray-600">{t('admin.users.submissionDate')} <span className="font-medium">{selectedUserDetails.created_at ? formatDate(selectedUserDetails.created_at) : selectedUserDetails.createdAt ? formatDate(selectedUserDetails.createdAt) : 'N/A'}</span></div>
                  <div className="text-xs text-gray-600">{t('admin.users.identityStatus')} <span className="font-medium">{selectedUserDetails.identity?.status_label || selectedUserDetails.identityStatusLabel || 'N/A'}</span></div>
                  <div className="text-xs text-gray-600">{t('admin.users.verifiedAt')} <span className="font-medium">{selectedUserDetails.identity_verified_at ? formatDate(selectedUserDetails.identity_verified_at) : selectedUserDetails.identityVerifiedAt ? formatDate(selectedUserDetails.identityVerifiedAt) : t('admin.users.notVerified')}</span></div>
                  {selectedUserDetails.identity_review_reason && (
                    <div className="text-xs text-red-600">{t('admin.users.rejectionReason')} {selectedUserDetails.identity_review_reason}</div>
                  )}
                  {/* Document display/download */}
                  {(selectedUserDetails.identity_document_url || selectedUserDetails.identityDocumentUrl) && (
                    <div className="mt-2">
                      {(() => {
                        const url = `${SERVER_BASE_URL}/${selectedUserDetails.identity_document_url || selectedUserDetails.identityDocumentUrl}`.replace(/\/+/g, '/');
                        const isPdf = url.toLowerCase().endsWith('.pdf');
                        if (isPdf) {
                          return (
                            <div>
                              <a href={url} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mb-2 block">{t('admin.users.downloadPdf')}</a>
                              <div className="mt-2 border rounded overflow-hidden" style={{ height: '400px' }}>
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                  <Viewer
                                    fileUrl={url}
                                    plugins={[defaultLayoutPluginInstance]}
                                  />
                                </Worker>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <a href={url} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mb-2 block">{t('admin.users.downloadImage')}</a>
                              <div className="mt-2">
                                <img src={url} alt="Document identité" className="max-h-48 rounded border" />
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">{t('admin.users.loadingDetails')}</div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setUserDetailsModalOpen(false)}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {t('admin.users.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Verify User */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.users.verifyIdentity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="verifyNotes" className="text-sm font-medium text-gray-700">{t('admin.users.notesOptional')}</Label>
            <Textarea
              id="verifyNotes"
              placeholder={t('admin.users.verificationReason')}
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
              {t('admin.users.cancel')}
            </Button>
            <Button
              onClick={handleVerifyUser}
              disabled={actionLoading}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.users.verifying')}
                </>
              ) : (
                t('admin.users.verify')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Suspend User */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.users.suspendUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="suspendReason" className="text-sm font-medium text-gray-700">
              {t('admin.users.suspensionReason')}
            </Label>
            <Input
              id="suspendReason"
              placeholder={t('admin.users.reasonRequired')}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="h-10 text-sm rounded-lg"
              required
            />
            <Label htmlFor="suspendNotes" className="text-sm font-medium text-gray-700">
              {t('admin.users.notesOptional')}
            </Label>
            <Textarea
              id="suspendNotes"
              placeholder={t('admin.users.additionalNotes')}
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
              {t('admin.users.cancel')}
            </Button>
            <Button
              onClick={handleSuspendUser}
              disabled={actionLoading || !suspendReason.trim()}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.users.suspending')}
                </>
              ) : (
                t('admin.users.suspend')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Unsuspend User */}
      <Dialog open={unsuspendModalOpen} onOpenChange={setUnsuspendModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.users.reactivateUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="unsuspendNotes" className="text-sm font-medium text-gray-700">
              {t('admin.users.notesOptional')}
            </Label>
            <Textarea
              id="unsuspendNotes"
              placeholder={t('admin.users.reactivationReason')}
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
              {t('admin.users.cancel')}
            </Button>
            <Button
              onClick={handleUnsuspendUser}
              disabled={actionLoading}
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.users.reactivating')}
                </>
              ) : (
                t('admin.users.reactivate')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;