import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { formatPrice, formatDate, calculateTimeAgo, getPhotoUrl } from '../utils/helpers';
import { CATEGORIES } from '../utils/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ImageCarousel from '../components/ui/ImageCarousel';
import AdCard from '../components/ads/AdCard';

const AdDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { ads, favorites = [], toggleFavorite, reportAd } = useAds();
  
  const [ad, setAd] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerBusiness, setSellerBusiness] = useState(null);
  const [relatedAds, setRelatedAds] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const loadAdDetails = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        // Charger les détails de l'annonce depuis l'API
        const response = await fetch(`http://localhost:8080/api/ads/${slug}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/404');
            return;
          }
          throw new Error('Erreur lors du chargement de l\'annonce');
        }
        
        const adData = await response.json();
        console.log('📝 Détails annonce reçus:', adData);
        
        setAd(adData);
        setViewCount(adData.viewCount || 0);
        
        // Charger les informations du vendeur
        try {
          const sellerResponse = await fetch(`http://localhost:8080/api/users/${adData.userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json();
            console.log('👤 Vendeur reçu:', sellerData);
            setSeller(sellerData);
          }
        } catch (sellerError) {
          console.warn('⚠️ Impossible de charger les informations du vendeur:', sellerError);
        }
        
        // Charger le profil business du vendeur s'il en a un
        try {
          const businessResponse = await fetch(`http://localhost:8080/api/seller-profiles/user/${adData.userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (businessResponse.ok) {
            const businessData = await businessResponse.json();
            console.log('🏢 Profil business reçu:', businessData);
            setSellerBusiness(businessData);
          }
        } catch (businessError) {
          console.warn('⚠️ Impossible de charger le profil business:', businessError);
        }
        
        // Charger les annonces similaires
        try {
          const relatedResponse = await fetch(`http://localhost:8080/api/ads?subcategoryId=${adData.subcategoryId}&limit=4&exclude=${adData.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            console.log('🔗 Annonces similaires reçues:', relatedData);
            setRelatedAds(relatedData.ads || []);
          }
        } catch (relatedError) {
          console.warn('⚠️ Impossible de charger les annonces similaires:', relatedError);
        }
        
        // Initialiser le message de contact
        setContactMessage(`Bonjour, je suis intéressé(e) par votre annonce "${adData.title}".`);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des détails de l\'annonce:', error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdDetails();
  }, [slug, navigate]);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFavorite(ad.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Discover this ad on Cambizzle: ${ad.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;
    
    try {
      await reportAd(ad.id, reportReason);
      setIsReportModalOpen(false);
      setReportReason('');
      alert('Report sent. Thank you for helping us maintain platform quality.');
    } catch (error) {
      console.error('Error reporting ad:', error);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
  };

  const sendMessage = () => {
    // In a real app, this would send a message to the seller
    console.log('Message envoyé:', contactMessage);
    setIsContactModalOpen(false);
    alert('Message sent to seller!');
  };

  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : 'Other';
  };

  const getConditionLabel = (condition) => {
    const conditions = {
      'new': 'New',
      'like_new': 'Like new',
      'good': 'Good condition',
      'fair': 'Fair condition',
      'poor': 'Needs renovation'
    };
    return conditions[condition] || condition;
  };

  const reportReasons = [
    'Inappropriate content',
    'Suspicious price',
    'Counterfeit item',
    'Suspicious seller',
    'Incorrect information',
    'Spam or advertising',
    'Other'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D6BA69]"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ad not found</h2>
          <Button onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(ad.id);
  const isOwner = user && user.idUser === ad.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={handleToggleFavorite}
              className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" onClick={handleShare} className="p-2">
              <Share2 className="w-5 h-5" />
            </Button>
            {!isOwner && (
              <Button variant="ghost" onClick={handleReport} className="p-2">
                <Flag className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <ImageCarousel images={ad.photos?.map(photo => photo.originalUrl) || []} />

            {/* Ad Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {ad.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {ad.locationName}, {ad.locationType}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(ad.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {ad.viewCount || 0} vues
                      </div>
                    </div>
                  </div>
                  
                  {ad.isPremium && (
                    <div className="bg-[#D6BA69] text-black px-3 py-1 rounded-full text-sm font-medium">
                      Premium
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(ad.price)} FCFA
                    </span>
                    {ad.hasDiscount && ad.originalPrice && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(ad.originalPrice)} FCFA
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                          -{ad.discountPercentage}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Catégorie</div>
                    <div className="font-medium">{ad.categoryName}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Sous-catégorie</div>
                    <div className="font-medium">{ad.subcategoryName}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Marque</div>
                    <div className="font-medium">{ad.brandName}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Négociable</div>
                    <div className="font-medium">{ad.isNegotiable ? 'Oui' : 'Non'}</div>
                  </div>
                </div>

                {/* Characteristics */}
                {ad.filters && ad.filters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Caractéristiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ad.filters.map((filter, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{filter.filterName}</span>
                          <span className="font-medium text-gray-900">{filter.filterValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                      {ad.type === 'sell' ? 'Sale' : ad.type === 'rent' ? 'Rent' : 'Service'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Published</div>
                    <div className="font-medium">{formatDate(ad.createdAt)}</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{ad.description}</p>
                  </div>
                </div>

                {/* Tags */}
                {ad.tags && ad.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {ad.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Seller Info and Actions */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendeur</h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  {seller?.photoUrl ? (
                    <img 
                      src={getPhotoUrl(seller.photoUrl)} 
                      alt={`${seller.firstName} ${seller.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#D6BA69] rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-black" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {ad.sellerUsername || (seller?.firstName && seller?.lastName ? `${seller.firstName} ${seller.lastName}` : 'Vendeur')}
                      </h4>
                      {seller?.isVerified && (
                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Vérifié
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Membre depuis {formatDate(seller?.createdAt || ad.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">{formatDate(ad.seller.joinedAt || ad.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active ads</span>
                    <span className="font-medium">{ad.seller.activeAds || 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales completed</span>
                    <span className="font-medium">{ad.seller.totalSales || 0}</span>
                  </div>
                </div>

                {!isOwner && (
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleContact}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact seller
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleContact}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                )}

                {isOwner && (
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      Edit ad
                    </Button>
                    <Button variant="ghost" className="w-full text-red-600">
                      Delete ad
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Safety Tips */}
            <Card>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-[#D6BA69] mr-2" />
                  <h3 className="font-semibold text-gray-900">Safety tips</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Meet the seller in a public place
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Check the item before paying
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    Never pay in advance
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    Be wary of prices that are too low
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Ads */}
        {relatedAds.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar ads</h2>
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
        title="Contact seller"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-[#D6BA69] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-medium">{ad.seller.firstName} {ad.seller.lastName}</div>
              <div className="text-sm text-gray-600">{ad.title}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your message
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              placeholder="Type your message here..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!contactMessage.trim()}
            >
              Send message
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report this ad"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Why are you reporting this ad?
          </p>
          
          <div className="space-y-2">
            {reportReasons.map((reason) => (
              <label key={reason} className="flex items-center">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitReport}
              disabled={!reportReason}
            >
              Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdDetail;
