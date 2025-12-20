import { TrendingUp, Award, Shield, User, Package, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { formatPrice, getPhotoUrl } from '../../utils/helpers';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';

// Composant pour traduire le titre d'une annonce
const TranslatedAdTitle = ({ title, className }) => {
  const { translatedText } = useWeglotTranslate(title || '');
  return <h4 className={className}>{translatedText || title}</h4>;
};

const ProfileOverview = ({ user, userAds, onVerifyIdentity }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    navigate(`/ads/${ad.slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#D6BA69]" />
              {t('profileOverview.recentActivity')}
            </h3>
            <div className="space-y-4">
              {userAds.slice(0, 3).map((ad) => (
                <div 
                  key={ad.id} 
                  className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleAdClick(ad)}
                >
                  {ad.photos && ad.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(ad.photos[0].originalUrl)}
                      alt={ad.title}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <TranslatedAdTitle title={ad.title} className="font-medium text-sm sm:text-base text-gray-900 hover:text-[#D6BA69] transition-colors" />
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                      <span className="font-semibold text-[#D6BA69]">{formatPrice(ad.price)} FCFA</span>
                      <span>•</span>
                      <span>{ad.viewCount || 0} {t('ads.views')}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.status === 'active' ? t('profileAds.statusActive') : t('profileAds.statusInactive')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {userAds.length === 0 && (
                <div className="text-center py-6 sm:py-8 flex flex-col items-center text-gray-500">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">{t('profileOverview.noAdsPosted')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 py-2 sm:py-3 text-xs sm:text-sm"
                    onClick={() => navigate('/create-ad')}
                    aria-label={t('profileAds.createFirstAd')}
                  >
                    {t('profileAds.createFirstAd')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#D6BA69]" />
              {t('profileOverview.accountStatus')}
            </h3>
            <div className="space-y-4">
              {/* Email Verified */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.isVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Shield className={`w-4 h-4 ${user.isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('profileOverview.emailVerified')}</p>
                    <p className="text-xs text-gray-500">{t('profileOverview.emailConfirmed')}</p>
                  </div>
                </div>
                {user.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Identity Verified */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.isIdentityVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <User className={`w-4 h-4 ${user.isIdentityVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('profileOverview.identityVerified')}</p>
                    <p className="text-xs text-gray-500">{t('profileOverview.identityValidated')}</p>
                  </div>
                </div>
                {user.isIdentityVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-2 sm:py-3 text-xs sm:text-sm"
                    onClick={onVerifyIdentity}
                    aria-label={t('profileOverview.verify')}
                  >
                    {t('profileOverview.verify')}
                  </Button>
                )}
              </div>

              {/* Identity Document */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {t('profileOverview.identityDocument')}
                </h4>

                {user.identityDocumentUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.identityDocumentType?.toUpperCase() || 'ID'} - {user.identityDocumentNumber}
                        </p>
                        <p className="text-xs text-green-600">{t('profileOverview.documentVerified')}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="py-2 sm:py-3 text-xs sm:text-sm"
                      onClick={onVerifyIdentity}
                      aria-label={t('common.update')}
                    >
                      {t('common.update')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      {t('profileOverview.addIdMessage')}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="py-2 sm:py-3 text-xs sm:text-sm"
                      onClick={onVerifyIdentity}
                      aria-label={t('profileOverview.addId')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t('profileOverview.addId')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;