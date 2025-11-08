import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdCard from '../ads/AdCard';
import useFavorites from '../../hooks/useFavorites';
import Loader from '../ui/Loader';

const ProfileFavorites = () => {
  const navigate = useNavigate();
  const { favorites, loading } = useFavorites();

  if (loading) {
    return <Loader />;
  }

  if (favorites.length === 0) {
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
        My Favorites ({favorites.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {favorites.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileFavorites;