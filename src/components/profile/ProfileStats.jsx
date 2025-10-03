import { Package, Eye, Heart, Calendar } from 'lucide-react';

const ProfileStats = ({ user, userAds, favoriteAds }) => {
  const stats = [
    { 
      label: 'Annonces actives', 
      value: userAds.filter(ad => ad.status === 'active').length, 
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Vues totales', 
      value: userAds.reduce((sum, ad) => sum + ad.viewCount, 0), 
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Favoris', 
      value: favoriteAds.length, 
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    { 
      label: 'Membre depuis', 
      value: user ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
        month: 'short', 
        year: 'numeric' 
      }) : '-',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
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