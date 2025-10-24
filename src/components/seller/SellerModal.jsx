import { useState } from 'react';
import { Store, Globe, Facebook, Instagram, Clock, Upload, X } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

const SellerModal = ({ isOpen, onClose }) => {
  const { user, updateSellerProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [identityDocument, setIdentityDocument] = useState(null);
  const [identityDocumentPreview, setIdentityDocumentPreview] = useState(null);

  const weekOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const [sellerData, setSellerData] = useState({
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

  const resetModal = () => {
    setIsLoading(false);
    setErrors({});
    setIdentityDocument(null);
    setIdentityDocumentPreview(null);
    setSellerData(prev => ({
      ...prev,
      businessPhone: user?.phone || '',
      businessEmail: user?.email || ''
    }));
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (value) => {
    setSellerData(prev => ({ ...prev, businessPhone: value }));
    if (errors.businessPhone) setErrors(prev => ({ ...prev, businessPhone: '' }));
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

    const allowedTypes = ['image/jpeg','image/jpg','image/png','application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, identityDocument: 'Unsupported format. Use JPG, PNG or PDF.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, identityDocument: 'File must not exceed 5MB.' }));
      return;
    }

    setIdentityDocument(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setIdentityDocumentPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setIdentityDocumentPreview(null);
    }
    if (errors.identityDocument) setErrors(prev => ({ ...prev, identityDocument: '' }));
  };

  const removeDocument = () => {
    setIdentityDocument(null);
    setIdentityDocumentPreview(null);
    const fileInput = document.getElementById('identity-document-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const newErrors = {};

    if (!sellerData.businessName.trim()) newErrors.businessName = 'Business name required';
    if (!sellerData.businessDescription.trim()) newErrors.businessDescription = 'Business description required';
    if (!sellerData.businessAddress.trim()) newErrors.businessAddress = 'Business address required';
    if (!sellerData.businessPhone || !isValidPhoneNumber(sellerData.businessPhone)) newErrors.businessPhone = 'Valid phone number required';
    if (!sellerData.businessEmail.trim() || !/\S+@\S+\.\S+/.test(sellerData.businessEmail)) newErrors.businessEmail = 'Valid email required';
    if (!sellerData.identityDocumentNumber.trim()) newErrors.identityDocumentNumber = 'ID number required';
    if (!identityDocument) newErrors.identityDocument = 'Identity document required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      let documentUrl = null;
      if (identityDocument) documentUrl = URL.createObjectURL(identityDocument);

      const result = await updateSellerProfile({ ...sellerData, identityDocumentUrl: documentUrl });
      if (result.success) handleClose();
      else setErrors({ submit: result.error });
    } catch {
      setErrors({ submit: 'Error creating seller profile' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Become a Seller</h2>
              <p className="text-sm sm:text-base text-gray-600">Complete your business information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Business Info */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Store className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                </div>

                <Input
                  label="Business Name"
                  name="businessName"
                  value={sellerData.businessName}
                  onChange={handleInputChange}
                  error={errors.businessName}
                  placeholder="My Company LLC"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Business Description</label>
                  <textarea
                    name="businessDescription"
                    value={sellerData.businessDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent resize-none text-sm sm:text-base"
                    placeholder="Describe your business, products, and services..."
                    required
                  />
                  {errors.businessDescription && <p className="text-sm text-red-600">{errors.businessDescription}</p>}
                </div>

                <Input
                  label="Business Address"
                  name="businessAddress"
                  value={sellerData.businessAddress}
                  onChange={handleInputChange}
                  error={errors.businessAddress}
                  placeholder="123 Peace Street, Douala"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                    <PhoneInput
                      international
                      defaultCountry="CM"
                      value={sellerData.businessPhone}
                      onChange={handlePhoneChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent"
                      placeholder="+237 6 12 34 56 78"
                    />
                    {errors.businessPhone && <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>}
                  </div>

                  <Input
                    label="Business Email"
                    type="email"
                    name="businessEmail"
                    value={sellerData.businessEmail}
                    onChange={handleInputChange}
                    error={errors.businessEmail}
                    placeholder="contact@mycompany.com"
                    required
                  />
                </div>
              </div>

              {/* Identity Verification */}
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <select
                      name="identityDocumentType"
                      value={sellerData.identityDocumentType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="cni">National ID</option>
                      <option value="passport">Passport</option>
                      <option value="permis">Driver's License</option>
                    </select>
                  </div>

                  <Input
                    label="Document Number"
                    name="identityDocumentNumber"
                    value={sellerData.identityDocumentNumber}
                    onChange={handleInputChange}
                    error={errors.identityDocumentNumber}
                    placeholder="123456789"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Upload Identity Document</label>

                  {!identityDocument ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D6BA69] transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <label htmlFor="identity-document-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-[#D6BA69] hover:text-[#C5A952]">Click to upload</span>
                        <span className="text-sm text-gray-600"> or drag & drop</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</p>
                      <input id="identity-document-upload" type="file" accept="image/*,.pdf" onChange={handleDocumentUpload} className="hidden" />
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {identityDocumentPreview ? (
                          <img src={identityDocumentPreview} alt="Document Preview" className="w-16 h-16 object-cover rounded border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{identityDocument.name}</p>
                          <p className="text-xs text-gray-500">{(identityDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeDocument} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                  {errors.identityDocument && <p className="text-sm text-red-600">{errors.identityDocument}</p>}
                </div>
              </div>

              {/* Online Presence */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Online Presence (Optional)</h3>
                </div>

                <Input
                  label="Website"
                  name="websiteUrl"
                  value={sellerData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.mycompany.com"
                  icon={Globe}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Facebook Page"
                    name="facebookUrl"
                    value={sellerData.facebookUrl}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/mycompany"
                    icon={Facebook}
                  />
                  <Input
                    label="Instagram Account"
                    name="instagramUrl"
                    value={sellerData.instagramUrl}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/mycompany"
                    icon={Instagram}
                  />
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Delivery Options</h3>
                <div className="space-y-3">
                  {['pickup','delivery','shipping'].map((key) => (
                    <div key={key} className="flex items-center space-x-3">
                      <input
                        id={key}
                        name={`deliveryOptions.${key}`}
                        type="checkbox"
                        checked={sellerData.deliveryOptions[key]}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
                      />
                      <label htmlFor={key} className="text-sm sm:text-base text-gray-700 flex-1 capitalize">
                        {key === 'pickup' ? 'In-store Pickup' : key === 'delivery' ? 'Local Delivery' : 'National Shipping'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#D6BA69]" />
                  <h3 className="text-lg font-medium text-gray-900">Opening Hours</h3>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {weekOrder.map(day => {
                    const hours = sellerData.openingHours[day];
                    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                    return (
                      <div key={day} className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                        <div className="w-full sm:w-24 text-sm font-medium text-gray-700 capitalize">{dayName}</div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={e => handleOpeningHoursChange(day,'closed',!e.target.checked)}
                            className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded flex-shrink-0"
                          />
                          {!hours.closed ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input type="time" value={hours.open} onChange={e=>handleOpeningHoursChange(day,'open',e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20" />
                              <span className="text-gray-500 text-sm">-</span>
                              <input type="time" value={hours.close} onChange={e=>handleOpeningHoursChange(day,'close',e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20" />
                            </div>
                          ) : <span className="text-gray-500 text-sm">Closed</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {errors.submit && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600">{errors.submit}</p></div>}

              <Button type="submit" variant="primary" className="w-full py-3 sm:py-4 text-sm sm:text-base bg-[#D6BA69]" loading={isLoading} disabled={isLoading}>
                Create My Seller Profile
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SellerModal;
