import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../components/ui/Loader';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { ProductSchema, BreadcrumbSchema } from '../components/StructuredData';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdBySlug } from '../hooks/useAdsQuery';
import { useWeglotTranslate } from '../hooks/useWeglotRetranslate';
import { useToast } from '../components/toast/useToast';
import storageService from '../services/storageService';
import {
  ArrowLeft,
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
  ChevronRight,
  Edit,
  List
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

// Composant pour traduire un filtre individuel
const TranslatedFilter = ({ filterName, value }) => {
  const { translatedText: translatedName } = useWeglotTranslate(filterName || '');
  const { translatedText: translatedValue } = useWeglotTranslate(value || '');

  return (
    <div className="flex flex-row items-start py-3 border-b border-gray-100">
      <span className="text-gray-600 font-medium mr-2 min-w-[120px]">
        {translatedName || filterName}:
      </span>
      <span className="text-gray-900">{translatedValue || value}</span>
    </div>
  );
};

const AdDetail = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { ads, reportAd } = useAds();
  // Use React Query pour éviter les rechargements
  const { data: adData, isLoading, isError } = useAdBySlug(slug);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [relatedAds, setRelatedAds] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [isReporting, setIsReporting] = useState(false);

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

  // Check if current user is the owner of the ad
  const isOwner = isAuthenticated && user && ad && (
    String(user.id) === String(ad.userId) ||
    String(user.id) === String(seller?.idUser)
  );

  // Traduction manuelle du contenu dynamique avec Weglot
  const { translatedText: translatedTitle } = useWeglotTranslate(ad?.title || '');
  const { translatedText: translatedDescription } = useWeglotTranslate(ad?.description || '');
  const { translatedText: translatedCategory } = useWeglotTranslate(ad?.categoryName || '');
  const { translatedText: translatedSubcategory } = useWeglotTranslate(ad?.subcategoryName || '');
  const translatedLocation = useWeglotTranslate(ad?.locationName || '');

  // Extract brand from filters if not available directly
  const brandFromFilter = ad?.filters?.find(f => f.filterName?.toLowerCase() === 'brand' || f.filterName?.toLowerCase() === 'marque')?.value;
  const { translatedText: translatedBrand } = useWeglotTranslate(ad?.brandName || brandFromFilter || '');

  // Charger les annonces similaires et le summary des feedbacks quand l'annonce est chargée
  useEffect(() => {
    const fetchRelatedAdsAndSummary = async () => {
      if (!ad) return;

      try {
        // Fetch related ads using existing subcategory or category route
        const subcategorySlug = ad.subcategorySlug || ad.subcategory?.slug;
        const categorySlug = ad.categorySlug || ad.category?.slug;

        let relatedData = null;

        // Try subcategory first, then category
        if (subcategorySlug) {
          const response = await fetch(`${API_BASE_URL}/ads/subcategory/${subcategorySlug}?per_page=5`);
          if (response.ok) {
            relatedData = await response.json();
          }
        } else if (categorySlug) {
          const response = await fetch(`${API_BASE_URL}/ads/category/${categorySlug}?per_page=5`);
          if (response.ok) {
            relatedData = await response.json();
          }
        }

        if (relatedData?.ads && Array.isArray(relatedData.ads)) {
          // Filter out current ad and limit to 4
          const filteredAds = relatedData.ads
            .filter(relatedAd => relatedAd.id !== ad.id && relatedAd.slug !== ad.slug)
            .slice(0, 4);
          setRelatedAds(filteredAds);
        }
      } catch (error) {
        // Silently fail for related ads
      }

      try {
        // Fetch feedback summary
        const summaryResponse = await fetch(`${API_BASE_URL}/ads/${ad.id}/feedbacks/summary`);
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          if (summaryData?.status === 'success') {
            setFeedbackSummary(summaryData.data);
          }
        }
      } catch (error) {
        // Silently fail for feedback summary
        setFeedbackSummary({ averageRating: 0, ratingsCount: 0, distribution: {} });
      }
    };

    if (ad) {
      fetchRelatedAdsAndSummary();
    }
  }, [ad]);

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
    showToast({ type: 'success', message: 'Message sent successfully!' });
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast({
        type: 'error',
        title: t('toast.error'),
        message: t('adDetail.report.errorNoReason')
      });
      return;
    }

    const token = storageService.getToken();
    if (!token) {
      showToast({
        type: 'error',
        title: t('adDetail.report.authRequired'),
        message: t('adDetail.report.mustBeLoggedIn')
      });
      return;
    }

    setIsReporting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_type: 'ad',
          report_reason: reportReason,
          description: reportDescription.trim() || null,
          reported_ad_id: ad.id
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        showToast({
          type: 'success',
          title: t('adDetail.report.submitted'),
          message: t('adDetail.report.submittedMessage')
        });
        setIsReportModalOpen(false);
        setReportReason('');
        setReportDescription('');
      } else {
        throw new Error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Report error:', error);

      const rawMessage = (error && error.message) ? String(error.message) : '';
      const tokenErrorPattern = /(token|jwt|unauthenticated|unauthorized|expired)/i;

      if (tokenErrorPattern.test(rawMessage)) {
        // Erreurs techniques de token (JWT expiré, invalide, non authentifié) → message humain clair
        showToast({
          type: 'error',
          title: t('adDetail.report.authRequired'),
          message: t('adDetail.report.mustBeLoggedIn')
        });
      } else {
        // Autres erreurs → message générique user-friendly
        showToast({
          type: 'error',
          title: t('adDetail.report.failed'),
          message: rawMessage || t('adDetail.report.failedMessage')
        });
      }
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return <Loader text={t('common.loading')} className="min-h-screen bg-gray-50" />;
  }

  if (isError || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.notFound')}</h1>
          <Button onClick={() => navigate('/')}>
            {t('common.back')}
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-[#D6BA69] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">{t('common.back')}</span>
            </button>
            <div className="flex items-center space-x-1 sm:space-x-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 bg-gray-50 sm:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Share2 className="w-4.5 h-4.5 sm:w-5 h-5" />
              </button>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 rounded-full text-gray-400 bg-gray-50 sm:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Flag className="w-4.5 h-4.5 sm:w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <nav className="flex items-center space-x-2 text-[10px] sm:text-xs md:text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => navigate('/ads')}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex-shrink-0"
            >
              {t('common.home')}
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => navigate('/search')}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex-shrink-0"
            >
              {t('ads.allAds')}
            </button>
            {ad?.categoryName && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => navigate(`/search?category=${ad.category?.slug || ad.categorySlug}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex-shrink-0 truncate max-w-[80px] sm:max-w-none"
                >
                  {translatedCategory || ad.categoryName}
                </button>
              </>
            )}
            {ad?.subcategoryName && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => navigate(`/search?category=${ad.category?.slug || ad.categorySlug}&subcategory=${ad.subcategory?.slug || ad.subcategorySlug}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer flex-shrink-0 truncate max-w-[80px] sm:max-w-none"
                >
                  {translatedSubcategory || ad.subcategoryName}
                </button>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0 sm:inline hidden" />
            <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-xs sm:inline hidden">
              {translatedTitle || ad?.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-8 space-y-0 sm:space-y-8">
            {/* Image Carousel */}
            <div className="bg-white sm:rounded-xl shadow-none sm:shadow-sm overflow-hidden">
              <ImageCarousel images={ad.photos?.map(photo => getPhotoUrl(photo.originalUrl)) || []} />
            </div>

            {/* Ad Details */}
            <div className="bg-white sm:rounded-xl shadow-none sm:shadow-sm overflow-hidden ring-1 ring-gray-100 sm:ring-0">
              <div className="p-4 sm:p-8">
                {/* Title and Location */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-3xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight">{translatedTitle || ad.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span>{translatedLocation?.translatedText || ad.locationName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span>{formatDate(ad.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span>{(ad.viewCount || 0).toLocaleString()} {t('ads.views')}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex flex-wrap items-baseline gap-2 sm:space-x-3">
                    <span className="text-2xl sm:text-4xl font-black text-[#D6BA69]">
                      {formatPrice(ad.price)} FCFA
                    </span>
                    {ad.hasDiscount && ad.originalPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-xl text-gray-400 line-through font-medium">
                          {formatPrice(ad.originalPrice)}
                        </span>
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-red-100">
                          -{ad.discountPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                  {ad.isNegotiable && (
                    <div className="mt-2 text-left">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wider">
                        <Tag className="w-3 h-3 mr-1" />
                        {t('ads.negotiable')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Info Grid - Modified for iPhone mini (2 cols always, small gap) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8 text-left">
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                      <Tag className="w-4 h-4 text-[#D6BA69]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-tighter">{t('ads.adType')}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate">
                      {ad.type === 'rent' ? t('createAd.rent') : t('createAd.sell')}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                      <Package className="w-4 h-4 text-[#D6BA69]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-tighter">{t('ads.category')}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate">{translatedCategory || ad.categoryName}</div>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                      <CheckCircle className="w-4 h-4 text-[#D6BA69]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-tighter">{t('ads.subcategory')}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate">{translatedSubcategory || ad.subcategoryName}</div>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                      <Truck className="w-4 h-4 text-[#D6BA69]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-tighter">{t('ads.brand')}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate">{translatedBrand || ad.brandName || brandFromFilter}</div>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                      <AlertTriangle className="w-4 h-4 text-[#D6BA69]" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 tracking-tighter">{t('ads.negotiable')}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm truncate">{ad.isNegotiable ? t('common.yes') : t('common.no')}</div>
                  </div>
                </div>

                {/* Characteristics */}
                {ad.filters && ad.filters.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#D6BA69]" />
                      {t('ads.specifications')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
                      {ad.filters.map((filter, index) => (
                        <TranslatedFilter
                          key={index}
                          filterName={filter.filterName}
                          value={filter.value}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ads.description')}</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {translatedDescription || ad.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {ad.tags && ad.tags.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">{t('ads.tags')}</h4>
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
            {/* Owner Actions - Show when user is viewing their own ad */}
            {isOwner && (
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.myAds')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('ads.seller')}: {t('common.you') || 'You'}</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(`/edit-ad/${ad.slug}`)}
                    className="w-full bg-[#D6BA69] hover:bg-[#c5a55d] text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span>{t('common.edit')}</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/profile/ads')}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <List className="w-5 h-5" />
                    <span>{t('header.myAds')}</span>
                  </Button>
                </div>
              </div>
            )}

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
                isVerified: (seller?.isVerified === '1' || seller?.isVerified === 1 || seller?.isVerified === true) || (seller?.isIdentityVerified === '1' || seller?.isIdentityVerified === 1 || seller?.isIdentityVerified === true) || false,
                phoneNumber: seller?.phone,
                responseRate: seller?.responseRate || 95,
                responseTime: seller?.responseTime || t('adDetail.aFewHours')
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

            {/* Feedback Block */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('adDetail.feedback.title', 'Feedback')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('adDetail.feedback.description', 'See what other buyers think about this ad')}
                </p>
                {feedbackSummary && feedbackSummary.ratingsCount > 0 && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(feedbackSummary.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {feedbackSummary.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ({feedbackSummary.ratingsCount} {t('adDetail.feedback.reviews', 'reviews')})
                    </span>
                  </div>
                )}
                <Button
                  onClick={() => navigate(`/ads/${ad.slug}/feedbacks`)}
                  className="w-full bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <Star className="w-4 h-4 mr-2 inline" />
                  {t('adDetail.feedback.viewFeedbacks', 'View Feedbacks')}
                </Button>
              </div>
            </div>

            {/* Safety Tips */}
            <SafetyTips />
          </div>
        </div>

        {/* Related Ads Section - Bottom */}
        {relatedAds.length > 0 && (
          <div className="mt-8 sm:mt-12 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('ads.relatedAds')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedAds.map((relatedAd) => (
                <AdCard key={relatedAd.id} ad={relatedAd} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={t('ads.contactSeller')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contact.message')}
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d6ba69] focus:border-transparent resize-none transition-colors"
              rows={4}
              placeholder={t('contact.messagePlaceholder')}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSendMessage}
              className="flex-1 px-4 py-2 bg-[#d6ba69] text-black rounded-lg hover:bg-[#c5a952] transition-colors cursor-pointer"
            >
              {t('contact.send')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('adDetail.report.title')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('adDetail.report.reasonLabel')}
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d6ba69] focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="">{t('adDetail.report.selectReason')}</option>
              <option value="spam">{t('adDetail.report.spam')}</option>
              <option value="fraud">{t('adDetail.report.fraud')}</option>
              <option value="inappropriate">{t('adDetail.report.inappropriate')}</option>
              <option value="duplicate">{t('adDetail.report.duplicate')}</option>
              <option value="other">{t('adDetail.report.other')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('adDetail.report.additionalDetails')} <span className="text-gray-500">{t('adDetail.report.optional')}</span>
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d6ba69] focus:border-transparent resize-none transition-colors"
              rows={3}
              placeholder={t('adDetail.report.detailsPlaceholder')}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setIsReportModalOpen(false);
                setReportReason('');
                setReportDescription('');
              }}
              disabled={isReporting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleReport}
              disabled={!reportReason || isReporting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isReporting ? t('adDetail.report.submitting') : t('adDetail.report.submitReport')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdDetail;