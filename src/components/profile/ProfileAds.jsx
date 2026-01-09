import { useState } from 'react';
import { Package, Plus, Eye, Calendar, Edit, Trash2, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { formatPrice, getPhotoUrl, formatRelativeDate } from '../../utils/helpers';
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {userAds.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="relative cursor-pointer" onClick={() => handleAdClick(ad)}>
              {ad.photos && ad.photos.length > 0 ? (
                <img
                  src={getPhotoUrl(ad.photos[0].originalUrl)}
                  alt={ad.title}
                  className="w-full h-40 sm:h-48 object-cover"
                />
              ) : (
                <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-sm ${ad.status === 'active' && ad.moderationStatus === 'approved'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : ad.moderationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : ad.moderationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
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
            </div>

            <div className="p-4">
              <TranslatedAdTitle
                title={ad.title}
                className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#D6BA69] transition-colors"
                onClick={() => handleAdClick(ad)}
              />
              <p className="text-xl sm:text-2xl font-bold text-[#D6BA69] mb-3">
                {formatPrice(ad.price)} FCFA
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(ad.viewCount || 0)} {t('ads.views')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatRelativeDate(ad.createdAt)}
                </div>
              </div>

              {ad.moderationStatus === 'rejected' && (ad.rejectReason || ad.moderationNotes) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700">
                    <p className="font-semibold mb-1 uppercase tracking-tight">Raison du rejet :</p>
                    <p className="italic leading-relaxed">{ad.rejectReason || ad.moderationNotes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {(ad.isBoosted === '1' || ad.is_boosted === '1') ? (
                  <span
                    className="flex-1 h-9 inline-flex items-center justify-center text-sm font-medium text-white bg-[#D6BA69] rounded-md border border-[#D6BA69] cursor-default select-none px-3"
                    title={(ad.boostEnd || ad.boost_end) ? `${t('profileAds.boostUntil')} ${new Date(ad.boostEnd || ad.boost_end).toLocaleDateString()}` : ''}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {t('profileAds.boosted')}
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[#D6BA69] hover:bg-[#D6BA69]/10 border-[#D6BA69]"
                    onClick={() => handleBoostAd(ad)}
                    aria-label={t('profileAds.boost')}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {t('profileAds.boost')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/edit-ad/${ad.slug}`)}
                  aria-label={t('common.edit')}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDeleteAd(ad)}
                  aria-label="Delete ad"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
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