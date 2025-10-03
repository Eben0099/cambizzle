import { useState } from 'react';
import { X, Store, MapPin, Phone, Mail, Globe, Facebook, Instagram, Clock, Truck } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const BusinessEditModal = ({ isOpen, onClose, sellerProfile, onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: sellerProfile?.businessName || '',
    businessDescription: sellerProfile?.businessDescription || '',
    businessAddress: sellerProfile?.businessAddress || '',
    businessPhone: sellerProfile?.businessPhone || '',
    businessEmail: sellerProfile?.businessEmail || '',
    websiteUrl: sellerProfile?.websiteUrl || '',
    facebookUrl: sellerProfile?.facebookUrl || '',
    instagramUrl: sellerProfile?.instagramUrl || '',
    openingHours: sellerProfile?.openingHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    },
    deliveryOptions: sellerProfile?.deliveryOptions || {
      pickup: false,
      delivery: false,
      shipping: false
    }
  });

  const [errors, setErrors] = useState({});

  const daysOfWeek = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleDeliveryOptionChange = (option, checked) => {
    setFormData(prev => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'La description est requise';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'L\'adresse est requise';
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Le téléphone est requis';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Modifier les informations business
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Store className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Informations générales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nom de l'entreprise"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  error={errors.businessName}
                  required
                />
              </div>
              <div>
                <Input
                  label="Téléphone professionnel"
                  value={formData.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  error={errors.businessPhone}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'entreprise
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent ${
                  errors.businessDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.businessDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.businessDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Adresse"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  error={errors.businessAddress}
                  required
                />
              </div>
              <div>
                <Input
                  label="Email professionnel"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  error={errors.businessEmail}
                  required
                />
              </div>
            </div>
          </div>

          {/* Présence en ligne */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Présence en ligne
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Site web"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Input
                  label="Facebook"
                  value={formData.facebookUrl}
                  onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Input
                  label="Instagram"
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Horaires d'ouverture
            </h3>

            <div className="space-y-3">
              {Object.entries(daysOfWeek).map(([day, dayLabel]) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-20 text-sm font-medium text-gray-900">
                    {dayLabel}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!formData.openingHours[day]?.closed}
                      onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-[#D6BA69] focus:ring-[#D6BA69]"
                    />
                    <span className="text-sm text-gray-600">Ouvert</span>
                  </div>
                  {!formData.openingHours[day]?.closed && (
                    <>
                      <input
                        type="time"
                        value={formData.openingHours[day]?.open || '09:00'}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">à</span>
                      <input
                        type="time"
                        value={formData.openingHours[day]?.close || '18:00'}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Options de livraison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Options de livraison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.pickup}
                  onChange={(e) => handleDeliveryOptionChange('pickup', e.target.checked)}
                  className="rounded border-gray-300 text-[#D6BA69] focus:ring-[#D6BA69]"
                />
                <span className="text-sm font-medium text-gray-900">Retrait en magasin</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.delivery}
                  onChange={(e) => handleDeliveryOptionChange('delivery', e.target.checked)}
                  className="rounded border-gray-300 text-[#D6BA69] focus:ring-[#D6BA69]"
                />
                <span className="text-sm font-medium text-gray-900">Livraison locale</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.deliveryOptions.shipping}
                  onChange={(e) => handleDeliveryOptionChange('shipping', e.target.checked)}
                  className="rounded border-gray-300 text-[#D6BA69] focus:ring-[#D6BA69]"
                />
                <span className="text-sm font-medium text-gray-900">Expédition nationale</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#D6BA69] hover:bg-[#C5A952] text-black"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessEditModal;
