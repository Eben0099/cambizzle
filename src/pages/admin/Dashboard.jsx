import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { Users, FileText, AlertTriangle, DollarSign, TrendingUp, Eye, CheckCircle, XCircle, Clock, Shield, User, ExternalLink, ChartBar, Tag, Activity } from "lucide-react";
import Loader from "../../components/ui/Loader";
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
        throw new Error(response.message || 'Error loading data');
      }
    } catch (err) {
  console.error('Dashboard error:', err);
  setError(err.message || 'Error loading dashboard');
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
      console.error('Recent logs error:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Calcul des statistiques basé sur les vraies données
  const getStats = () => {
    if (!dashboardData) return [];

    return [
      {
        title: "Total Users",
        value: dashboardData.users.total.toString(),
        change: `+${dashboardData.users.newThisWeek} this week`,
        icon: Users,
        color: "text-blue-600",
        subtitle: `${dashboardData.users.active} active, ${dashboardData.users.verified} verified`
      },
      {
        title: "Total Ads",
        value: dashboardData.ads.total.toString(),
        change: `+${dashboardData.ads.newThisWeek} this week`,
        icon: FileText,
        color: "text-primary",
        subtitle: `${dashboardData.ads.approved} approved`
      },
      {
        title: "Pending",
        value: dashboardData.ads.pending.toString(),
        change: "To moderate",
        icon: AlertTriangle,
        color: "text-yellow-600",
        subtitle: "Pending ads"
      },
      {
        title: "Reports",
        value: dashboardData.reports.total.toString(),
        change: `${dashboardData.reports.pending} ongoing`,
        icon: AlertTriangle,
        color: "text-destructive",
        subtitle: `${dashboardData.reports.resolved} resolved`
      },
      {
        title: "Total Views",
        value: dashboardData.ads.totalViews.toString(),
        change: "In total",
        icon: Eye,
        color: "text-purple-600",
        subtitle: "All ads combined"
      },
      {
        title: "7 Days Activity",
        value: (dashboardData.activity.ads7Days + dashboardData.activity.users7Days + dashboardData.activity.messages7Days).toString(),
        change: `${dashboardData.activity.ads7Days} ads, ${dashboardData.activity.users7Days} users`,
        icon: TrendingUp,
        color: "text-green-600",
        subtitle: "Recent activity"
      },
    ];
  };

  // Fonctions utilitaires pour les logs
  const getActionLabel = (actionType) => {
    const actions = {
      'ad_approve': 'Ad approved',
      'ad_reject': 'Ad rejected',
      'ad_suspend': 'Ad suspended',
      'user_suspend': 'User suspended',
      'user_unsuspend': 'User reactivated',
      'user_verify': 'User verified',
      'user_unverify': 'Verification removed',
      'user_delete': 'User deleted',
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
    
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
    
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
      return <Loader text="Loading dashboard..." className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-destructive mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

return (
  <div className="space-y-6">
  {/* Header */}
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        Dashboard
      </h1>
      <p className="text-gray-600 text-sm sm:text-base">
        Cambizzle platform overview
      </p>
    </div>
    <button 
      onClick={fetchDashboardData}
      className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={logsLoading}
    >
      {logsLoading ? (
        <Loader className="h-4 w-4" text="" />
      ) : (
        <TrendingUp className="h-4 w-4" />
      )}
      <span>Refresh Data</span>
    </button>
  </div>

  {/* Stats Cards */}
  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {stats.map((stat) => (
      <div 
        key={stat.title} 
        className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 cursor-pointer"
      >
        <div className="flex flex-row items-start justify-between pb-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#D6BA69] transition-colors">
              {stat.title}
            </h3>
            {stat.subtitle && (
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-[#D6BA69]/10 transition-colors">
            <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform`} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-3xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
            {stat.value}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-600">{stat.change}</p>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Main Content Grid */}
  <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
    {/* Recent Activity Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D6BA69]/10 rounded-xl">
              <Shield className="h-5 w-5 text-[#D6BA69]" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-500">Latest moderation actions</p>
            </div>
          </div>
          <Link 
            to="/admin/moderation-logs" 
            className="text-sm text-[#D6BA69] hover:text-[#D6BA69]/80 font-medium flex items-center gap-1 transition-colors group"
          >
            View All
            <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logsLoading ? (
              <Loader text="Loading activity..." className="py-12" />
          ) : recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 mt-0.5 p-2 bg-gray-100 rounded-xl group-hover:bg-[#D6BA69]/10 transition-colors">
                  {getActionIcon(log.actionType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-3">
                    <Badge 
                      className={`text-xs px-3 py-1.5 font-medium ${getActionColor(log.actionType)}`}
                    >
                      {getActionLabel(log.actionType)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-900 mb-2">
                    {log.targetType === 'ad' ? (
                      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">
                      {log.targetType === 'ad' ? 'Ad' : 'User'} #{log.targetId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{formatTimeAgo(log.createdAt)}</span>
                  </div>
                  {log.reason && (
                    <p className="text-sm text-gray-700 line-clamp-2">{log.reason}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs mt-1">Moderation logs will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Stats & Top Categories Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 lg:p-8">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">
          Platform Statistics
        </h3>
        
        <div className="space-y-8">
          {/* Ads Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBar className="h-4 w-4 text-[#D6BA69]" />
              Ads Distribution
            </h4>
            <div className="space-y-4">
              {dashboardData.ads.byStatus.map((statusData, i) => {
                const percentage = Math.round((parseInt(statusData.count) / dashboardData.ads.total) * 100);
                const getColor = (status) => {
                  switch (status) {
                    case 'approved': return 'bg-green-500';
                    case 'pending': return 'bg-yellow-500';
                    case 'rejected': return 'bg-red-500';
                    default: return 'bg-gray-500';
                  }
                };
                const getLabel = (status) => {
                  switch (status) {
                    case 'approved': return 'Approved';
                    case 'pending': return 'Pending Review';
                    case 'rejected': return 'Rejected';
                    default: return status;
                  }
                };
                
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{getLabel(statusData.moderationStatus)}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {percentage}% <span className="text-gray-500">({statusData.count})</span>
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getColor(statusData.moderationStatus)} rounded-full transition-all duration-700 ease-out`} 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Categories & Activity */}
          <div className="pt-6 border-t border-gray-100 space-y-6">
            {/* Top Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#D6BA69]" />
                Top Categories
              </h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {dashboardData.topCategories && dashboardData.topCategories.length > 0 ? (
                  dashboardData.topCategories.map((category, i) => (
                    <div 
                      key={i} 
                      className="group flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-[#D6BA69] to-[#B8945F] group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-900 truncate group-hover:text-[#D6BA69]">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-[#D6BA69]/10 group-hover:text-[#D6BA69]">
                        {category.adCount} ads
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No categories data</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Weekly Activity */}
            <div className="bg-gradient-to-r from-[#D6BA69]/5 to-[#B8945F]/5 p-4 rounded-xl border border-[#D6BA69]/10">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                This Week Activity
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-[#D6BA69]">
                    {dashboardData.activity?.ads7Days || 0}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">New Ads</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-[#D6BA69]">
                    {dashboardData.activity?.users7Days || 0}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">New Users</div>
                </div>
              </div>
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
