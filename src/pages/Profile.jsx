import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfileQuery } from '../hooks/useProfileQuery';
import logger from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileAds from '../components/profile/ProfileAds';
import ProfileFavorites from '../components/profile/ProfileFavorites';
import ProfileBusiness from '../components/profile/ProfileBusiness';
import ProfileSettings from '../components/profile/ProfileSettings';
import Loader from '../components/ui/Loader';
import SellerModal from '../components/seller/SellerModal';
import BusinessEditModal from '../components/seller/BusinessEditModal';

const Profile = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isBusinessEditModalOpen, setIsBusinessEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const location = useLocation();
  // Sync activeTab with URL (e.g., /profile/overview, /profile/settings)
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const tab = parts[1] || 'overview';
    setActiveTab(tab);
  }, [location]);

  const {
    user,
    sellerProfile,
    userAds,
    isLoading,
    updateUser,
    updateSellerProfile,
    deleteAd,
    reloadUserData
  } = useProfileQuery();

  // Vérifier si l'utilisateur est connecté
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-wg-notranslate="true">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">{t('profile.loginRequired')}</h2>
          <p className="text-gray-600 mb-4">{t('profile.loginRequiredMessage')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 rounded-lg transition-colors mr-2 cursor-pointer"
          >
            {t('profile.backToHome')}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/profile/settings');
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateUser(profileData);
    } catch (error) {
      // Géré par React Query
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
    navigate('/profile/settings');
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
      logger.log('Annonce supprimée:', ad);
      // TODO: Afficher un message de succès
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'annonce:', error);
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
      logger.log('Profil business mis à jour:', businessData);
      // TODO: Afficher un message de succès
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil business:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleDeleteBusiness = async () => {
    try {
      // TODO: Implémenter la suppression du profil business via API
      logger.log('Supprimer profil business');
      // TODO: Afficher un message de succès
    } catch (error) {
      logger.error('Erreur lors de la suppression du profil business:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implémenter la suppression du compte via API
      logger.log('Supprimer le compte');
      // TODO: Afficher un message de succès et rediriger
    } catch (error) {
      logger.error('Erreur lors de la suppression du compte:', error);
      // TODO: Afficher un message d'erreur
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-wg-notranslate="true">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D6BA69] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-wg-notranslate="true">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">{t('profile.loadingError')}</h2>
          <p className="text-gray-600 mb-4">{t('profile.loadingErrorMessage')}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 rounded-lg transition-colors mr-2 cursor-pointer"
          >
            {t('profile.retry')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t('profile.backToHome')}
          </button>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gray-50" data-wg-notranslate="true">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
        className="mb-6"
      />

      <ProfileTabs
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
                user={user}
                onCreateAd={handleCreateAd}
                onEditAd={handleEditAd}
                onDeleteAd={handleDeleteAd}
              />
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <ProfileFavorites />
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