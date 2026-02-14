import { useState } from 'react';
import { Package, Plus, Eye, MapPin, Edit, Trash2, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatPrice, getPhotoUrl, formatDate } from '../../utils/helpers';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';
import BoostAdModal from '../ads/BoostAdModal';

// Composant pour traduire le titre d'une annonce
const TranslatedAdTitle = ({ title, className, onClick }) => {
  const { translatedText } = useWeglotTranslate(title || '');
  return (
    <h4 className={className} onClick={onClick}>
      {translatedText || title}
    </h4>
  );
};

const ProfileAds = ({ userAds, onCreateAd, onEditAd, onDeleteAd, user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedAdForBoost, setSelectedAdForBoost] = useState(null);

  const handleBoostAd = (ad) => {
    setSelectedAdForBoost(ad);
    setBoostModalOpen(true);
  };

  const handleCloseBoostModal = () => {
    setBoostModalOpen(false);
    setSelectedAdForBoost(null);
  };

  const handleAdClick = (ad) => {
    navigate(`/ads/${ad.slug}`);
  };

  if (userAds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 sm:p-12 flex flex-col items-center text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('profileAds.noAds')}</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">{t('profileAds.noAdsYet')}</p>
          <Button
            onClick={onCreateAd}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('profileAds.createFirstAd')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {t('profileAds.myAds')} ({userAds.length})
        </h3>
        <Button
          onClick={onCreateAd}
          className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('profileAds.newAd')}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {userAds.map((ad) => (
          <Card key={ad.id} hover className="overflow-hidden h-full flex flex-col">
            {/* Image */}
            <div className="relative aspect-square bg-gray-200 overflow-hidden cursor-pointer" onClick={() => handleAdClick(ad)}>
              {ad.photos && ad.photos.length > 0 ? (
                <img
                  src={getPhotoUrl(ad.photos[0].originalUrl)}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}

              {/* Status Badge - top left */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                  ad.status === 'active' && ad.moderationStatus === 'approved'
                    ? 'bg-green-500 text-white'
                    : ad.moderationStatus === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : ad.moderationStatus === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                }`}>
                  {ad.status === 'active' && ad.moderationStatus === 'approved'
                    ? t('profileAds.statusActive')
                    : ad.moderationStatus === 'pending'
                      ? t('profileAds.statusPending')
                      : ad.moderationStatus === 'rejected'
                        ? t('profileAds.statusRejected')
                        : t('profileAds.statusInactive')}
                </span>
              </div>

              {/* Badges - bottom right */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {/* Boosted Badge */}
                {(ad.isBoosted === '1' || ad.is_boosted === '1') && (
                  <div
                    className="bg-yellow-500 text-white p-1.5 rounded-full"
                    title={(ad.boostEnd || ad.boost_end) ? `${t('profileAds.boostUntil')} ${formatDate(ad.boostEnd || ad.boost_end)}` : ''}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 flex flex-col">
              {/* Title */}
              <TranslatedAdTitle
                title={ad.title}
                className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug cursor-pointer hover:text-[#D6BA69] transition-colors"
                onClick={() => handleAdClick(ad)}
              />

              {/* Price */}
              <div className="mb-2">
                <span className="text-base font-bold text-[#D6BA69]">
                  {formatPrice(ad.price)} FCFA
                </span>
              </div>

              {/* Location and Date */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{ad.locationName || '-'}</span>
                </div>
                <span>{formatDate(ad.createdAt)}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Eye className="w-3 h-3 mr-1" />
                <span>{ad.viewCount || 0} {t('ads.views')}</span>
              </div>

              {/* Rejection reason */}
              {ad.moderationStatus === 'rejected' && (ad.rejectReason || ad.moderationNotes) && (
                <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start">
                  <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-700 line-clamp-2">{ad.rejectReason || ad.moderationNotes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-1.5 mt-auto">
                {(ad.isBoosted === '1' || ad.is_boosted === '1') ? (
                  <span className="flex-1 h-8 inline-flex items-center justify-center text-xs font-medium text-white bg-[#D6BA69] rounded-md cursor-default">
                    <Zap className="w-3 h-3 mr-1" />
                    {t('profileAds.boosted')}
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[#D6BA69] hover:bg-[#D6BA69]/10 border-[#D6BA69] text-xs h-8"
                    onClick={() => handleBoostAd(ad)}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {t('profileAds.boost')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => navigate(`/edit-ad/${ad.slug}`)}
                  aria-label={t('common.edit')}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 h-8 px-2"
                  onClick={() => onDeleteAd(ad)}
                  aria-label="Delete ad"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Boost Modal */}
      {boostModalOpen && selectedAdForBoost && (
        <BoostAdModal
          isOpen={boostModalOpen}
          onClose={handleCloseBoostModal}
          ad={selectedAdForBoost}
          user={user}
        />
      )}
    </div>
  );
};

export default ProfileAds;