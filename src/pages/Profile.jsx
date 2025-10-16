import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileAds from '../components/profile/ProfileAds';
import ProfileFavorites from '../components/profile/ProfileFavorites';
import ProfileBusiness from '../components/profile/ProfileBusiness';
import ProfileSettings from '../components/profile/ProfileSettings';
import SellerModal from '../components/seller/SellerModal';
import BusinessEditModal from '../components/seller/BusinessEditModal';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isBusinessEditModalOpen, setIsBusinessEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    user,
    sellerProfile,
    userAds,
    favoriteAds,
    isLoading,
    updateUser,
    updateSellerProfile,
    deleteAd,
    removeFavorite
  } = useProfile();



  // Vérifier si l'utilisateur est connecté
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Connexion requise</h2>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à votre profil</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 rounded-lg transition-colors mr-2"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setActiveTab('settings');
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateUser(profileData);
      // TODO: Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleBecomeSeller = () => {
    setIsSellerModalOpen(true);
  };

  const handleCreateSellerProfile = (sellerData) => {
    const newSellerProfile = {
      id: Date.now(),
      userId: user.idUser,
      ...sellerData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    updateSellerProfile(newSellerProfile);
    setIsSellerModalOpen(false);
    setActiveTab('business');
  };

  const handleVerifyIdentity = () => {
    setActiveTab('settings');
  };

  const handleCreateAd = () => {
    navigate('/create-ad');
  };

  const handleEditAd = (ad) => {
    navigate(`/edit-ad/${ad.id}`);
  };

  const handleDeleteAd = async (ad) => {
    try {
      await deleteAd(ad.id);
      console.log('Annonce supprimée:', ad);
      // TODO: Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleRemoveFavorite = async (ad) => {
    try {
      await removeFavorite(ad.id);
      console.log('Retiré des favoris:', ad);
      // TODO: Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleEditBusiness = () => {
    setIsBusinessEditModalOpen(true);
  };

  const handleUpdateBusiness = async (businessData) => {
    try {
      const updatedSellerProfile = {
        ...sellerProfile,
        ...businessData,
        updatedAt: new Date()
      };

      await updateSellerProfile(updatedSellerProfile);
      setIsBusinessEditModalOpen(false);
      console.log('Profil business mis à jour:', businessData);
      // TODO: Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil business:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleDeleteBusiness = async () => {
    try {
      // TODO: Implémenter la suppression du profil business via API
      console.log('Supprimer profil business');
      // TODO: Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la suppression du profil business:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implémenter la suppression du compte via API
      console.log('Supprimer le compte');
      // TODO: Afficher un message de succès et rediriger
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D6BA69] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Impossible de charger les informations de votre profil. Veuillez réessayer.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 rounded-lg transition-colors mr-2"
          >
            Réessayer
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Development notice */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Features under development
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Ads and favorites are not yet available on the backend. 
              User and seller profile information is now available.
            </p>
          </div>
        </div>
      </div>

      <ProfileHeader
        user={user}
        sellerProfile={sellerProfile}
        onEdit={handleEditProfile}
        onBecomeSeller={handleBecomeSeller}
        className="mb-6"
      />

      <ProfileStats
        user={user}
        userAds={userAds}
        favoriteAds={favoriteAds}
        className="mb-6"
      />

      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sellerProfile={sellerProfile}
        className="mb-6"
      />

      {/* Main content container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 sm:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProfileOverview
                user={user}
                userAds={userAds}
                onVerifyIdentity={handleVerifyIdentity}
              />
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6">
              <ProfileAds
                userAds={userAds}
                onCreateAd={handleCreateAd}
                onEditAd={handleEditAd}
                onDeleteAd={handleDeleteAd}
              />
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <ProfileFavorites
                favoriteAds={favoriteAds}
                onRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          )}

          {activeTab === 'business' && sellerProfile && (
            <div className="space-y-6">
              <ProfileBusiness
                sellerProfile={sellerProfile}
                onEditBusiness={handleEditBusiness}
                onDeleteBusiness={handleDeleteBusiness}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <ProfileSettings
                user={user}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>
          )}
        </div>
      </div>
    </div>

    <SellerModal
      isOpen={isSellerModalOpen}
      onClose={() => setIsSellerModalOpen(false)}
      onSubmit={handleCreateSellerProfile}
    />

    <BusinessEditModal
      isOpen={isBusinessEditModalOpen}
      onClose={() => setIsBusinessEditModalOpen(false)}
      sellerProfile={sellerProfile}
      onSubmit={handleUpdateBusiness}
    />
  </div>
);
};

export default Profile;