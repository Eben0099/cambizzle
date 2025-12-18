import { Shield, Store, Mail, Phone, Calendar, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { getPhotoUrl } from '../../utils/helpers';
import { useToast } from '../toast/useToast';

const ProfileHeader = ({ user, sellerProfile, onEdit, onBecomeSeller }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  if (!user) return null;

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    showToast({
      type: 'success',
      message: t('profile.referralCodeCopied')
    });
  };

  return (
    <div className="mb-6 sm:mb-8" data-wg-notranslate="true">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#D6BA69] to-[#E8CC7A] h-24 sm:h-32"></div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
            <div className="relative">
              <div className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white rounded-full shadow-lg overflow-hidden bg-[#D6BA69] flex items-center justify-center">
                {user.photoUrl ? (
                  <img
                    src={getPhotoUrl(user.photoUrl)}
                    alt={`${user.firstName || ''} ${user.lastName || ''}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {(user.firstName?.charAt(0) || '?')}{(user.lastName?.charAt(0) || '?')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
                      {user.firstName || t('auth.firstName')} {user.lastName || t('auth.lastName')}
                    </h1>
                    <div className="flex gap-2">
                      {user.isVerified && user.isVerified !== "0" && user.isVerified !== false && (
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-green-200">
                          <Shield className="w-3 h-3 mr-1 inline" />
                          {t('ads.verified')}
                        </span>
                      )}
                      {sellerProfile && (
                        <span className="bg-[#D6BA69] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          <Store className="w-3 h-3 mr-1 inline" />
                          {t('profile.sellerBadge')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email || 'email@example.com'}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('profile.memberSince')} {user.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                        month: 'long',
                        year: 'numeric'
                      }) : t('common.unknown')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center sm:justify-end items-end">
                  {/* Referral Code Section moved here */}
                  {user.referralCode && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded shadow">
                      <span className="font-semibold text-gray-700">{t('profile.referralCode')}:</span>
                      <span className="text-gray-900 select-all text-base font-mono tracking-wider">{user.referralCode}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 text-xs bg-[#D6BA69] text-white rounded hover:bg-[#C5A952] transition-colors cursor-pointer"
                        onClick={handleCopyReferralCode}
                      >
                        {t('profile.copy')}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="py-2 sm:py-3 text-xs sm:text-sm"
                      onClick={onEdit}
                      aria-label={t('common.edit')}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {t('common.edit')}
                    </Button>

                    {!sellerProfile && (
                      <Button
                        className="bg-[#D6BA69] hover:bg-[#C5A952] text-black transition-colors py-2 sm:py-3 text-xs sm:text-sm"
                        onClick={onBecomeSeller}
                        aria-label={t('profile.becomeSeller')}
                      >
                        <Store className="w-4 h-4 mr-2" />
                        {t('profile.becomeSeller')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
