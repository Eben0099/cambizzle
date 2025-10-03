import { TrendingUp, Award, Shield, User, Package, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/helpers';

const ProfileOverview = ({ user, userAds, onVerifyIdentity }) => {
  const navigate = useNavigate();

  const handleAdClick = (ad) => {
    navigate(`/ads/${ad.slug}`);
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Activité récente
            </h3>
            <div className="space-y-4">
              {userAds.slice(0, 3).map((ad) => (
                <div 
                  key={ad.id} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleAdClick(ad)}
                >
                  {ad.photos && ad.photos.length > 0 ? (
                    <img
                      src={ad.photos[0].originalUrl}
                      alt={ad.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 hover:text-[#D6BA69] transition-colors">{ad.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-[#D6BA69]">{formatPrice(ad.price)} FCFA</span>
                      <span>•</span>
                      <span>{ad.viewCount || 0} vues</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {userAds.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune annonce publiée</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Créer ma première annonce
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statut du compte */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Statut du compte
            </h3>
            <div className="space-y-4">
              {/* Email vérifié */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.isVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Shield className={`w-4 h-4 ${user.isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email vérifié</p>
                    <p className="text-xs text-gray-500">Votre adresse email est confirmée</p>
                  </div>
                </div>
                {user.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Identité vérifiée */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.isIdentityVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <User className={`w-4 h-4 ${user.isIdentityVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Identité vérifiée</p>
                    <p className="text-xs text-gray-500">Document d'identité validé</p>
                  </div>
                </div>
                {user.isIdentityVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Button variant="outline" size="sm" onClick={onVerifyIdentity}>
                    Vérifier
                  </Button>
                )}
              </div>

              {/* Document d'identité */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Document d'identité
                </h4>
                
                {user.identityDocumentUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.identityDocumentType?.toUpperCase() || 'CNI'} - {user.identityDocumentNumber}
                        </p>
                        <p className="text-xs text-green-600">Document vérifié</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onVerifyIdentity}>
                      Modifier
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Ajoutez votre document d'identité pour vérifier votre compte
                    </p>
                    <Button variant="outline" size="sm" onClick={onVerifyIdentity}>
                      <Upload className="w-4 h-4 mr-2" />
                      Ajouter CNI
                    </Button>
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

export default ProfileOverview;