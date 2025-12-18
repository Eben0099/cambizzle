import { User, Package, Heart, Store, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfileTabs = ({ sellerProfile }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'overview', label: t('profile.overview'), icon: User },
    { id: 'ads', label: t('profile.myAds'), icon: Package },
    { id: 'favorites', label: t('profile.favorites'), icon: Heart },
    ...(sellerProfile ? [{ id: 'business', label: t('profile.business'), icon: Store }] : []),
    { id: 'settings', label: t('profile.settings'), icon: Settings }
  ];

  return (
    <div className="mb-6 sm:mb-8" data-wg-notranslate="true">
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-4 sm:px-6">
        <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={`/profile/${tab.id}`}
                className={({ isActive }) => `flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'border-[#D6BA69] text-[#D6BA69]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-label={tab.label}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProfileTabs;
