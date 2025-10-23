import { Heart, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const ProfileFavorites = ({ favoriteAds, onRemoveFavorite }) => {
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    navigate(`/ads/${ad.slug}`);
  };

  if (favoriteAds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 sm:p-12 flex flex-col items-center text-center">
          <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Favorites</h3>
          <p className="text-sm sm:text-base text-gray-500">You haven't added any ads to your favorites yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
        My Favorites ({favoriteAds.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {favoriteAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative">
              <img
                src={ad.photos[0]}
                alt={ad.title}
                className="w-full h-40 sm:h-48 object-cover"
              />
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">{ad.title}</h4>
              <p className="text-xl sm:text-2xl font-bold text-[#D6BA69] mb-4">{ad.price} FCFA</p>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 mr-2 py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => handleAdClick(ad)}
                  aria-label="View ad"
                >
                  View Ad
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => onRemoveFavorite(ad)}
                  aria-label="Remove from favorites"
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

export default ProfileFavorites;