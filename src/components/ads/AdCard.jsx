import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Eye, Star, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatRelativeDate, getPhotoUrl } from '../../utils/helpers';
import Card from '../ui/Card';
import useFavorites from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { useFavoriteStatus } from '../../hooks/useFavoriteStatus';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';
import logger from '../../utils/logger';

const AdCard = ({ ad }) => {
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useFavorites();
  const { isFavorite, loading, refreshStatus } = useFavoriteStatus(ad.id);

  // Traduction du contenu dynamique
  const { translatedText: translatedTitle } = useWeglotTranslate(ad?.title || '');
  const { translatedText: translatedLocation } = useWeglotTranslate(ad?.locationName || '');

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      return;
    }
    await toggleFavorite(ad.id);
    // Rafraîchir le statut après le toggle
    await refreshStatus();
  };

  // Calcul de la remise basé sur les prix (nouveau format API)
  const calculateDiscount = () => {
    if (ad.originalPrice && ad.price && ad.originalPrice > ad.price) {
      return Math.round(((ad.originalPrice - ad.price) / ad.originalPrice) * 100);
    }
    return ad.discountPercentage || 0;
  };

  const discountPercentage = calculateDiscount();
  const hasDiscount = discountPercentage > 0 || (ad.originalPrice && ad.originalPrice > ad.price);

  // Debug temporaire pour vérifier les données
  if (ad.originalPrice && ad.originalPrice !== ad.price) {
    logger.debug('AdCard debug remise:', {
      title: ad.title,
      price: ad.price,
      originalPrice: ad.originalPrice,
      discountPercentage,
      hasDiscount,
      rawDiscountPercentage: ad.discountPercentage,
      rawDiscountPercentageSnake: ad.discount_percentage
    });
  }

  // Debug vérification vendeur
  logger.debug('AdCard userVerified:', { title: ad.title, userVerified: ad.userVerified });

  return (
    <Card hover className="overflow-hidden h-full">
      <Link to={`/ads/${ad.slug}`} className="h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-200 overflow-hidden">
          {ad.photos && ad.photos.length > 0 && !imageError ? (
            <>
              <img
                src={getPhotoUrl(ad.photos[0].originalUrl)}
                alt={ad.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsImageLoading(false);
                }}
              />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D6BA69]"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs">{t('ads.noImages')}</span>
            </div>
          )}

          {/* Negotiable Badge */}
          {ad.isNegotiable && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {t('ads.negotiable')}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer ${
              isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            aria-label={isFavorite ? t('ads.removeFromFavorites') : t('ads.addToFavorites')}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                isFavorite 
                  ? 'fill-current animate-heartbeat' 
                  : 'hover:animate-pulse'
              }`} 
            />
          </button>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              -{discountPercentage}%
            </div>
          )}

          {/* Badges */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {/* Verified Badge */}
            {ad.userVerified === 1 && (
              <div className="bg-green-500 text-white p-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}

            {/* Boosted Badge */}
            {ad.isBoosted == 1 && (
              <div className="bg-yellow-500 text-white p-1.5 rounded-full">
                <Zap className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">
            {translatedTitle || ad.title}
          </h3>

          {/* Price */}
          <div className="mb-2">
            {hasDiscount && ad.originalPrice ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-[#D6BA69]">
                    {formatPrice(ad.price)} FCFA
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(ad.originalPrice)} FCFA
                  </span>
                </div>
                {/* <div className="text-xs text-red-600 font-medium">
                  Économisez {formatPrice(ad.originalPrice - ad.price)} FCFA ({discountPercentage}%)
                </div> */}
              </div>
            ) : (
              <span className="text-base font-bold text-[#D6BA69]">
                {formatPrice(ad.price)} FCFA
              </span>
            )}
          </div>

          {/* Location and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">
                {translatedLocation || ad.locationName}
              </span>
            </div>
            <span className="text-xs">{formatRelativeDate(ad.createdAt)}</span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 bg-[#D6BA69] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-medium">
                  {ad.sellerUsername?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-700 truncate max-w-[60px]">{ad.sellerUsername}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{ad.viewCount}</span>
              </div>
              {/* Favorites - à implémenter plus tard */}
              {/* <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{ad.favorites || 0}</span>
              </div> */}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default AdCard;
