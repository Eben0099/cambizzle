import { Shield, Store, Mail, Phone, Calendar, Edit3 } from 'lucide-react';
import Button from '../ui/Button';
import { getPhotoUrl } from '../../utils/helpers';

const ProfileHeader = ({ user, sellerProfile, onEdit, onBecomeSeller }) => {
  if (!user) return null;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#D6BA69] to-[#E8CC7A] h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <div className="relative">
              <div className="h-32 w-32 border-4 border-white rounded-full shadow-lg overflow-hidden bg-[#D6BA69] flex items-center justify-center">
                {user.photoUrl ? (
                  <img src={getPhotoUrl(user.photoUrl)} alt={`${user.firstName || ''} ${user.lastName || ''}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(user.firstName?.charAt(0) || '?')}{(user.lastName?.charAt(0) || '?')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.firstName || 'Prénom'} {user.lastName || 'Nom'}
                    </h1>
                    {user.isVerified && user.isVerified !== "0" && user.isVerified !== false && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                        <Shield className="w-3 h-3 mr-1 inline" />
                        Vérifié
                      </span>
                    )}
                    {sellerProfile && (
                      <span className="bg-[#D6BA69] text-white px-3 py-1 rounded-full text-sm font-medium">
                        <Store className="w-3 h-3 mr-1 inline" />
                        Vendeur
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email || 'email@exemple.com'}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Membre depuis {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      }) : 'Date inconnue'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  
                  {!sellerProfile && (
                    <Button 
                      className="bg-[#D6BA69] hover:bg-[#C5A952] text-black transition-colors" 
                      onClick={onBecomeSeller}
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Devenir vendeur
                    </Button>
                  )}
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