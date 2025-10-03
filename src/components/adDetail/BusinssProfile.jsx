import { Building2, MapPin, Clock, Globe, Users, Award } from 'lucide-react';

interface BusinessProfile {
  name: string;
  description: string;
  address?: string;
  website?: string;
  employeeCount?: string;
  yearEstablished?: number;
  specialties?: string[];
  certifications?: string[];
}

interface BusinessProfileProps {
  business: BusinessProfile;
}

const BusinessProfile = ({ business }: BusinessProfileProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#d6ba69]/10 rounded-lg">
          <Building2 className="w-6 h-6 text-[#d6ba69]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profil Entreprise</h3>
          <p className="text-sm text-gray-600">Vendeur professionnel</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{business.name}</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{business.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {business.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Adresse</span>
                <p className="text-sm text-gray-900">{business.address}</p>
              </div>
            </div>
          )}

          {business.website && (
            <div className="flex items-start space-x-3">
              <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Site web</span>
                <a
                  href={business.website}
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
                <span className="text-xs text-gray-500 uppercase tracking-wide">Établie en</span>
                <p className="text-sm text-gray-900">{business.yearEstablished}</p>
              </div>
            </div>
          )}

          {business.employeeCount && (
            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Employés</span>
                <p className="text-sm text-gray-900">{business.employeeCount}</p>
              </div>
            </div>
          )}
        </div>

        {business.specialties && business.specialties.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Spécialités</span>
            <div className="flex flex-wrap gap-2">
              {business.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-[#d6ba69]/10 text-[#d6ba69] px-3 py-1 rounded-full text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {business.certifications && business.certifications.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Certifications</span>
            </div>
            <div className="space-y-1">
              {business.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;