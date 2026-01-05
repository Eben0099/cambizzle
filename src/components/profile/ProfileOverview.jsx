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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#D6BA69]" />
                {t('profileOverview.accountStatus')}
              </h3>
              {user.isVerified == 1 ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Fully Verified
                </span>
              ) : user.isVerified == 2 ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Under Review
                </span>
              ) : user.isVerified == 3 ? (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  Action Required
                </span>
              ) : user.isVerified == 4 ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  Rejected
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  Not verified
                </span>
              )}
            </div>
            <div className="space-y-4">
              {/* Identity Verification */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                user.isVerified === 1 || user.isVerified === "1" ? 'bg-green-50 border border-green-200' :
                user.isVerified === 2 || user.isVerified === "2" ? 'bg-blue-50 border border-blue-200' :
                user.isVerified === 3 || user.isVerified === "3" ? 'bg-orange-50 border border-orange-200' :
                user.isVerified === 4 || user.isVerified === "4" ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    user.isVerified === 1 || user.isVerified === "1" ? 'bg-green-100' :
                    user.isVerified === 2 || user.isVerified === "2" ? 'bg-blue-100' :
                    user.isVerified === 3 || user.isVerified === "3" ? 'bg-orange-100' :
                    user.isVerified === 4 || user.isVerified === "4" ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <User className={`w-4 h-4 ${
                      user.isVerified === 1 || user.isVerified === "1" ? 'text-green-600' :
                      user.isVerified === 2 || user.isVerified === "2" ? 'text-blue-600' :
                      user.isVerified === 3 || user.isVerified === "3" ? 'text-orange-600' :
                      user.isVerified === 4 || user.isVerified === "4" ? 'text-red-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Identity Verification</p>
                    <p className={`text-xs ${
                      user.isVerified == 1 || user.isVerified == "1" ? 'text-green-600' :
                      user.isVerified == 2 || user.isVerified == "2" ? 'text-blue-600' :
                      user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-600' :
                      user.isVerified == 4 || user.isVerified == "4" ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {user.isVerified == 1 || user.isVerified == "1" ? 'Verified and validated' :
                       user.isVerified == 2 || user.isVerified == "2" ? 'Under review by moderators' :
                       user.isVerified == 3 || user.isVerified == "3" ? 'Modifications requested' :
                       user.isVerified == 4 || user.isVerified == "4" ? 'Document rejected' :
                       'Not verified yet'}
                    </p>
                  </div>
                </div>
                {user.isVerified == 1 || user.isVerified == "1" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : user.isVerified == 2 || user.isVerified == "2" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600 font-medium">Pending</span>
                  </div>
                ) : user.isVerified == 3 || user.isVerified == "3" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-2 sm:py-3 text-xs sm:text-sm border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                    onClick={onVerifyIdentity}
                    aria-label="Update Document"
                  >
                    Update
                  </Button>
                ) : user.isVerified == 4 || user.isVerified == "4" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-2 sm:py-3 text-xs sm:text-sm border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                    onClick={onVerifyIdentity}
                    aria-label="Resubmit Document"
                  >
                    Resubmit
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-2 sm:py-3 text-xs sm:text-sm border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69] hover:text-black"
                    onClick={onVerifyIdentity}
                    aria-label={t('profileOverview.verify')}
                  >
                    {t('profileOverview.verify')}
                  </Button>
                )}
              </div>

              {/* Identity Document - Hidden when verified */}
              {!(user.isVerified == 1 || user.isVerified == "1") && (
              <div className={`rounded-lg p-4 ${
                user.isVerified == 1 || user.isVerified == "1" ? 'bg-green-50 border border-green-200' :
                user.isVerified == 2 || user.isVerified == "2" ? 'bg-blue-50 border border-blue-200' :
                user.isVerified == 3 || user.isVerified == "3" ? 'bg-orange-50 border border-orange-200' :
                user.isVerified == 4 || user.isVerified == "4" ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  user.isVerified == 1 || user.isVerified == "1" ? 'text-green-900' :
                  user.isVerified == 2 || user.isVerified == "2" ? 'text-blue-900' :
                  user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-900' :
                  user.isVerified == 4 || user.isVerified == "4" ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('profileOverview.identityDocument')}
                </h4>

                {user.identityDocumentUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded border flex items-center justify-center ${
                          user.isVerified == 1 || user.isVerified == "1" ? 'bg-green-100 border-green-300' :
                          user.isVerified == 2 || user.isVerified == "2" ? 'bg-blue-100 border-blue-300' :
                          user.isVerified == 3 || user.isVerified == "3" ? 'bg-orange-100 border-orange-300' :
                          user.isVerified == 4 || user.isVerified == "4" ? 'bg-red-100 border-red-300' :
                          'bg-blue-100 border-blue-300'
                        }`}>
                          <Upload className={`w-5 h-5 ${
                            user.isVerified == 1 || user.isVerified == "1" ? 'text-green-600' :
                            user.isVerified == 2 || user.isVerified == "2" ? 'text-blue-600' :
                            user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-600' :
                            user.isVerified == 4 || user.isVerified == "4" ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.identityDocumentType?.toUpperCase() || 'ID'} - {user.identityDocumentNumber}
                          </p>
                          <p className={`text-xs ${
                            user.isVerified == 1 || user.isVerified == "1" ? 'text-green-600' :
                            user.isVerified == 2 || user.isVerified == "2" ? 'text-blue-600' :
                            user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-600' :
                            user.isVerified == 4 || user.isVerified == "4" ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {user.isVerified == 1 || user.isVerified == "1" ? 'Document verified' :
                             user.isVerified == 2 || user.isVerified == "2" ? 'Under review' :
                             user.isVerified == 3 || user.isVerified == "3" ? 'Needs update' :
                             user.isVerified == 4 || user.isVerified == "4" ? 'Document rejected' :
                             'Document uploaded'}
                          </p>
                        </div>
                      </div>
                      {(user.isVerified == 3 || user.isVerified == "3" || user.isVerified == 4 || user.isVerified == "4" || user.isVerified == 0 || user.isVerified == "0") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="py-2 sm:py-3 text-xs sm:text-sm"
                          onClick={onVerifyIdentity}
                          aria-label={t('common.update')}
                        >
                          {t('common.update')}
                        </Button>
                      )}
                    </div>
                    {user.moderationMessage && (user.isVerified == 3 || user.isVerified == "3" || user.isVerified == 4 || user.isVerified == "4") && (
                      <div className={`p-3 rounded-lg ${
                        user.isVerified == 3 || user.isVerified == "3" ? 'bg-orange-100 border border-orange-200' : 'bg-red-100 border border-red-200'
                      }`}>
                        <p className={`text-xs font-medium mb-1 ${
                          user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-900' : 'text-red-900'
                        }`}>
                          {user.isVerified == 3 || user.isVerified == "3" ? 'Moderator feedback:' : 'Rejection reason:'}
                        </p>
                        <p className={`text-xs ${
                          user.isVerified == 3 || user.isVerified == "3" ? 'text-orange-700' : 'text-red-700'
                        }`}>
                          {user.moderationMessage}
                        </p>
                      </div>
                    )}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;