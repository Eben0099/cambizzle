import { User, Clock, Star, Shield, MessageCircle, Phone } from 'lucide-react';

const SellerProfile = ({ seller, onContact, onCall }) => {
  console.log('SellerProfile received seller data:', seller);
  
  if (!seller) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Seller</h3>
      
      <div className="flex items-center space-x-4 mb-6">
        {/* Debug avatar URL */}
        {console.log('Avatar URL:', seller.avatar)}
        
        {seller.avatar ? (
          <img
            src={seller.avatar}
            alt={seller.name || 'Seller'}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
            onError={(e) => {
              console.log('Image failed to load:', seller.avatar);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback avatar - always rendered but hidden if image loads */}
        <div 
          className="w-14 h-14 bg-gradient-to-br from-[#d6ba69] to-[#c4a855] rounded-full flex items-center justify-center"
          style={{ display: seller.avatar ? 'none' : 'flex' }}
        >
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{seller.name || 'Seller'}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
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

      {seller.isVerified && (
        <div className="flex items-center space-x-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Verified Seller</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onContact}
          className="w-full bg-[#d6ba69] hover:bg-[#c4a855] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          aria-label="Contact the seller"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Contact Seller</span>
        </button>
        
        {seller.phoneNumber && (
          <button
            onClick={onCall}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            aria-label="Call the seller"
          >
            <Phone className="w-5 h-5" />
            <span>Call</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;