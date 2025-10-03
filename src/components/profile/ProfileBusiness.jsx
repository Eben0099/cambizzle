import { Store, MapPin, Phone, Mail, Clock, Globe, Facebook, Instagram, Truck, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const ProfileBusiness = ({ sellerProfile, onEditBusiness, onDeleteBusiness }) => {
  if (!sellerProfile) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun profil business</h3>
          <p className="text-gray-500">Vous n'avez pas encore créé votre profil business</p>
        </div>
      </div>
    );
  }

  // Ordre des jours de la semaine
  const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const daysOfWeek = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Profil Business</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditBusiness}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={onDeleteBusiness}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Informations générales
            </h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-gray-900">{sellerProfile.businessName}</h5>
                <p className="text-gray-600 mt-1">{sellerProfile.businessDescription}</p>
              </div>

              <div className="space-y-3">
                {sellerProfile.businessAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Adresse</p>
                      <p className="text-sm text-gray-600">{sellerProfile.businessAddress}</p>
                    </div>
                  </div>
                )}

                {sellerProfile.businessPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Téléphone</p>
                      <p className="text-sm text-gray-600">{sellerProfile.businessPhone}</p>
                    </div>
                  </div>
                )}

                {sellerProfile.businessEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{sellerProfile.businessEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Réseaux sociaux */}
              {(sellerProfile.websiteUrl || sellerProfile.facebookUrl || sellerProfile.instagramUrl) && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Réseaux sociaux</p>
                  <div className="flex gap-3">
                    {sellerProfile.websiteUrl && (
                      <a href={sellerProfile.websiteUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-gray-400 hover:text-[#D6BA69] transition-colors">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {sellerProfile.facebookUrl && (
                      <a href={sellerProfile.facebookUrl} target="_blank" rel="noopener noreferrer"
                         className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {sellerProfile.instagramUrl && (
                      <a href={sellerProfile.instagramUrl} target="_blank" rel="noopener noreferrer"
                         className="text-gray-400 hover:text-pink-600 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horaires et livraison */}
        <div className="space-y-6">
          {/* Horaires d'ouverture */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Horaires d'ouverture
              </h4>
              
              <div className="space-y-2">
                {weekOrder.map(day => {
                  const hours = sellerProfile.openingHours?.[day];
                  return (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">
                        {daysOfWeek[day]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {hours?.closed ? 'Fermé' : hours ? `${hours.open} - ${hours.close}` : 'Non défini'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Options de livraison */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Options de livraison
              </h4>
              
              <div className="space-y-3">
                {sellerProfile.deliveryOptions?.pickup && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Retrait en magasin</span>
                  </div>
                )}
                {sellerProfile.deliveryOptions?.delivery && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Livraison locale</span>
                  </div>
                )}
                {sellerProfile.deliveryOptions?.shipping && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-800">Expédition nationale</span>
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

export default ProfileBusiness;