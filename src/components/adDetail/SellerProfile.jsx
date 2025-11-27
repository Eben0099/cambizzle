import React from 'react';
import { User, Clock, Star, Shield, MessageCircle, Phone } from 'lucide-react';
import WhatsappIcon from '../icons/WhatsappIcon';
import Modal from './Modal';

const SellerProfile = ({ seller, onContact, onCall, adTitle }) => {
  // State pour afficher la modale contact
  const [showContactModal, setShowContactModal] = React.useState(false);

  if (!seller) return null;

  // Handler pour le bouton WhatsApp avec message prédéfini
  const handleWhatsapp = (adTitle = 'your ad') => {
    if (seller.phoneNumber) {
      const message = `Hello! I'm interested in ${adTitle} that you posted on Cambizzle. Could you please provide more information? Thank you!`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${seller.phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Seller</h3>
        <div className="flex items-center space-x-4 mb-6">
          {seller.avatar ? (
            <img
              src={seller.avatar}
              alt={seller.name || 'Seller'}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-14 h-14 bg-gradient-to-br from-[#d6ba69] to-[#c4a855] rounded-full flex items-center justify-center"
            style={{ display: seller.avatar ? 'none' : 'flex' }}
          >
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg">{seller.name || 'Seller'}</h4>
            {seller.isVerified && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 rounded border border-green-200 w-fit">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Verified Seller</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4" />
              <span>Member since {seller.memberSince || 'N/A'}</span>
            </div>
          </div>
        </div>
        {/* Seller Stats */}
        <div className="space-y-3 mb-6">
          {seller.rating !== undefined && seller.rating > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rating</span>
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
              <span className="text-sm text-gray-600">Response Rate</span>
              <span className="text-sm font-medium text-gray-900">{seller.responseRate}%</span>
            </div>
          )}
          {seller.responseTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">{seller.responseTime}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full bg-[#d6ba69] hover:bg-[#c4a855] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            aria-label="Contact the seller"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Contact Seller</span>
          </button>
        </div>
      </div>
      {/* Modal Contact Seller */}
      {showContactModal && (
        <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Seller Information">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {seller.avatar ? (
                <img src={seller.avatar} alt="Seller" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#d6ba69] to-[#c4a855] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">{seller.name || 'Seller'}</div>
                <div className="text-sm text-gray-600">Member since {seller.memberSince || 'N/A'}</div>
              </div>
            </div>
            {seller.phoneNumber && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-600">Phone</span>
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
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    aria-label="Contact on WhatsApp"
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