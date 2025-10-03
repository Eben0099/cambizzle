import { User, Package, Heart, Store, Settings } from 'lucide-react';

const ProfileTabs = ({ activeTab, setActiveTab, sellerProfile }) => {
  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: User },
    { id: 'ads', label: 'Mes annonces', icon: Package },
    { id: 'favorites', label: 'Favoris', icon: Heart },
    ...(sellerProfile ? [{ id: 'business', label: 'Business Info', icon: Store }] : []),
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#D6BA69] text-[#D6BA69]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProfileTabs;