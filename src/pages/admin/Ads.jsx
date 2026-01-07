import { SERVER_BASE_URL, API_BASE_URL } from '../../config/api';
import { getPhotoUrl } from '../../utils/helpers';
// Ads.jsx
import { useState, useEffect } from 'react';
import Pagination from '../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';
import storageService from '../../services/storageService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Loader as LucideLoader,
  Zap,
  Shield,
  Download,
  Trash2
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import Loader from "../../components/ui/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '../../components/toast/useToast';

/**
 * Ads management screen (single-file)
 *
 * Notes:
 * - Uses Tailwind + shadcn/ui + lucide-react (same stack as original)
 * - Responsive layout: grid adapts from 1 -> 2 -> 3 cols; images scale; modals are constrained
 * - Keep adminService functions: getAds, getPendingAds, approveAd, rejectAd
 */

const Ads = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Data
  const [ads, setAds] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);

  // Pagination / filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'pending'

  // Selected ad + modals
  const [selectedAd, setSelectedAd] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form fields for moderation
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  // Fetch all ads and pending ads on mount
  useEffect(() => {
    fetchAllAds();
    fetchPendingAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllAds = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAds(); // expects { ads: [...] } or similar
      setAds(data?.ads || []);
    } catch (err) {
      showToast({ type: 'error', message: err?.message || t('admin.ads.errorLoadingAds') });
      logger.error('Error fetching all ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingAds(); // expects { data: [...] } or similar
      setPendingAds(response?.data || []);
    } catch (err) {
      showToast({ type: 'error', message: err?.message || t('admin.ads.errorLoadingPending') });
      logger.error('Error fetching pending ads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedAd) return;
    try {
      setLoading(true);
      await adminService.approveAd(selectedAd.id, approveNotes);
      setShowApproveModal(false);
      setApproveNotes('');
      setSelectedAd(null);
      if (viewMode === 'pending') {
        await fetchPendingAds();
      } else {
        await fetchAllAds();
      }
    } catch (err) {
      showToast({ type: 'error', message: err?.message || t('admin.ads.errorApproving') });
      logger.error('Error approving ad:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reject handler
  const handleReject = async (contactViaWhatsApp = false) => {
    if (!selectedAd || !rejectReason) return;
    try {
      setLoading(true);
      await adminService.rejectAd(selectedAd.id, rejectReason, rejectNotes);

      // Envoyer notification WhatsApp si demandé et si le téléphone est disponible
      if (contactViaWhatsApp && selectedAd.user?.phone) {
        const phoneNumber = selectedAd.user.phone.replace(/\s+/g, '');
        const message = encodeURIComponent(
          `Hello ${selectedAd.user.firstName || ''},\n\n` +
          `Your ad "${selectedAd.title}" has been rejected.\n\n` +
          `Reason: ${rejectReason}\n` +
          (rejectNotes ? `Notes: ${rejectNotes}\n\n` : '\n') +
          `Please review and resubmit your ad with the necessary corrections.\n\n` +
          `Best regards,\nCambizzle Team`
        );

        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      }

      setShowRejectModal(false);
      setRejectReason('');
      setRejectNotes('');
      setSelectedAd(null);
      if (viewMode === 'pending') {
        await fetchPendingAds();
      } else {
        await fetchAllAds();
      }
      showToast({ type: 'success', message: t('admin.ads.adRejected') });
    } catch (err) {
      showToast({ type: 'error', message: err?.message || t('admin.ads.errorRejecting') });
      logger.error('Error rejecting ad:', err);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp contact logic for already rejected ads
  const openWhatsAppModal = (ad) => {
    setSelectedAd(ad);
    setWhatsAppMessage(
      `Hello ${ad.user?.firstName || ''}, I'm contacting you regarding your rejected ad "${ad.title}".`
    );
    setShowWhatsAppModal(true);
  };

  const handleSendWhatsApp = () => {
    if (!selectedAd || !selectedAd.user?.phone) return;
    const phoneNumber = selectedAd.user.phone.replace(/\s+/g, '');
    const encodedMessage = encodeURIComponent(whatsAppMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setShowWhatsAppModal(false);
    setSelectedAd(null);
    setWhatsAppMessage('');
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedAd) return;
    try {
      setLoading(true);
      const token = storageService.getToken();
      const response = await fetch(`${API_BASE_URL}/ads/${selectedAd.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedAd(null);
        showToast({ type: 'success', message: t('admin.ads.adDeleted') });
        if (viewMode === 'pending') {
          await fetchPendingAds();
        } else {
          await fetchAllAds();
        }
      } else {
        throw new Error('Failed to delete ad');
      }
    } catch (err) {
      showToast({ type: 'error', message: err?.message || t('admin.ads.errorDeleting') });
      logger.error('Error deleting ad:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal openers
  const openApproveModal = (ad) => {
    setSelectedAd(ad);
    setShowApproveModal(true);
  };

  const openRejectModal = (ad) => {
    setSelectedAd(ad);
    setShowRejectModal(true);
  };

  const openDeleteModal = (ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (ad) => {
    setSelectedAd(ad);
    setShowDetailsModal(true);
    // Optionally keep navigation: navigate(`/ads/${ad.slug}`);
  };

  // Moderation badge
  const getModerationStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: t('admin.ads.pending'), className: 'bg-yellow-100 text-yellow-800 text-xs', Icon: Clock },
      approved: { label: t('admin.ads.approved'), className: 'bg-green-100 text-green-800 text-xs', Icon: CheckCircle },
      rejected: { label: t('admin.ads.rejected'), className: 'bg-red-100 text-red-800 text-xs', Icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.Icon;
    return (
      <Badge className={`inline-flex items-center ${config.className} py-1 px-2 rounded`}>
        <Icon className="w-3 h-3 mr-1" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Formatters
  const formatPrice = (price) => {
    // Keep readable, show currency XAF. Use English locale for labels while keeping currency consistent.
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
      }).format(price);
    } catch {
      return `${price} XAF`;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Frontend filtering & pagination
  const filteredAds = viewMode === 'pending'
    ? pendingAds
    : filterStatus === 'all'
      ? ads.filter(ad =>
        !searchTerm ||
        (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      : ads.filter(ad =>
        ad.moderationStatus === filterStatus && (
          !searchTerm ||
          (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ad.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const totalPages = Math.max(1, Math.ceil(filteredAds.length / itemsPerPage));
  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // scroll to top of list on page change for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, viewMode]);

  // Initial loading state indicator
  if (loading && !ads.length && !pendingAds.length) {
    return (
      <div className="min-h-[360px] flex items-center justify-center">
        <Loader text={t('admin.ads.loading')} className="min-h-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.ads.title')}</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{filteredAds.length} {t('admin.ads.ads')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToExcel(filteredAds, 'ads', {
              columns: [
                { header: 'ID', key: 'id' },
                { header: 'Title', key: 'title' },
                { header: 'Price', key: 'price' },
                { header: 'Category', key: 'categoryName' },
                { header: 'Subcategory', key: 'subcategoryName' },
                { header: 'Location', key: 'locationName' },
                { header: 'Status', key: 'status' },
                { header: 'Moderation', key: 'moderationStatus' },
                { header: 'Boosted', key: 'isBoosted' },
                { header: 'Views', key: 'viewCount' },
                { header: 'Created At', key: 'createdAt' },
              ],
              sheetName: 'Ads'
            })}
            className="h-9 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
            disabled={filteredAds.length === 0}
          >
            <Download className="h-4 w-4" />
            {t('admin.ads.exportExcel')}
          </Button>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm">
            <Tag className="h-4 w-4 text-[#D6BA69]" />
            <span className="text-xs text-gray-600">{filteredAds.length} {t('admin.ads.total')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">{t('admin.ads.filtersAndSearch')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* View mode */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2 text-[#D6BA69]" />
              {t('admin.ads.displayMode')}
            </Label>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
                className={`flex-1 h-9 text-xs rounded-lg ${viewMode === 'all'
                  ? 'bg-[#D6BA69] hover:bg-[#C5A952] text-white'
                  : 'bg-white border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10'}`}
                aria-pressed={viewMode === 'all'}
              >
                {t('admin.ads.all')}
              </Button>

              <Button
                variant={viewMode === 'pending' ? 'default' : 'outline'}
                onClick={() => setViewMode('pending')}
                className={`flex-1 h-9 text-xs rounded-lg ${viewMode === 'pending'
                  ? 'bg-[#D6BA69] hover:bg-[#C5A952] text-white'
                  : 'bg-white border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10'}`}
                aria-pressed={viewMode === 'pending'}
              >
                {t('admin.ads.pending')}
              </Button>
            </div>
          </div>

          {/* Status filter (only when viewing all) */}
          {viewMode === 'all' && (
            <>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.ads.status')}</Label>
                <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val)}>
                  <SelectTrigger className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
                    <SelectValue placeholder={t('admin.ads.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.ads.all')}</SelectItem>
                    <SelectItem value="pending">{t('admin.ads.pending')}</SelectItem>
                    <SelectItem value="approved">{t('admin.ads.approved')}</SelectItem>
                    <SelectItem value="rejected">{t('admin.ads.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2 text-[#D6BA69]" />
                  {t('admin.ads.search')}
                </Label>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                  aria-label={t('admin.ads.search')}
                />

              </div>
            </>
          )}
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedAds.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">{t('admin.ads.noAds')}</h3>
            <p className="text-xs text-gray-500">{t('admin.ads.noAdsHint')}</p>
          </div>
        ) : (
          paginatedAds.map((ad) => (
            <article
              key={ad.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col"
              aria-labelledby={`ad-title-${ad.id}`}
            >
              <div className="p-4 flex-1">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {ad.photos && ad.photos.length > 0 ? (
                      <img
                        src={getPhotoUrl(ad.photos[0].originalUrl || ad.photos[0].url || ad.photos[0])}
                        alt={ad.photos[0].altText || ad.title || 'Ad image'}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h3 id={`ad-title-${ad.id}`} className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {ad.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {ad.isBoosted == "1" && (
                            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" title="Annonce boostée" />
                          )}
                          {(ad.userIdentityVerified === 1 || ad.userIdentityVerified === "1" || ad.userIdentityVerified === true) && (
                            <Shield className="h-4 w-4 text-green-500 fill-green-500" title="Utilisateur vérifié" />
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">{getModerationStatusBadge(ad.moderationStatus)}</div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{ad.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                        <span className="font-medium">{formatPrice(ad.price)}</span>
                      </div>

                      <div className="flex items-center truncate">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{ad.locationName || '—'}</span>
                      </div>

                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        <span className="truncate">{ad.categoryName || '—'}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="truncate">{formatDate(ad.createdAt)}</span>
                      </div>
                    </div>

                    {ad.moderationNotes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-700">
                        <span className="font-medium">{t('admin.ads.notes')} </span>
                        <span>{ad.moderationNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-[#D6BA69] hover:bg-[#C5A952] text-white rounded-lg flex items-center"
                      onClick={() => navigate(`/ads/${ad.slug}`)}
                      aria-label={`View details for ${ad.title}`}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>

                    {ad.moderationStatus === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
                          onClick={() => openApproveModal(ad)}
                          aria-label={`Approve ${ad.title}`}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
                          onClick={() => openRejectModal(ad)}
                          aria-label={`Reject ${ad.title}`}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    {ad.moderationStatus === 'rejected' && ad.user?.phone && (
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center"
                        onClick={() => openWhatsAppModal(ad)}
                        title="Contact via WhatsApp"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.631 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
                      onClick={() => openDeleteModal(ad)}
                      aria-label={`Delete ${ad.title}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 hidden sm:block">
                    {/* small meta on larger screens */}
                    ID: {ad.id}
                  </div>
                </div>
              </div>
            </article>
          ))
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

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.ads.approveAd')}</DialogTitle>
            <p className="text-sm text-gray-700">
              {t('admin.ads.confirmApproval')} <strong>{selectedAd?.title}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Label htmlFor="approveNotes" className="text-sm font-medium text-gray-700">{t('admin.ads.notesOptional')}</Label>
            <Textarea
              id="approveNotes"
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="h-20 text-sm rounded-lg"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              onClick={() => {
                setShowApproveModal(false);
                setApproveNotes('');
                setSelectedAd(null);
              }}
            >
              {t('admin.ads.cancel')}
            </Button>

            <Button
              className="h-9 bg-[#D6BA69] hover:bg-[#C5A952] text-white text-sm rounded-lg flex items-center"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LucideLoader className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.ads.approving')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('admin.ads.approve')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.ads.rejectAd')}</DialogTitle>
            <p className="text-sm text-gray-700">
              {t('admin.ads.provideRejectionReason')} <strong>{selectedAd?.title}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="rejectReason" className="text-sm font-medium text-gray-700">
                {t('admin.ads.reason')} <span className="text-red-500">*</span>
              </Label>
              <Select value={rejectReason} onValueChange={(val) => setRejectReason(val)}>
                <SelectTrigger className="h-9 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]">
                  <SelectValue placeholder={t('admin.ads.chooseReason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inappropriate content">{t('admin.ads.inappropriateContent')}</SelectItem>
                  <SelectItem value="Suggestive photo">{t('admin.ads.suggestivePhoto')}</SelectItem>
                  <SelectItem value="Incorrect information">{t('admin.ads.incorrectInformation')}</SelectItem>
                  <SelectItem value="Suspicious price">{t('admin.ads.suspiciousPrice')}</SelectItem>
                  <SelectItem value="Spam">{t('admin.ads.spam')}</SelectItem>
                  <SelectItem value="Duplication">{t('admin.ads.duplication')}</SelectItem>
                  <SelectItem value="Other">{t('admin.ads.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rejectNotes" className="text-sm font-medium text-gray-700">{t('admin.ads.notesOptional')}</Label>
              <Textarea
                id="rejectNotes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="h-20 text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setRejectNotes('');
                setSelectedAd(null);
              }}
            >
              {t('admin.ads.cancel')}
            </Button>

            <Button
              className="h-9 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center"
              onClick={() => handleReject(false)}
              disabled={loading || !rejectReason}
            >
              {loading ? (
                <>
                  <LucideLoader className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.ads.rejecting')}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('admin.ads.reject')}
                </>
              )}
            </Button>

            <Button
              className="h-9 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center"
              onClick={() => handleReject(true)}
              disabled={loading || !rejectReason || !selectedAd?.user?.phone}
              title={!selectedAd?.user?.phone ? "No phone number available" : "Reject and send WhatsApp message"}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.631 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Modal */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.reports.contactSellerWhatsApp')}</DialogTitle>
            <p className="text-sm text-gray-700">
              {t('admin.reports.sendMessageToSeller')}
            </p>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="whatsAppMessage" className="text-sm font-medium text-gray-700">
                {t('admin.reports.message')}
              </Label>
              <Textarea
                id="whatsAppMessage"
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                className="h-32 text-sm rounded-lg border-gray-300 focus:ring-[#D6BA69]"
                placeholder={t('admin.reports.messagePlaceholder')}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              onClick={() => {
                setShowWhatsAppModal(false);
                setSelectedAd(null);
                setWhatsAppMessage('');
              }}
            >
              {t('admin.ads.cancel')}
            </Button>

            <Button
              className="h-9 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center"
              onClick={handleSendWhatsApp}
              disabled={!whatsAppMessage.trim()}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.631 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('admin.reports.sendViaWhatsApp')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{t('admin.ads.adDetails')}</DialogTitle>
          </DialogHeader>

          {selectedAd && (
            <div className="space-y-4 p-4">
              {/* Photos */}
              {selectedAd.photos && selectedAd.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.ads.photos')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedAd.photos.map((photo, index) => (
                      <img
                        key={photo.id || index}
                        src={getPhotoUrl(photo.originalUrl || photo.url || photo)}
                        alt={photo.altText || 'Photo'}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.ads.information')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.titleLabel')}</span>
                    <p className="font-medium text-gray-900">{selectedAd.title}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.priceLabel')}</span>
                    <p className="font-medium text-gray-900">{formatPrice(selectedAd.price)}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.categoryLabel')}</span>
                    <p className="font-medium text-gray-900">{selectedAd.categoryName} / {selectedAd.subcategoryName || '—'}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.locationLabel')}</span>
                    <p className="font-medium text-gray-900">{selectedAd.locationName}{selectedAd.locationType ? `, ${selectedAd.locationType}` : ''}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.brandLabel')}</span>
                    <p className="font-medium text-gray-900">{selectedAd.brandName || '—'}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.sellerLabel')}</span>
                    <p className="font-medium text-gray-900">{selectedAd.sellerUsername || '—'}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.statusLabel')}</span>
                    <div>{getModerationStatusBadge(selectedAd.moderationStatus)}</div>
                  </div>

                  <div>
                    <span className="text-gray-600 block">{t('admin.ads.dateLabel')}</span>
                    <p className="font-medium text-gray-900">{formatDate(selectedAd.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.ads.description')}</h3>
                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAd.description}</p>
              </div>

              {/* Filters / Attributes */}
              {selectedAd.filters && selectedAd.filters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.ads.attributes')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedAd.filters.map((filter, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-600 text-xs block">{filter.filterName}:</span>
                        <span className="font-medium text-gray-900 text-xs">{filter.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderation notes */}
              {selectedAd.moderationNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.ads.moderationNotes')}</h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-xs text-gray-700">{selectedAd.moderationNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              className="h-9 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedAd(null);
              }}
            >
              {t('admin.ads.close')}
            </Button>

            {selectedAd?.moderationStatus === 'pending' && (
              <>
                <Button
                  className="h-9 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openApproveModal(selectedAd);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>

                <Button
                  className="h-9 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openRejectModal(selectedAd);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="bg-white rounded-xl border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">
              {t('admin.ads.confirmDeletion')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              {t('admin.ads.deleteWarning')}{" "}
              <span className="font-semibold">
                {selectedAd?.title}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3">
            <AlertDialogCancel className="bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
              {t('admin.ads.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LucideLoader className="h-4 w-4 mr-2 animate-spin" />
                  {t('admin.ads.deleting')}
                </>
              ) : (
                t('admin.ads.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ads;
