import { useState } from 'react';
import userService from '../../services/userService';
import { User, Shield, Upload, X, Camera, Trash2, Building2, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getPhotoUrl } from '../../utils/helpers';

const ProfileSettings = ({ user, onUpdateProfile, onDeleteAccount }) => {
  const [editFormData, setEditFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    slug: user?.slug || '',
    photoUrl: user?.photoUrl || '',
    identityDocumentType: user?.identityDocumentType || '',
    identityDocumentNumber: user?.identityDocumentNumber || '',
    identityDocumentUrl: user?.identityDocumentUrl || '',
    photoBase64: null // To store temporary base64
  });

  const [identityDocument, setIdentityDocument] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Identity verification upload state
  const [identityUploadLoading, setIdentityUploadLoading] = useState(false);
  const [identityUploadSuccess, setIdentityUploadSuccess] = useState(null);
  const [identityUploadError, setIdentityUploadError] = useState(null);

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw compressed image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('The image must not exceed 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      console.log('🖼️ Original image - Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Compress the image
      const compressedBlob = await compressImage(file, 800, 800, 0.7);
      console.log('🗜️ Compressed image - Size:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB');

      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      console.log('📏 Base64 length:', base64.length, 'characters');

      // Create a temporary URL for preview in the interface
      const previewUrl = URL.createObjectURL(compressedBlob);

      setEditFormData(prev => ({
        ...prev,
        photoUrl: previewUrl,
        photoBase64: base64
      }));

      console.log('✅ Image processed successfully');
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEditFormData(prev => ({ ...prev, photoUrl: '' }));
    } catch (error) {
      console.error('Error during removal:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handler for identity verification document upload
  const handleIdentityVerificationSubmit = async () => {
    setIdentityUploadLoading(true);
    setIdentityUploadSuccess(null);
    setIdentityUploadError(null);
    try {
      if (!editFormData.identityDocumentType || !editFormData.identityDocumentNumber || !identityDocument) {
        setIdentityUploadError('Please provide all required fields and upload a PDF document.');
        setIdentityUploadLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('document_type', editFormData.identityDocumentType);
      formData.append('document_number', editFormData.identityDocumentNumber);
      formData.append('document', identityDocument);
      // Log FormData fields for debug
      console.log('🔒 Identity Verification FormData:', [...formData.entries()].map(([k,v]) => `${k}: ${v instanceof Blob ? v.name : v}`));

      // Always get userId from user prop, fallback to localStorage if missing
      let userId = undefined;
      let userObj = user;
      if (!userObj) {
        try {
          userObj = JSON.parse(localStorage.getItem('user'));
        } catch (e) {
          userObj = undefined;
        }
      }
      // Debug: log user object
      console.log('🆔 User object for identity verification:', userObj);
      if (userObj) {
        userId = userObj.idUser || userObj.id || userObj._id;
      }
      if (!userId) {
        setIdentityUploadError('User ID is missing. Please reconnect.');
        setIdentityUploadLoading(false);
        return;
      }
      const res = await userService.submitIdentityVerification(userId, formData);
      setIdentityUploadSuccess('Document submitted successfully!');
      setIdentityUploadError(null);
    } catch (err) {
      setIdentityUploadError(err?.response?.data?.message || err.message || 'Failed to submit document');
      setIdentityUploadSuccess(null);
    } finally {
      setIdentityUploadLoading(false);
    }
  };

  const handleIdentityDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('application/pdf')) {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('The file must not exceed 5MB');
      return;
    }

    setIdentityDocument(file);
  };

  const handleSave = () => {
    console.log('💾 handleSave called');
    console.log('📊 Current editFormData:', editFormData);

    // Create a FormData to send data and image
    const formData = new FormData();

    // Add text fields
    formData.append('first_name', editFormData.firstName);
    formData.append('last_name', editFormData.lastName);
    formData.append('email', editFormData.email);
    formData.append('slug', editFormData.slug);

    // Add phone only if it has changed
    if (editFormData.phone && editFormData.phone !== user?.phone) {
      formData.append('phone', editFormData.phone);
    }

    // Add image only if it has been modified
    if (editFormData.photoBase64) {
      // Convert base64 to Blob for sending as a file
      const base64Data = editFormData.photoBase64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      const mimeType = editFormData.photoBase64.split(',')[0].split(':')[1].split(';')[0];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const imageBlob = new Blob([bytes], { type: mimeType });

      formData.append('photo', imageBlob, 'profile-photo.jpg');
      console.log('📸 Image added to FormData:', imageBlob.size, 'bytes');
    }

    console.log('📤 FormData prepared with', [...formData.entries()].length, 'fields');
    console.log('🔍 FormData fields:', [...formData.entries()].map(([key, value]) => `${key}: ${value instanceof Blob ? 'Blob(' + value.size + ' bytes)' : value}`));

    // Validate data
    if (!editFormData.firstName || !editFormData.lastName || !editFormData.email) {
      alert('First name, last name, and email are required');
      return;
    }

    onUpdateProfile(formData);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Photo */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Profile Photo
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-[#D6BA69] flex items-center justify-center">
                {editFormData.photoUrl ? (
                  <img src={getPhotoUrl(editFormData.photoUrl)} alt="Profile photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-white">
                    {editFormData.firstName.charAt(0)}{editFormData.lastName.charAt(0)}
                  </span>
                )}
              </div>
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => document.getElementById('photo-upload').click()}
                  aria-label="Upload profile photo"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {editFormData.photoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="text-red-600 hover:bg-red-50"
                    aria-label="Remove profile photo"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                JPG, PNG, or GIF. Maximum size: 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Personal Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleFormInputChange}
                placeholder="John"
              />
              <Input
                label="Last Name"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleFormInputChange}
                placeholder="Doe"
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleFormInputChange}
              placeholder="john.doe@email.com"
            />
            
            <PhoneInput
              country={"cm"}
              value={editFormData.phone}
              onChange={value => handleFormInputChange({ target: { name: "phone", value } })}
              inputStyle={{ width: "100%", height: "40px", borderRadius: "8px", borderColor: "#d1d5db" }}
              containerClass="focus-within:ring-2 focus-within:ring-[#D6BA69]"
              enableSearch
              placeholder="Phone number"
            />

            <Input
              label="Username (slug)"
              name="slug"
              value={editFormData.slug}
              onChange={handleFormInputChange}
              placeholder="john-doe"
            />
          </div>
        </div>
      </div>

      {/* Identity Verification */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Identity Verification
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Document Type
                </label>
                <select
                  name="identityDocumentType"
                  value={editFormData.identityDocumentType}
                  onChange={handleFormInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent"
                >
                  <option value="">Select a type</option>
                  <option value="cni">National ID Card</option>
                  <option value="passport">Passport</option>
                  <option value="license">Driver's License</option>
                </select>
              </div>
              
              <Input
                label="Document Number"
                name="identityDocumentNumber"
                value={editFormData.identityDocumentNumber}
                onChange={handleFormInputChange}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Identity Document (PDF only)
              </label>
              
              {!identityDocument && !user?.identityDocumentUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-[#D6BA69] transition-colors">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-3" />
                  <label htmlFor="identity-document-upload" className="cursor-pointer">
                    <span className="text-xs sm:text-sm font-medium text-[#D6BA69] hover:text-[#C5A952]">
                      Click to upload your ID
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600"> or drag and drop</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF only (max. 5MB)
                  </p>
                  <input
                    id="identity-document-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleIdentityDocumentUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {identityDocument ? identityDocument.name : `${editFormData.identityDocumentType?.toUpperCase() || 'ID'} - ${editFormData.identityDocumentNumber}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {identityDocument ? `${(identityDocument.size / 1024 / 1024).toFixed(2)} MB` : 'Existing document'}
                        </p>
                      </div>
                    </div>
                    <label htmlFor="identity-document-upload-change" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        className="py-2 sm:py-3 text-xs sm:text-sm"
                        aria-label="Change identity document"
                      >
                        Change
                      </Button>
                      <input
                        id="identity-document-upload-change"
                        type="file"
                        accept=".pdf"
                        onChange={handleIdentityDocumentUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
              {/* Identity verification submit button and feedback */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                <Button
                  onClick={handleIdentityVerificationSubmit}
                  disabled={identityUploadLoading}
                  className="bg-[#D6BA69] hover:bg-[#C5A952] text-black py-2 sm:py-3 text-xs sm:text-sm"
                  aria-label="Submit identity verification"
                >
                  {identityUploadLoading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
                {identityUploadSuccess && (
                  <span className="text-green-600 text-xs ml-2">{identityUploadSuccess}</span>
                )}
                {identityUploadError && (
                  <span className="text-red-600 text-xs ml-2">{identityUploadError}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Security
          </h3>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start py-2 sm:py-3 text-xs sm:text-sm"
              aria-label="Change password"
            >
              Change My Password
            </Button>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs sm:text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Once your account is deleted, all your data will be permanently removed.
              </p>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 py-2 sm:py-3 text-xs sm:text-sm"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete account"
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline"
          className="py-2 sm:py-3 text-xs sm:text-sm"
          aria-label="Cancel"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-[#D6BA69] hover:bg-[#C5A952] text-black py-2 sm:py-3 text-xs sm:text-sm"
          aria-label="Save changes"
        >
          Save Changes
        </Button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-red-600">Delete Account</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Are you sure you want to delete your account? This action is irreversible 
              and all your data will be permanently removed.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 sm:py-3 text-xs sm:text-sm"
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 text-xs sm:text-sm"
                onClick={() => {
                  onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
                aria-label="Delete permanently"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;