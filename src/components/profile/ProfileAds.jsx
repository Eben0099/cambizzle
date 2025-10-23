import { Package, Plus, Eye, Calendar, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/helpers';

const ProfileAds = ({ userAds, onCreateAd, onEditAd, onDeleteAd }) => {
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    navigate(`/ads/${ad.slug}`);
  };

  if (userAds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 sm:p-12 flex flex-col items-center text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Ads</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">You haven't posted any ads yet</p>
          <Button 
            onClick={onCreateAd} 
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create My First Ad
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          My Ads ({userAds.length})
        </h3>
        <Button 
          onClick={onCreateAd} 
          className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ad
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
                  src={ad.photos[0].originalUrl}
                  alt={ad.title}
                  className="w-full h-40 sm:h-48 object-cover"
                />
              ) : (
                <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ad.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : ad.moderationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {ad.status === 'active' ? 'Active' : ad.moderationStatus === 'pending' ? 'Pending' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h4 
                className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#D6BA69] transition-colors"
                onClick={() => handleAdClick(ad)}
              >
                {ad.title}
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-[#D6BA69] mb-3">
                {formatPrice(ad.price)} FCFA
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(ad.viewCount || 0)} views
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(ad.createdAt).toLocaleDateString('en-US')}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => onEditAd(ad)}
                  aria-label="Edit ad"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 py-2 sm:py-3 text-sm sm:text-base"
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
    </div>
  );
};

export default ProfileAds;