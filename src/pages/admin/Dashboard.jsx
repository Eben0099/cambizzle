import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { Users, FileText, AlertTriangle, DollarSign, TrendingUp, Eye, Loader2, CheckCircle, XCircle, Clock, Shield, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentLogs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      
      if (response.status === 'success') {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      console.error('Erreur dashboard:', err);
      setError(err.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await adminService.getRecentModerationLogs(5);
      
      if (response.status === 'success') {
        setRecentLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Erreur logs récents:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Calcul des statistiques basé sur les vraies données
  const getStats = () => {
    if (!dashboardData) return [];

    return [
      {
        title: "Total Utilisateurs",
        value: dashboardData.users.total.toString(),
        change: `+${dashboardData.users.newThisWeek} cette semaine`,
        icon: Users,
        color: "text-blue-600",
        subtitle: `${dashboardData.users.active} actifs, ${dashboardData.users.verified} vérifiés`
      },
      {
        title: "Total Annonces",
        value: dashboardData.ads.total.toString(),
        change: `+${dashboardData.ads.newThisWeek} cette semaine`,
        icon: FileText,
        color: "text-primary",
        subtitle: `${dashboardData.ads.approved} approuvées`
      },
      {
        title: "En Attente",
        value: dashboardData.ads.pending.toString(),
        change: "À modérer",
        icon: AlertTriangle,
        color: "text-yellow-600",
        subtitle: "Annonces en attente"
      },
      {
        title: "Signalements",
        value: dashboardData.reports.total.toString(),
        change: `${dashboardData.reports.pending} en cours`,
        icon: AlertTriangle,
        color: "text-destructive",
        subtitle: `${dashboardData.reports.resolved} résolus`
      },
      {
        title: "Vues Totales",
        value: dashboardData.ads.totalViews.toString(),
        change: "Au total",
        icon: Eye,
        color: "text-purple-600",
        subtitle: "Toutes annonces confondues"
      },
      {
        title: "Activité 7 jours",
        value: (dashboardData.activity.ads7Days + dashboardData.activity.users7Days + dashboardData.activity.messages7Days).toString(),
        change: `${dashboardData.activity.ads7Days} annonces, ${dashboardData.activity.users7Days} utilisateurs`,
        icon: TrendingUp,
        color: "text-green-600",
        subtitle: "Activité récente"
      },
    ];
  };

  // Fonctions utilitaires pour les logs
  const getActionLabel = (actionType) => {
    const actions = {
      'ad_approve': 'Annonce approuvée',
      'ad_reject': 'Annonce rejetée',
      'ad_suspend': 'Annonce suspendue',
      'user_suspend': 'Utilisateur suspendu',
      'user_unsuspend': 'Utilisateur réactivé',
      'user_verify': 'Utilisateur vérifié',
      'user_unverify': 'Vérification retirée',
      'user_delete': 'Utilisateur supprimé',
    };
    return actions[actionType] || actionType;
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('approve') || actionType.includes('verify') || actionType.includes('unsuspend')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (actionType.includes('reject') || actionType.includes('suspend') || actionType.includes('delete')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('approve') || actionType.includes('verify') || actionType.includes('unsuspend')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (actionType.includes('reject') || actionType.includes('suspend') || actionType.includes('delete')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-2">Erreur</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Cambizzle platform overview</p>
      </div>
      <button 
        onClick={fetchDashboardData}
        className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        disabled={logsLoading}
      >
        <TrendingUp className="h-4 w-4" />
        <span>Refresh Data</span>
      </button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div 
          key={stat.title} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6"
        >
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-sm font-medium text-gray-600">
              {stat.title}
            </h3>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">{stat.change}</p>
            </div>
            {stat.subtitle && (
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Activity Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <Shield className="h-5 w-5 text-[#D6BA69]" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <Link 
              to="/admin/moderation-logs" 
              className="text-sm text-[#D6BA69] hover:text-[#D6BA69]/80 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Loading activity...</span>
              </div>
            ) : recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="mt-1 flex-shrink-0">
                    {getActionIcon(log.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className={`${getActionColor(log.actionType)} text-xs px-2 py-1`}>
                        {getActionLabel(log.actionType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      {log.targetType === 'ad' ? (
                        <FileText className="h-4 w-4 text-gray-400" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="truncate">
                        {log.targetType === 'ad' ? 'Ad' : 'User'} #{log.targetId}
                      </span>
                      <span className="text-gray-400 mx-1">•</span>
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                    {log.reason && (
                      <p className="text-xs text-gray-500 truncate">{log.reason}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Top Categories Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistics & Top Categories</h3>
          <div className="space-y-6">
            {/* Ads Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Ads Distribution</h4>
              {dashboardData.ads.byStatus.map((statusData, i) => {
                const percentage = Math.round((parseInt(statusData.count) / dashboardData.ads.total) * 100);
                const getColor = (status) => {
                  switch (status) {
                    case 'approved': return 'bg-green-600';
                    case 'pending': return 'bg-yellow-600';
                    case 'rejected': return 'bg-red-600';
                    default: return 'bg-gray-600';
                  }
                };
                const getLabel = (status) => {
                  switch (status) {
                    case 'approved': return 'Approved';
                    case 'pending': return 'Pending';
                    case 'rejected': return 'Rejected';
                    default: return status;
                  }
                };
                
                return (
                  <div key={i} className="space-y-2 mb-4 last:mb-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{getLabel(statusData.moderationStatus)}</span>
                      <span className="font-medium text-gray-900">{percentage}% ({statusData.count})</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getColor(statusData.moderationStatus)} rounded-full transition-all duration-300`} 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Categories */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Top Categories</h4>
              {dashboardData.topCategories && dashboardData.topCategories.length > 0 ? (
                dashboardData.topCategories.map((category, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#D6BA69]" />
                      <span className="text-sm text-gray-900 font-medium truncate">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-600">{category.adCount} ads</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4">No data available</p>
              )}
            </div>
            
            {/* Weekly Activity */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-600">This Week Activity</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.activity.ads7Days} ads, {dashboardData.activity.users7Days} users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;
