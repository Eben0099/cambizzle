import { useState } from 'react';
import { User, Shield, Upload, X, Camera, Trash2, Building2, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
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
    photoBase64: null // Pour stocker temporairement le base64
  });

  const [identityDocument, setIdentityDocument] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        // Calculer les nouvelles dimensions en gardant le ratio
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

        // Dessiner l'image compressée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
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
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      console.log('🖼️ Image originale - Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Compresser l'image
      const compressedBlob = await compressImage(file, 800, 800, 0.7);
      console.log('🗜️ Image compressée - Taille:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB');

      // Convertir en base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      console.log('📏 Longueur base64:', base64.length, 'caractères');

      // Créer une URL temporaire pour l'aperçu dans l'interface
      const previewUrl = URL.createObjectURL(compressedBlob);

      setEditFormData(prev => ({
        ...prev,
        photoUrl: previewUrl,
        photoBase64: base64
      }));

      console.log('✅ Image traitée avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      alert('Erreur lors du traitement de l\'image');
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
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleIdentityDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('application/pdf')) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    setIdentityDocument(file);
  };

  const handleSave = () => {
    console.log('💾 handleSave appelé');
    console.log('📊 editFormData actuel:', editFormData);

    // Créer un FormData pour envoyer les données et l'image
    const formData = new FormData();

    // Ajouter les champs texte
    formData.append('first_name', editFormData.firstName);
    formData.append('last_name', editFormData.lastName);
    formData.append('email', editFormData.email);
    formData.append('slug', editFormData.slug);

    // Ajouter le téléphone seulement s'il a changé
    if (editFormData.phone && editFormData.phone !== user?.phone) {
      formData.append('phone', editFormData.phone);
    }

    // Ajouter l'image seulement si elle a été modifiée
    if (editFormData.photoBase64) {
      // Convertir le base64 en Blob pour l'envoyer comme fichier
      const base64Data = editFormData.photoBase64.split(',')[1]; // Retirer le préfixe data:image/jpeg;base64,
      const mimeType = editFormData.photoBase64.split(',')[0].split(':')[1].split(';')[0];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const imageBlob = new Blob([bytes], { type: mimeType });

      formData.append('photo', imageBlob, 'profile-photo.jpg');
      console.log('📸 Image ajoutée au FormData:', imageBlob.size, 'bytes');
    }

    console.log('📤 FormData préparé avec', [...formData.entries()].length, 'champs');
    console.log('🔍 Champs FormData:', [...formData.entries()].map(([key, value]) => `${key}: ${value instanceof Blob ? 'Blob(' + value.size + ' bytes)' : value}`));

    // Vérifier que les données sont valides
    if (!editFormData.firstName || !editFormData.lastName || !editFormData.email) {
      alert('Les champs nom, prénom et email sont requis');
      return;
    }

    onUpdateProfile(formData);
  };

  return (
    <div className="space-y-8">
      {/* Photo de profil */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Photo de profil
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-[#D6BA69] flex items-center justify-center">
                {editFormData.photoUrl ? (
                  <img src={getPhotoUrl(editFormData.photoUrl)} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">
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
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger
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
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG ou GIF. Taille maximale : 5MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Informations personnelles
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleFormInputChange}
                placeholder="Jean"
              />
              <Input
                label="Nom"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleFormInputChange}
                placeholder="Dupont"
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleFormInputChange}
              placeholder="jean.dupont@email.com"
            />
            
            <PhoneInput
              label="Téléphone"
              name="phone"
              value={editFormData.phone}
              onChange={handleFormInputChange}
              placeholder="+237 6 12 34 56 78"
            />

            <Input
              label="Nom d'utilisateur (slug)"
              name="slug"
              value={editFormData.slug}
              onChange={handleFormInputChange}
              placeholder="jean-dupont"
            />
          </div>
        </div>
      </div>

      {/* Vérification d'identité */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Vérification d'identité
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type de document
                </label>
                <select
                  name="identityDocumentType"
                  value={editFormData.identityDocumentType}
                  onChange={handleFormInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="cni">Carte Nationale d'Identité</option>
                  <option value="passport">Passeport</option>
                  <option value="permis">Permis de conduire</option>
                </select>
              </div>
              
              <Input
                label="Numéro du document"
                name="identityDocumentNumber"
                value={editFormData.identityDocumentNumber}
                onChange={handleFormInputChange}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Document d'identité (PDF uniquement)
              </label>
              
              {!identityDocument && !user?.identityDocumentUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D6BA69] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <label htmlFor="identity-document-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-[#D6BA69] hover:text-[#C5A952]">
                      Cliquez pour télécharger votre CNI
                    </span>
                    <span className="text-sm text-gray-600"> ou glissez-déposez</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF uniquement (max. 5MB)
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
                      <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {identityDocument ? identityDocument.name : `${editFormData.identityDocumentType?.toUpperCase() || 'Document'} - ${editFormData.identityDocumentNumber}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {identityDocument ? `${(identityDocument.size / 1024 / 1024).toFixed(2)} MB` : 'Document existant'}
                        </p>
                      </div>
                    </div>
                    <label htmlFor="identity-document-upload-change" className="cursor-pointer">
                      <Button variant="outline" size="sm" type="button">
                        Changer
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
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-[#D6BA69]" />
            Sécurité
          </h3>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Changer mon mot de passe
            </Button>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-red-600 mb-2">Zone de danger</h4>
              <p className="text-sm text-gray-600 mb-4">
                Une fois votre compte supprimé, toutes vos données seront définitivement effacées.
              </p>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Annuler
        </Button>
        <Button onClick={handleSave} className="bg-[#D6BA69] hover:bg-[#C5A952] text-black">
          Enregistrer les modifications
        </Button>
      </div>

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Supprimer le compte</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible 
              et toutes vos données seront définitivement effacées.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  onDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;