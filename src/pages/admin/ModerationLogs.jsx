import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/toast/useToast";
import {
  Search, 
  Calendar, 
  User, 
  FileText, 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import adminService from "../../services/adminService";
import { Button } from "../../components/ui/Button";

const ModerationLogs = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const response = await adminService.getModerationLogs(currentPage, logsPerPage);
      if (response.status === 'success') {
        setLogs(response.data.logs);
        setTotalLogs(response.data.total);
      } else {
        throw new Error(response.message || 'Error loading logs');
      }
    } catch (err) {
      console.error('Logs error:', err);
      showToast({ type: 'error', message: err.message || 'Error loading logs' });
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (actionType) => {
    const actions = {
      'ad_approve': 'Ad Approved',
      'ad_reject': 'Ad Rejected',
      'ad_suspend': 'Ad Suspended',
      'user_suspend': 'User Suspended',
      'user_unsuspend': 'User Reactivated',
      'user_verify': 'User Verified',
      'user_unverify': 'Verification Removed',
      'user_delete': 'User Deleted',
    };
    return actions[actionType] || actionType;
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

  const getActionIcon = (actionType) => {
    if (actionType.includes('approve') || actionType.includes('verify') || actionType.includes('unsuspend')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (actionType.includes('reject') || actionType.includes('suspend') || actionType.includes('delete')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  // Dynamic summary
  const summary = {
    approved: filteredLogs.filter(log => log.actionType.includes('approve')).length,
    rejected: filteredLogs.filter(log => log.actionType.includes('reject')).length,
    suspended: filteredLogs.filter(log => log.actionType.includes('suspend')).length,
    verified: filteredLogs.filter(log => log.actionType.includes('verify')).length,
    deleted: filteredLogs.filter(log => log.actionType.includes('delete')).length,
  };

  const summaryColors = {
    approved: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    suspended: 'text-yellow-600 bg-yellow-100',
    verified: 'text-blue-600 bg-blue-100',
    deleted: 'text-gray-700 bg-gray-200',
  };

  if (loading) return <Loader text="Loading logs..." className="min-h-[400px]" />;

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-destructive mb-2">Error</div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchLogs} className="w-full">Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderation Logs</h1>
          <p className="text-muted-foreground mt-1">History of moderation actions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{totalLogs} total logs</span>
        </div>
      </div>

      {/* Dynamic summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(summary).map(([key, value]) => (
          <Card key={key} className="border-border">
            <CardContent className="py-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1 capitalize">{key}</p>
              <p className={`text-2xl font-bold ${summaryColors[key]}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Action Type</label>
              <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All actions</option>
                <option value="ad_approve">Ad Approval</option>
                <option value="ad_reject">Ad Rejection</option>
                <option value="user_suspend">User Suspension</option>
                <option value="user_unsuspend">User Reactivation</option>
                <option value="user_verify">User Verification</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Type</label>
              <select 
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All targets</option>
                <option value="ad">Ads</option>
                <option value="user">Users</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Target</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Change</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Moderator</th>
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
                        <span className="text-sm">{log.targetType === 'ad' ? 'Ad' : 'User'} #{log.targetId}</span>
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
                        {log.reason && <div className="font-medium text-foreground">{log.reason}</div>}
                        {log.notes && <div className="text-muted-foreground text-xs mt-1">{log.notes}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">Moderator #{log.moderatorId}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No logs found</p>
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
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ModerationLogs;
