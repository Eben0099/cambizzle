import { Package, Eye, Heart, Calendar } from 'lucide-react';
import useFavorites from '../../hooks/useFavorites';

const ProfileStats = ({ user, userAds }) => {
  const { totalFavorites, favorites, loading } = useFavorites();
  
  console.log('ProfileStats - totalFavorites:', totalFavorites);
  console.log('ProfileStats - favorites:', favorites);
  console.log('ProfileStats - loading:', loading);
  
  const stats = [
    { 
      label: 'Active Ads', 
      value: userAds.filter(ad => ad.status === 'active').length, 
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Total Views', 
      value: userAds.reduce((sum, ad) => sum + (parseInt(ad.viewCount) || 0), 0), 
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Favorites', 
      value: typeof totalFavorites === 'number' ? totalFavorites : parseInt(totalFavorites) || 0,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    { 
      label: 'Member Since', 
      value: user ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }) : '-',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;