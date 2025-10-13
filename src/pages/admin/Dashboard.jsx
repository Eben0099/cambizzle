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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme Cambizzle</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Activité Récente
            </CardTitle>
            <Link 
              to="/admin/moderation-logs" 
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Voir tout
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="mt-1">
                      {getActionIcon(log.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <Badge className={`${getActionColor(log.actionType)} text-xs`}>
                          {getActionLabel(log.actionType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {log.targetType === 'ad' ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span>
                          {log.targetType === 'ad' ? 'Annonce' : 'Utilisateur'} #{log.targetId}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(log.createdAt)}</span>
                      </div>
                      {log.reason && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Statistiques & Top Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Répartition des Annonces</h4>
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
                      case 'approved': return 'Approuvées';
                      case 'pending': return 'En attente';
                      case 'rejected': return 'Rejetées';
                      default: return status;
                    }
                  };
                  
                  return (
                    <div key={i} className="space-y-1 mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{getLabel(statusData.moderationStatus)}</span>
                        <span className="font-medium text-foreground">{percentage}% ({statusData.count})</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getColor(statusData.moderationStatus)} rounded-full`} 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-foreground mb-3">Top Catégories</h4>
                {dashboardData.topCategories && dashboardData.topCategories.length > 0 ? (
                  dashboardData.topCategories.map((category, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{category.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{category.adCount} annonces</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                )}
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Activité cette semaine</span>
                  <span className="font-medium text-foreground">
                    {dashboardData.activity.ads7Days} annonces, {dashboardData.activity.users7Days} utilisateurs
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
