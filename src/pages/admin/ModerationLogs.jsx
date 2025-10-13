import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import Input from "../../components/ui/Input";
import { 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import adminService from "../../services/adminService";

const ModerationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  
  const logsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getModerationLogs(currentPage, logsPerPage);
      
      if (response.status === 'success') {
        setLogs(response.data.logs);
        setTotalLogs(response.data.total);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des logs');
      }
    } catch (err) {
      console.error('Erreur logs:', err);
      setError(err.message || 'Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  // Formatage des actions pour l'affichage
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

  // Couleurs des badges selon l'action
  const getActionColor = (actionType) => {
    if (actionType.includes('approve') || actionType.includes('verify') || actionType.includes('unsuspend')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (actionType.includes('reject') || actionType.includes('suspend') || actionType.includes('delete')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Icône selon l'action
  const getActionIcon = (actionType) => {
    if (actionType.includes('approve') || actionType.includes('verify') || actionType.includes('unsuspend')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (actionType.includes('reject') || actionType.includes('suspend') || actionType.includes('delete')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrage des logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActionLabel(log.actionType).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === "" || log.actionType === filterAction;
    const matchesTarget = filterTarget === "" || log.targetType === filterTarget;
    
    return matchesSearch && matchesAction && matchesTarget;
  });

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des logs...</p>
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
            onClick={fetchLogs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs de Modération</h1>
          <p className="text-muted-foreground mt-1">Historique des actions de modération</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{totalLogs} logs au total</span>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type d'action</label>
              <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Toutes les actions</option>
                <option value="ad_approve">Approbation annonce</option>
                <option value="ad_reject">Rejet annonce</option>
                <option value="user_suspend">Suspension utilisateur</option>
                <option value="user_unsuspend">Réactivation utilisateur</option>
                <option value="user_verify">Vérification utilisateur</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type de cible</label>
              <select 
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Toutes les cibles</option>
                <option value="ad">Annonces</option>
                <option value="user">Utilisateurs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Cible</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Changement</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Raison</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Modérateur</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.actionType)}
                        <Badge className={`${getActionColor(log.actionType)} text-xs`}>
                          {getActionLabel(log.actionType)}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {log.targetType === 'ad' ? (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {log.targetType === 'ad' ? 'Annonce' : 'Utilisateur'} #{log.targetId}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{log.oldStatus}</span>
                        <span className="mx-2">→</span>
                        <span className="text-foreground font-medium">{log.newStatus}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-sm">
                        {log.reason && (
                          <div className="font-medium text-foreground">{log.reason}</div>
                        )}
                        {log.notes && (
                          <div className="text-muted-foreground text-xs mt-1">{log.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">
                        Modérateur #{log.moderatorId}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun log trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ModerationLogs;