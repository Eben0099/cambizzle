import { Building2, MapPin, Clock, Globe, Users, Award } from 'lucide-react';

const BusinessProfile = ({ business }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#d6ba69]/10 rounded-lg">
          <Building2 className="w-6 h-6 text-[#d6ba69]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
          <p className="text-sm text-gray-600">Professional Seller</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{business.business_name}</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{business.business_description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {business.business_address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Address</span>
                <p className="text-sm text-gray-900">{business.business_address}</p>
              </div>
            </div>
          )}

          {business.website_url && (
            <div className="flex items-start space-x-3">
              <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Website</span>
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#d6ba69] hover:text-[#c4a855] block"
                >
                  {business.website}
                </a>
              </div>
            </div>
          )}

          {business.yearEstablished && (
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Established</span>
                <p className="text-sm text-gray-900">{business.yearEstablished}</p>
              </div>
            </div>
          )}

          {business.business_phone && (
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                <p className="text-sm text-gray-900">{business.business_phone}</p>
              </div>
            </div>
          )}

          {business.business_email && (
            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                <p className="text-sm text-gray-900">{business.business_email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Options */}
        {business.delivery_options && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Delivery Options</span>
            <div className="flex flex-wrap gap-2">
              {business.delivery_options.pickup && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  In-Store Pickup
                </span>
              )}
              {business.delivery_options.delivery && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Delivery
                </span>
              )}
              {business.delivery_options.shipping && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                  Shipping
                </span>
              )}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        {business.opening_hours && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Opening Hours</span>
            </div>
            <div className="space-y-1">
              {/* Order of days from Monday to Sunday */}
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = business.opening_hours[day];
                if (!hours) return null;
                
                const dayNames = {
                  monday: 'Monday',
                  tuesday: 'Tuesday',
                  wednesday: 'Wednesday',
                  thursday: 'Thursday',
                  friday: 'Friday',
                  saturday: 'Saturday',
                  sunday: 'Sunday'
                };
                
                return (
                  <div key={day} className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-medium">
                      {dayNames[day]}
                    </span>
                    <span className={`${hours.closed ? 'text-red-600' : 'text-gray-600'}`}>
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification Status */}
        {business.is_verified !== undefined && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${business.is_verified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className={`text-xs font-medium ${business.is_verified ? 'text-green-700' : 'text-yellow-700'}`}>
                {business.is_verified ? 'Verified Business' : 'Verification Pending'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;