import { useState } from 'react';
import { Store, Globe, Facebook, Instagram, Clock, ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import Modal from '../ui/Modal';

const SellerModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [identityDocument, setIdentityDocument] = useState(null);
  const [identityDocumentPreview, setIdentityDocumentPreview] = useState(null);

  // Ordre des jours de la semaine pour l'affichage
  const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const [sellerData, setSellerData] = useState({
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    identityDocumentType: 'cni',
    identityDocumentNumber: '',
    openingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    deliveryOptions: {
      pickup: true,
      delivery: false,
      shipping: false
    }
  });

  const { user, updateSellerProfile } = useAuth();

  const resetModal = () => {
    setIsLoading(false);
    setErrors({});
    setIdentityDocument(null);
    setIdentityDocumentPreview(null);
    setSellerData({
      businessName: '',
      businessDescription: '',
      businessAddress: '',
      businessPhone: user?.phone || '',
      businessEmail: user?.email || '',
      websiteUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      identityDocumentType: 'cni',
      identityDocumentNumber: '',
      openingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      deliveryOptions: {
        pickup: true,
        delivery: false,
        shipping: false
      }
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSellerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSellerData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    setSellerData(prev => ({
      ...prev,
      businessPhone: value
    }));
    
    if (errors.businessPhone) {
      setErrors(prev => ({ ...prev, businessPhone: '' }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setSellerData(prev => ({
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

  const handleDocumentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        identityDocument: 'Format non supporté. Utilisez JPG, PNG ou PDF.' 
      }));
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        identityDocument: 'Le fichier ne doit pas dépasser 5MB.' 
      }));
      return;
    }

    setIdentityDocument(file);
    
    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdentityDocumentPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIdentityDocumentPreview(null);
    }

    // Effacer l'erreur s'il y en avait une
    if (errors.identityDocument) {
      setErrors(prev => ({ ...prev, identityDocument: '' }));
    }
  };

  const removeDocument = () => {
    setIdentityDocument(null);
    setIdentityDocumentPreview(null);
    // Reset file input
    const fileInput = document.getElementById('identity-document-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!sellerData.businessName.trim()) newErrors.businessName = 'Nom de l\'entreprise requis';
    if (!sellerData.businessDescription.trim()) newErrors.businessDescription = 'Description de l\'entreprise requise';
    if (!sellerData.businessAddress.trim()) newErrors.businessAddress = 'Adresse de l\'entreprise requise';
    if (!sellerData.businessPhone.trim()) newErrors.businessPhone = 'Téléphone de l\'entreprise requis';
    if (!sellerData.businessEmail.trim()) newErrors.businessEmail = 'Email de l\'entreprise requis';
    if (!sellerData.identityDocumentNumber.trim()) newErrors.identityDocumentNumber = 'Numéro de CNI requis';
    if (!identityDocument) newErrors.identityDocument = 'Document d\'identité requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simuler l'upload du document
      let documentUrl = null;
      if (identityDocument) {
        // Dans une vraie app, uploadez le fichier vers votre serveur/cloud storage
        const formData = new FormData();
        formData.append('document', identityDocument);
        // const uploadResponse = await fetch('/api/upload-document', { method: 'POST', body: formData });
        // const { url } = await uploadResponse.json();
        documentUrl = URL.createObjectURL(identityDocument); // Temporaire pour la démo
      }

      const result = await updateSellerProfile({
        ...sellerData,
        identityDocumentUrl: documentUrl
      });

      if (result.success) {
        handleClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Erreur lors de la création du profil vendeur' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Devenir vendeur
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Complétez les informations de votre entreprise
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Business Information Section */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Store className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Informations de l'entreprise</h3>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Nom de l'entreprise"
                    name="businessName"
                    value={sellerData.businessName}
                    onChange={handleInputChange}
                    error={errors.businessName}
                    placeholder="Mon Entreprise SARL"
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description de l'entreprise
                    </label>
                    <textarea
                      name="businessDescription"
                      value={sellerData.businessDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent resize-none text-sm sm:text-base"
                      placeholder="Décrivez votre activité, vos produits et services..."
                      required
                    />
                    {errors.businessDescription && (
                      <p className="text-sm text-red-600">{errors.businessDescription}</p>
                    )}
                  </div>

                  <Input
                    label="Adresse de l'entreprise"
                    name="businessAddress"
                    value={sellerData.businessAddress}
                    onChange={handleInputChange}
                    error={errors.businessAddress}
                    placeholder="123 Rue de la Paix, Douala"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PhoneInput
                      label="Téléphone professionnel"
                      name="businessPhone"
                      value={sellerData.businessPhone}
                      onChange={handlePhoneChange}
                      error={errors.businessPhone}
                      placeholder="+237 6 12 34 56 78"
                      required
                    />
                    <Input
                      label="Email professionnel"
                      type="email"
                      name="businessEmail"
                      value={sellerData.businessEmail}
                      onChange={handleInputChange}
                      error={errors.businessEmail}
                      placeholder="contact@monentreprise.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Identity Verification Section */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Vérification d'identité</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Type de document
                      </label>
                      <select
                        name="identityDocumentType"
                        value={sellerData.identityDocumentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="cni">Carte Nationale d'Identité</option>
                        <option value="passport">Passeport</option>
                        <option value="permis">Permis de conduire</option>
                      </select>
                    </div>
                    
                    <Input
                      label="Numéro du document"
                      name="identityDocumentNumber"
                      value={sellerData.identityDocumentNumber}
                      onChange={handleInputChange}
                      error={errors.identityDocumentNumber}
                      placeholder="123456789"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Document d'identité (CNI, Passeport, etc.)
                    </label>
                    
                    {!identityDocument ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D6BA69] transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <label htmlFor="identity-document-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-[#D6BA69] hover:text-[#C5A952]">
                            Cliquez pour télécharger
                          </span>
                          <span className="text-sm text-gray-600"> ou glissez-déposez</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG ou PDF (max. 5MB)
                        </p>
                        <input
                          id="identity-document-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleDocumentUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {identityDocumentPreview ? (
                              <img
                                src={identityDocumentPreview}
                                alt="Aperçu du document"
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                <Upload className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {identityDocument.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(identityDocument.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeDocument}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {errors.identityDocument && (
                      <p className="text-sm text-red-600">{errors.identityDocument}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Online Presence Section */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Présence en ligne (optionnel)</h3>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Site web"
                    name="websiteUrl"
                    value={sellerData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.monentreprise.com"
                    icon={Globe}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Page Facebook"
                      name="facebookUrl"
                      value={sellerData.facebookUrl}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/monentreprise"
                      icon={Facebook}
                    />
                    <Input
                      label="Compte Instagram"
                      name="instagramUrl"
                      value={sellerData.instagramUrl}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/monentreprise"
                      icon={Instagram}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options Section */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Options de livraison</h3>
                <div className="space-y-3">
                  {[
                    { key: 'pickup', label: 'Retrait en magasin' },
                    { key: 'delivery', label: 'Livraison locale' },
                    { key: 'shipping', label: 'Expédition nationale' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-3">
                      <input
                        id={key}
                        name={`deliveryOptions.${key}`}
                        type="checkbox"
                        checked={sellerData.deliveryOptions[key]}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
                      />
                      <label htmlFor={key} className="text-sm sm:text-base text-gray-700 flex-1">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening Hours Section */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {weekOrder.map(day => {
                    const hours = sellerData.openingHours[day];
                    return (
                      <div key={day} className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                        <div className="w-full sm:w-24 text-sm font-medium text-gray-700 capitalize">
                          {day === 'monday' ? 'Lundi' :
                           day === 'tuesday' ? 'Mardi' :
                           day === 'wednesday' ? 'Mercredi' :
                           day === 'thursday' ? 'Jeudi' :
                           day === 'friday' ? 'Vendredi' :
                           day === 'saturday' ? 'Samedi' : 'Dimanche'}
                        </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                          className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded flex-shrink-0"
                        />
                        {!hours.closed ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20"
                            />
                            <span className="text-gray-500 text-sm">-</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Fermé</span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 sm:py-4 text-sm sm:text-base"
                loading={isLoading}
                disabled={isLoading}
              >
                Créer mon profil vendeur
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SellerModal;
