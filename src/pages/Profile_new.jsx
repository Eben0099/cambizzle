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
import Loader from '../components/ui/Loader';
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
    isLoading,
    reloadUserData
  } = useProfile();

  // Redirect if not authenticated
  if (!isAuthenticated && !authLoading) {
    navigate('/login');
    return null;
  }

  if (isLoading || authLoading) {
    return <Loader />;
  }

  return (
    <>
      {/* Profile Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          onVerifyIdentity={() => setIsSellerModalOpen(true)}
          onEditBusiness={() => setIsBusinessEditModalOpen(true)}
        />

        {/* Profile Stats */}
        <div className="mt-8">
          <ProfileStats user={user} userAds={userAds} />
        </div>

        {/* Profile Tabs */}
        <div className="mt-8">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <ProfileOverview 
              user={user} 
              userAds={userAds.slice(0, 5)} 
              onVerifyIdentity={() => setIsSellerModalOpen(true)} 
            />
          )}
          {activeTab === 'ads' && <ProfileAds userAds={userAds} />}
          {activeTab === 'favorites' && <ProfileFavorites />}
          {activeTab === 'business' && (
            <ProfileBusiness 
              user={user}
              onVerifyIdentity={() => setIsSellerModalOpen(true)}
              onEditBusiness={() => setIsBusinessEditModalOpen(true)}
            />
          )}
          {activeTab === 'settings' && (
            <ProfileSettings user={user} onSaved={reloadUserData} />
          )}
        </div>
      </div>

      {/* Modals */}
      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onVerified={reloadUserData}
      />
      <BusinessEditModal
        isOpen={isBusinessEditModalOpen}
        onClose={() => setIsBusinessEditModalOpen(false)}
        onSaved={reloadUserData}
      />
    </>
  );
};

export default Profile;