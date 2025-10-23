import { Shield, Store, Mail, Phone, Calendar, Edit3 } from 'lucide-react';
import Button from '../ui/Button';
import { getPhotoUrl } from '../../utils/helpers';

const ProfileHeader = ({ user, sellerProfile, onEdit, onBecomeSeller }) => {
  if (!user) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#D6BA69] to-[#E8CC7A] h-24 sm:h-32"></div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
            <div className="relative">
              <div className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white rounded-full shadow-lg overflow-hidden bg-[#D6BA69] flex items-center justify-center">
                {user.photoUrl ? (
                  <img 
                    src={getPhotoUrl(user.photoUrl)} 
                    alt={`${user.firstName || ''} ${user.lastName || ''}`} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {(user.firstName?.charAt(0) || '?')}{(user.lastName?.charAt(0) || '?')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
                      {user.firstName || 'First Name'} {user.lastName || 'Last Name'}
                    </h1>
                    <div className="flex gap-2">
                      {user.isVerified && user.isVerified !== "0" && user.isVerified !== false && (
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-green-200">
                          <Shield className="w-3 h-3 mr-1 inline" />
                          Verified
                        </span>
                      )}
                      {sellerProfile && (
                        <span className="bg-[#D6BA69] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          <Store className="w-3 h-3 mr-1 inline" />
                          Seller
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email || 'email@example.com'}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      }) : 'Unknown date'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center sm:justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="py-2 sm:py-3 text-xs sm:text-sm"
                    onClick={onEdit}
                    aria-label="Edit profile"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  {!sellerProfile && (
                    <Button 
                      className="bg-[#D6BA69] hover:bg-[#C5A952] text-black transition-colors py-2 sm:py-3 text-xs sm:text-sm" 
                      onClick={onBecomeSeller}
                      aria-label="Become a seller"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Become a Seller
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