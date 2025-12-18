import { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { ProductSchema, BreadcrumbSchema } from '../components/StructuredData';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdBySlug } from '../hooks/useAdsQuery';
import useWeglotRetranslate from '../hooks/useWeglotRetranslate';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  Calendar, 
  Eye, 
  Star,
  Shield,
  Phone,
  MessageCircle,
  User,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Tag,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { formatPrice, formatDate, getPhotoUrl } from '../utils/helpers';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageCarousel from '../components/adDetail/ImageCarousel';
import SellerProfile from '../components/adDetail/SellerProfile';
import BusinessProfile from '../components/adDetail/BusinessProfile';
import SafetyTips from '../components/adDetail/SafetyTips';
import Modal from '../components/adDetail/Modal';
import AdCard from '../components/ads/AdCard';

const AdDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { ads, favorites = [], toggleFavorite, reportAd } = useAds();
  const retranslateWeglot = useWeglotRetranslate();
  
  // Use React Query pour éviter les rechargements
  const { data: adData, isLoading, isError } = useAdBySlug(slug);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [relatedAds, setRelatedAds] = useState([]);

  // Préparer les données de l'annonce avec les calculs de remise
  const ad = adData ? {
    ...adData,
    discountPercentage: adData.discountPercentage || adData.discount_percentage || 
      (adData.originalPrice && adData.price && adData.originalPrice > adData.price 
        ? Math.round(((adData.originalPrice - adData.price) / adData.originalPrice) * 100)
        : 0),
    hasDiscount: (adData.originalPrice && adData.price && adData.originalPrice > adData.price) ||
      (adData.discountPercentage && adData.discountPercentage > 0) ||
      (adData.discount_percentage && adData.discount_percentage > 0)
  } : null;

  const seller = ad?.userDetails || null;
  const sellerBusiness = ad?.seller_profile || null;

  // Charger les annonces similaires quand l'annonce est chargée
  useEffect(() => {
    const fetchRelatedAds = async () => {
      if (!ad) return;
      try {
        const relatedResponse = await fetch(`${API_BASE_URL}/ads?category=${encodeURIComponent(ad.categoryName)}&limit=4&exclude=${ad.id}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          if (relatedData && Array.isArray(relatedData)) {
            setRelatedAds(relatedData.slice(0, 4));
          }
        }
      } catch (error) {
        // Silently fail for related ads
      }
    };
    
    if (ad) {
      fetchRelatedAds();
      retranslateWeglot();
    }
  }, [ad, retranslateWeglot]);

  const isInFavorites = ad && favorites.some(fav => fav.id === ad.id);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: ad.title,
        text: `Check out this ad: ${ad.title}`,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      setIsContactModalOpen(true);
      return;
    }
    toggleFavorite(ad);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      setIsContactModalOpen(true);
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleCall = () => {
    if (seller?.phoneNumber || seller?.phone) {
      window.location.href = `tel:${seller.phoneNumber || seller.phone}`;
    }
  };

  const handleSendMessage = () => {
    setIsContactModalOpen(false);
    setContactMessage('');
    alert('Message sent successfully!');
  };

  const handleReport = () => {

    setIsReportModalOpen(false);
    setReportReason('');
    alert('Report submitted. Thank you for helping us maintain our platform’s quality.');
  };

  if (isLoading) {
    return <Loader text="Loading details..." className="min-h-screen bg-gray-50" />;
  }

  if (isError || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ad Not Found</h1>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${ad.title} | Cambizzle`}
        description={ad.description?.slice(0, 155) || `${ad.title} - Buy or sell on Cambizzle`}
        image={ad.photos?.[0]?.url || ad.photos?.[0]?.originalUrl || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=630&fit=crop'}
        url={`/ad/${ad.slug}`}
        type="product"
        keywords={`${ad.title}, ${ad.category?.name || ''}, ${ad.subcategory?.name || ''}, ${ad.location || ''}, buy, sell, Cameroon`}
      />
      <ProductSchema ad={ad} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: ad.category?.name || 'Category', url: `/search?category=${ad.category?.slug}` },
          { name: ad.subcategory?.name || 'Subcategory', url: `/search?category=${ad.category?.slug}&subcategory=${ad.subcategory?.slug}` },
          { name: ad.title, url: `/ad/${ad.slug}` }
        ]}
      />
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Results</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isInFavorites 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/ads')} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigate('/search')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              All Ads
            </button>
            {ad?.categoryName && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigate(`/search?category=${ad.category?.slug || ad.categorySlug}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {ad.categoryName}
                </button>
              </>
            )}
            {ad?.subcategoryName && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigate(`/search?category=${ad.category?.slug || ad.categorySlug}&subcategory=${ad.subcategory?.slug || ad.subcategorySlug}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {ad.subcategoryName}
                </button>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {ad?.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Carousel */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ImageCarousel images={ad.photos?.map(photo => getPhotoUrl(photo.originalUrl)) || []} />
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Title and Location */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{ad.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      <span>{ad.locationName}, {ad.locationType}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>{formatDate(ad.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span>{(ad.viewCount || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {formatPrice(ad.price)} FCFA
                    </span>
                    {ad.hasDiscount && ad.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(ad.originalPrice)} FCFA
                        </span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          -{ad.discountPercentage}% off
                        </span>
                      </>
                    )}
                  </div>
                  {ad.isNegotiable && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="w-3 h-3 mr-1" />
                        Negotiable
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Package className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="font-medium text-sm">{ad.categoryName}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Subcategory</div>
                    <div className="font-medium text-sm">{ad.subcategoryName}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Truck className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Brand</div>
                    <div className="font-medium text-sm">{ad.brandName}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Negotiable</div>
                    <div className="font-medium text-sm">{ad.isNegotiable ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Characteristics */}
                {ad.filters && ad.filters.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ad.filters.map((filter, index) => (
                        <div key={index} className="flex flex-row items-start py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium mr-2 min-w-[120px]">{filter.filterName}:</span>
                          <span className="text-gray-900">{filter.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {ad.tags && ad.tags.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {ad.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Seller and Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Seller Profile - Always show with fallback */}
            <SellerProfile 
              seller={{
                id: (seller?.idUser || ad?.userId || '1'),
                name: seller?.firstName && seller?.lastName 
                  ? `${seller.firstName} ${seller.lastName}` 
                  : (seller?.firstName || ad?.sellerUsername || 'Seller'),
                avatar: seller?.photoUrl ? (seller.photoUrl.startsWith('http') ? seller.photoUrl : `${SERVER_BASE_URL}/${seller.photoUrl}`.replace(/\/+/g, '/')) : null,
                memberSince: formatDate(seller?.createdAt || ad?.createdAt),
                rating: seller?.rating || 0,
                reviewCount: seller?.reviewCount || 0,
                isVerified: seller?.isVerified === '1' || seller?.isVerified === true || false,
                phoneNumber: seller?.phone,
                responseRate: seller?.responseRate || 95,
                responseTime: seller?.responseTime || 'A few hours'
              }}
              adTitle={ad?.title}
              onContact={handleContact}
              onCall={handleCall}
            />

            {/* Business Profile */}
            {sellerBusiness && (
              <BusinessProfile 
                business={sellerBusiness}
              />
            )}

            {/* Safety Tips */}
            <SafetyTips />
          </div>
        </div>

        {/* Related Ads Section - Bottom */}
        {relatedAds.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAds.map((relatedAd) => (
                <AdCard key={relatedAd.id} ad={relatedAd} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contact Seller"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d6ba69] focus:border-transparent resize-none transition-colors"
              rows={4}
              placeholder="Hello, I'm interested in your ad..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              className="flex-1 px-4 py-2 bg-[#d6ba69] text-white rounded-lg hover:bg-[#c5a952] transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report This Ad"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reporting
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d6ba69] focus:border-transparent transition-colors"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam or unwanted content</option>
              <option value="fraud">Fraudulent content</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="duplicate">Duplicate ad</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              disabled={!reportReason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdDetail;