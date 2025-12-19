import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Star, Shield, MessageCircle, Phone } from 'lucide-react';
import WhatsappIcon from '../icons/WhatsappIcon';
import Modal from './Modal';
import Avatar from '../ui/Avatar';

const SellerProfile = ({ seller, onContact, onCall, adTitle }) => {
  const { t } = useTranslation();
  // State pour afficher la modale contact
  const [showContactModal, setShowContactModal] = React.useState(false);

  if (!seller) return null;

  // Handler pour le bouton WhatsApp avec message prédéfini
  const handleWhatsapp = (adTitle = 'your ad') => {
    if (seller.phoneNumber) {
      const message = t('adDetail.whatsappMessage', { adTitle });
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${seller.phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
    }
  };

  // Extract first and last name from seller.name
  const nameParts = (seller.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('adDetail.seller')}</h3>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar
            src={seller.avatar}
            firstName={firstName}
            lastName={lastName}
            size="lg"
            className="ring-2 ring-gray-100"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg">{seller.name || t('adDetail.seller')}</h4>
            {seller.isVerified && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 rounded border border-green-200 w-fit">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">{t('adDetail.verifiedSeller')}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4" />
              <span>{t('adDetail.memberSince')} {seller.memberSince || 'N/A'}</span>
            </div>
          </div>
        </div>
        {/* Seller Stats */}
        <div className="space-y-3 mb-6">
          {seller.rating !== undefined && seller.rating > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('adDetail.rating')}</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(seller.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {seller.rating}/5 ({seller.reviewCount || 0})
                </span>
              </div>
            </div>
          )}
          {seller.responseRate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('adDetail.responseRate')}</span>
              <span className="text-sm font-medium text-gray-900">{seller.responseRate}%</span>
            </div>
          )}
          {seller.responseTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('adDetail.responseTime')}</span>
              <span className="text-sm font-medium text-gray-900">{seller.responseTime}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full bg-[#d6ba69] hover:bg-[#c4a855] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            aria-label={t('adDetail.contactSeller')}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('adDetail.contactSeller')}</span>
          </button>
        </div>
      </div>
      {/* Modal Contact Seller */}
      {showContactModal && (
        <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title={t('adDetail.sellerInfo')}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={seller.avatar}
                firstName={firstName}
                lastName={lastName}
                size="md"
              />
              <div>
                <div className="font-semibold text-gray-900">{seller.name || t('adDetail.seller')}</div>
                <div className="text-sm text-gray-600">{t('adDetail.memberSince')} {seller.memberSince || 'N/A'}</div>
              </div>
            </div>
            {seller.phoneNumber && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-600">{t('adDetail.phone')}</span>
                </div>
                <span className="font-medium text-gray-900">{seller.phoneNumber}</span>
              </div>
            )}
            {/* Autres infos pertinentes */}
            {seller.email && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{seller.email}</span>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {seller.phoneNumber && (
                <div className="flex w-full justify-end">
                  <button
                    onClick={() => handleWhatsapp(adTitle)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    aria-label={t('adDetail.contactWhatsApp')}
                  >
                    <span>WhatsApp</span>
                    <WhatsappIcon size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SellerProfile;
