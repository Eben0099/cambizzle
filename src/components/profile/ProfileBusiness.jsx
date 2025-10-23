import { Store, MapPin, Phone, Mail, Clock, Globe, Facebook, Instagram, Truck, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const ProfileBusiness = ({ sellerProfile, onEditBusiness, onDeleteBusiness }) => {
  if (!sellerProfile) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 sm:p-12 flex flex-col items-center text-center">
          <Store className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Business Profile</h3>
          <p className="text-sm sm:text-base text-gray-500">You haven't created a business profile yet</p>
        </div>
      </div>
    );
  }

  // Order of days of the week
  const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const daysOfWeek = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Business Profile</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="py-2 sm:py-3 text-sm sm:text-base"
            onClick={onEditBusiness}
            aria-label="Edit business profile"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 py-2 sm:py-3 text-sm sm:text-base"
            onClick={onDeleteBusiness}
            aria-label="Delete business profile"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* General Information */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
              General Information
            </h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{sellerProfile.businessName}</h5>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{sellerProfile.businessDescription}</p>
              </div>

              <div className="space-y-3">
                {sellerProfile.businessAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{sellerProfile.businessAddress}</p>
                    </div>
                  </div>
                )}

                {sellerProfile.businessPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
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

              {/* Social Media */}
              {(sellerProfile.websiteUrl || sellerProfile.facebookUrl || sellerProfile.instagramUrl) && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Social Media</p>
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

        {/* Opening Hours and Delivery */}
        <div className="space-y-4 sm:space-y-6">
          {/* Opening Hours */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Opening Hours
              </h4>
              
              <div className="space-y-2 max-h-48 sm:max-h-none overflow-y-auto">
                {weekOrder.map(day => {
                  const hours = sellerProfile.openingHours?.[day];
                  return (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">
                        {daysOfWeek[day]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {hours?.closed ? 'Closed' : hours ? `${hours.open} - ${hours.close}` : 'Not specified'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Delivery Options
              </h4>
              
              <div className="space-y-3">
                {sellerProfile.deliveryOptions?.pickup && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">In-Store Pickup</span>
                  </div>
                )}
                {sellerProfile.deliveryOptions?.delivery && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Local Delivery</span>
                  </div>
                )}
                {sellerProfile.deliveryOptions?.shipping && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-800">Nationwide Shipping</span>
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