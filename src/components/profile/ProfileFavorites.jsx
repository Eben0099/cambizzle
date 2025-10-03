import { Heart, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const ProfileFavorites = ({ favoriteAds, onRemoveFavorite }) => {
  if (favoriteAds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori</h3>
          <p className="text-gray-500">Vous n'avez pas encore ajouté d'annonces en favoris</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Mes favoris ({favoriteAds.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative">
              <img
                src={ad.photos[0]}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{ad.title}</h4>
              <p className="text-2xl font-bold text-[#D6BA69] mb-4">{ad.price}€</p>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="flex-1 mr-2">
                  Voir l'annonce
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onRemoveFavorite(ad)}
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