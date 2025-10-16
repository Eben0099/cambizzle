import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import InputWrapper from '@/components/ui/InputWrapper';
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
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const Ads = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingPage, setpendingPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('all');
  
  const [selectedAd, setSelectedAd] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    if (viewMode === 'pending') {
      fetchPendingAds();
    } else {
      fetchAds();
    }
  }, [currentPage, searchTerm, viewMode, pendingPage]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAds(currentPage, 20, searchTerm);
      setAds(data.ads || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des annonces');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getPendingAds();
      setPendingAds(response.data || []);
      setPagination(null);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des annonces en attente');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAd) return;
    
    try {
      setLoading(true);
      await adminService.approveAd(selectedAd.id, approveNotes);
      setShowApproveModal(false);
      setApproveNotes('');
      setSelectedAd(null);
      
      if (viewMode === 'pending') {
        fetchPendingAds();
      } else {
        fetchAds();
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAd || !rejectReason) return;
    
    try {
      setLoading(true);
      await adminService.rejectAd(selectedAd.id, rejectReason, rejectNotes);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectNotes('');
      setSelectedAd(null);
      
      if (viewMode === 'pending') {
        fetchPendingAds();
      } else {
        fetchAds();
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (ad) => {
    setSelectedAd(ad);
    setShowApproveModal(true);
  };

  const openRejectModal = (ad) => {
    setSelectedAd(ad);
    setShowRejectModal(true);
  };

  const openDetailsModal = (ad) => {
    // Rediriger vers la page de détails avec le slug
    navigate(`/ads/${ad.slug}`);
  };

  const getModerationStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Approuvee', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejetee', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour paginer côté frontend les annonces en attente
  const getPaginatedPendingAds = () => {
    const startIndex = (pendingPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return pendingAds.slice(startIndex, endIndex);
  };

  const filteredAds = viewMode === 'pending' 
    ? getPaginatedPendingAds() 
    : filterStatus === 'all' 
      ? ads 
      : ads.filter(ad => ad.moderationStatus === filterStatus);

  // Calculer le nombre total de pages pour les annonces en attente
  const totalPendingPages = Math.ceil(pendingAds.length / itemsPerPage);

  if (loading && !ads.length && !pendingAds.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des annonces...</p>
        </div>
      </div>
    );
  }

return (
  <div className="space-y-8">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ad Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Moderate and manage platform ads</p>
      </div>
    </div>

    {/* Error Message */}
    {error && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )}

    {/* Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Filter className="w-4 h-4 inline mr-2 text-[#D6BA69]" />
              View Mode
            </label>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'all' ? 'primary' : 'outline'}
                onClick={() => {
                  setViewMode('all');
                  setCurrentPage(1);
                }}
                className={`flex-1 ${viewMode === 'all' 
                  ? 'bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69]' 
                  : 'bg-black hover:bg-gray-800 text-[#D6BA69] border-black'
                }`}
              >
                All Ads
              </Button>
              <Button
                variant={viewMode === 'pending' ? 'primary' : 'outline'}
                onClick={() => {
                  setViewMode('pending');
                  setpendingPage(1);
                }}
                className={`flex-1 ${viewMode === 'pending' 
                  ? 'bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69]' 
                  : 'bg-black hover:bg-gray-800 text-[#D6BA69] border-black'
                }`}
              >
                Pending
              </Button>
            </div>
          </div>
          
          {viewMode === 'all' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Moderation Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Search className="w-4 h-4 inline mr-2 text-[#D6BA69]" />
                  Search
                </label>
                <InputWrapper
                  type="text"
                  placeholder="Search ads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg bg-white"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </div>

    {/* Ads List */}
    <div className="space-y-4">
      {filteredAds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        filteredAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex gap-6">
                {/* Image */}
                <div className="flex-shrink-0">
                  {ad.photos && ad.photos.length > 0 ? (
                    <img
                      src={ad.photos[0].originalUrl}
                      alt={ad.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {ad.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ad.description}</p>
                      
                      {/* Key Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center text-gray-700">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                          <span className="font-semibold">{formatPrice(ad.price)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 truncate">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{ad.locationName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{ad.categoryName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(ad.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {getModerationStatusBadge(ad.moderationStatus)}
                    </div>
                  </div>

                  {/* Moderation Notes */}
                  {ad.moderationNotes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Notes: </span>
                        {ad.moderationNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-4 py-2 rounded-lg font-medium transition-colors"
                        onClick={() => openDetailsModal(ad)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                    
                    {ad.moderationStatus === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600 px-4 py-2 rounded-lg font-medium transition-colors"
                          onClick={() => openApproveModal(ad)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white border-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
                          onClick={() => openRejectModal(ad)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Pagination */}
    {(viewMode === 'all' && pagination && pagination.totalPages > 1) || 
     (viewMode === 'pending' && totalPendingPages > 1) ? (
      <div className="flex items-center justify-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {viewMode === 'all' && pagination && (
          <>
            <Button
              className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
        {viewMode === 'pending' && (
          <>
            <Button
              className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => setpendingPage(pendingPage - 1)}
              disabled={pendingPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 font-medium">
              Page {pendingPage} of {totalPendingPages}
            </span>
            <Button
              className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-gray-800 border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              onClick={() => setpendingPage(pendingPage + 1)}
              disabled={pendingPage === totalPendingPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </div>
    ) : null}

    {/* Approve Modal */}
    <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
      <DialogContent className="max-w-md bg-white shadow-xl border border-gray-200" style={{background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'}}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">Approuver l'annonce</DialogTitle>
          <DialogDescription className="text-gray-700 mt-1">
            Confirmer l'approbation de <strong>{selectedAd?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
          <Textarea
            placeholder="Ajouter une note d'approbation..."
            value={approveNotes}
            onChange={e => setApproveNotes(e.target.value)}
            rows={3}
            className="border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg"
          />
        </div>
        <DialogFooter className="flex gap-2 mt-4">
          <Button
            className="bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300"
            onClick={() => {
              setShowApproveModal(false);
              setApproveNotes('');
              setSelectedAd(null);
            }}
          >
            Annuler
          </Button>
          <Button
            className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-white border-[#D6BA69] font-semibold"
            onClick={handleApprove}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Reject Modal */}
    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Ad</DialogTitle>
          <DialogDescription>
            Provide rejection reason for <strong>{selectedAd?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] bg-white"
            >
              <option value="">Select reason</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Suggestive photo">Suggestive photo</option>
              <option value="Incorrect information">Incorrect information</option>
              <option value="Suspicious price">Suspicious price</option>
              <option value="Spam">Spam</option>
              <option value="Duplication">Duplication</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional notes
            </label>
            <Textarea
              placeholder="Additional details..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              className="border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69] rounded-lg"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            className="bg-white border-black text-black hover:bg-gray-50"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
              setRejectNotes('');
              setSelectedAd(null);
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            onClick={handleReject}
            disabled={loading || !rejectReason}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Details Modal - Keep existing structure but update styling */}
    <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ad Details</DialogTitle>
        </DialogHeader>
        
        {selectedAd && (
          <div className="space-y-6 p-4">
            {/* Photos */}
            {selectedAd.photos && selectedAd.photos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedAd.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.originalUrl}
                      alt={photo.altText || 'Ad photo'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Info Grid */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-600 block mb-1">Title:</span>
                  <p className="font-medium text-gray-900">{selectedAd.title}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Price:</span>
                  <p className="font-medium text-gray-900">{formatPrice(selectedAd.price)}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Category:</span>
                  <p className="font-medium text-gray-900">{selectedAd.categoryName} / {selectedAd.subcategoryName}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Location:</span>
                  <p className="font-medium text-gray-900">{selectedAd.locationName}, {selectedAd.locationType}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Brand:</span>
                  <p className="font-medium text-gray-900">{selectedAd.brandName}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Seller:</span>
                  <p className="font-medium text-gray-900">{selectedAd.sellerUsername}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Status:</span>
                  <div>{getModerationStatusBadge(selectedAd.moderationStatus)}</div>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Date:</span>
                  <p className="font-medium text-gray-900">{formatDate(selectedAd.createdAt)}</p>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedAd.description}</p>
            </div>
            
            {/* Filters */}
            {selectedAd.filters && selectedAd.filters.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedAd.filters.map((filter, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 text-xs block mb-1">{filter.filterName}:</span>
                      <span className="font-medium text-gray-900">{filter.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Moderation Notes */}
            {selectedAd.moderationNotes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Moderation Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedAd.moderationNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button
            className="bg-black hover:bg-gray-800 text-[#D6BA69] border-black"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedAd(null);
            }}
          >
            Close
          </Button>
          
          {selectedAd?.moderationStatus === 'pending' && (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                onClick={() => {
                  setShowDetailsModal(false);
                  openApproveModal(selectedAd);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                onClick={() => {
                  setShowDetailsModal(false);
                  openRejectModal(selectedAd);
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default Ads;
