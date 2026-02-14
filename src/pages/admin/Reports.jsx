"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { AlertTriangle, Search, Download, RefreshCw, Phone, Check, X, Eye } from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/toast/useToast";
import { reportService } from "../../services/reportService";
import { useSettings } from "../../contexts/SettingsContext";

const Reports = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { contact } = useSettings();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedReportForContact, setSelectedReportForContact] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await reportService.getReports(params);

      if (response.status === 'success' && response.data) {
        const reportsData = Array.isArray(response.data) ? response.data : response.data.reports || [];

        // Transform API data to match component structure
        const transformedReports = reportsData.map(report => ({
          id: parseInt(report.id),
          type: report.report_type || report.reportType || 'other',
          title: report.ad_title || report.adTitle || `Ad #${report.reported_ad_id || report.reportedAdId}`,
          reporter: report.reporter_name || report.reporterName || `User #${report.reporter_id || report.reporterId}`,
          reporterPhone: report.reporter_phone || report.reporterPhone,
          reason: report.report_reason || report.reportReason,
          status: report.status,
          date: new Date(report.created_at || report.createdAt).toLocaleString('fr-FR'),
          description: report.description,
          reporter_id: report.reporter_id || report.reporterId,
          reported_ad_id: report.reported_ad_id || report.reportedAdId,
          admin_notes: report.admin_notes || report.adminNotes,
          resolved_by: report.resolved_by || report.resolvedBy,
          resolved_at: report.resolved_at || report.resolvedAt,
          created_at: report.created_at || report.createdAt,
          sellerName: report.seller_name || report.sellerName,
          sellerPhone: report.seller_phone || report.sellerPhone,
          evidence_files: report.evidence_files || report.evidenceFiles || []
        }));

        setReports(transformedReports);
      } else {
        throw new Error(response.message || t('admin.reports.failedToFetch'));
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
      showToast({
        type: "error",
        title: t('admin.reports.errorLoading'),
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await reportService.getStats();
      if (response.status === 'success' && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [statusFilter]);

  // Filter logic
  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helpers for badges
  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-800", labelKey: "pending" },
      resolved: { color: "bg-green-100 text-green-800", labelKey: "resolved" },
      dismissed: { color: "bg-gray-100 text-gray-800", labelKey: "dismissed" },
      handled: { color: "bg-green-100 text-green-800", labelKey: "resolved" },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={`${config.color} font-medium`}>{t(`admin.reports.${config.labelKey}`)}</Badge>;
  };

  const getTypeBadge = (type) => {
    const colors = {
      fraud: "bg-red-100 text-red-800",
      inappropriate: "bg-orange-100 text-orange-800",
      spam: "bg-purple-100 text-purple-800",
      counterfeit: "bg-pink-100 text-pink-800",
      prohibited: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };
    const labels = {
      fraud: t('admin.reports.types.fraud'),
      inappropriate: t('admin.reports.types.inappropriate'),
      spam: t('admin.reports.types.spam'),
      counterfeit: t('admin.reports.types.counterfeit'),
      prohibited: t('admin.reports.types.prohibited'),
      other: t('admin.reports.types.other'),
    };
    return (
      <Badge className={`${colors[type] || colors.other} font-medium`}>
        {labels[type] || type}
      </Badge>
    );
  };

  // Handle resolve
  const handleResolve = (report) => {
    setSelectedReport(report);
    setAdminNotes("");
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedReport || !adminNotes.trim()) {
      showToast({
        type: "error",
        title: t('admin.reports.validationError'),
        message: t('admin.reports.enterAdminNotes')
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await reportService.resolveReport(selectedReport.id, adminNotes.trim());

      if (response.status === 'success') {
        setResolveModalOpen(false);
        setSelectedReport(null);
        setAdminNotes("");
        showToast({
          type: "success",
          title: t('admin.reports.reportResolved'),
          message: t('admin.reports.reportResolvedSuccess')
        });
        fetchReports();
        fetchStats();
      } else {
        throw new Error(response.message || t('admin.reports.failedToResolve'));
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      showToast({
        type: "error",
        title: t('admin.reports.resolutionFailed'),
        message: error.message || t('admin.reports.failedToResolve')
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle dismiss
  const handleDismiss = (report) => {
    setSelectedReport(report);
    setAdminNotes("");
    setDismissModalOpen(true);
  };

  const handleDismissSubmit = async () => {
    if (!selectedReport || !adminNotes.trim()) {
      showToast({
        type: "error",
        title: t('admin.reports.validationError'),
        message: t('admin.reports.enterAdminNotes')
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await reportService.dismissReport(selectedReport.id, adminNotes.trim());

      if (response.status === 'success') {
        setDismissModalOpen(false);
        setSelectedReport(null);
        setAdminNotes("");
        showToast({
          type: "success",
          title: t('admin.reports.reportDismissed'),
          message: t('admin.reports.reportDismissedSuccess')
        });
        fetchReports();
        fetchStats();
      } else {
        throw new Error(response.message || t('admin.reports.failedToDismiss'));
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
      showToast({
        type: "error",
        title: t('admin.reports.dismissFailed'),
        message: error.message || t('admin.reports.failedToDismiss')
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle view details
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.reports.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.reports.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { fetchReports(); fetchStats(); }}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.reports.refresh')}
          </Button>
          <Button
            onClick={() => exportToExcel(filteredReports, 'reports', {
              columns: [
                { header: 'ID', key: 'id' },
                { header: t('admin.reports.type'), key: 'type' },
                { header: t('admin.reports.reportedContent'), key: 'title' },
                { header: t('admin.reports.reporter'), key: 'reporter' },
                { header: t('admin.reports.reason'), key: 'reason' },
                { header: t('admin.reports.description'), key: 'description' },
                { header: t('admin.reports.status'), key: 'status' },
                { header: t('admin.reports.date'), key: 'date' },
              ],
              sheetName: 'Reports'
            })}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
            disabled={filteredReports.length === 0 || loading}
          >
            <Download className="h-4 w-4" />
            {t('admin.reports.exportExcel')}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: t('admin.reports.pending'),
            count: stats.pending,
            color: "#D6BA69"
          },
          {
            label: t('admin.reports.resolved'),
            count: stats.resolved,
            color: "#4CAF50"
          },
          {
            label: t('admin.reports.dismissed'),
            count: stats.dismissed,
            color: "#9E9E9E"
          },
          {
            label: t('admin.reports.totalReports'),
            count: stats.total,
            color: "#2196F3"
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border border-border bg-white shadow-sm hover:shadow-md transition rounded-2xl"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {loading ? '...' : stat.count}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10" style={{ color: stat.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-border shadow-sm hover:shadow-md transition bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('admin.reports.searchTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder={t('admin.reports.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            >
              <option value="all">{t('admin.reports.allStatuses')}</option>
              <option value="pending">{t('admin.reports.pending')}</option>
              <option value="resolved">{t('admin.reports.resolved')}</option>
              <option value="dismissed">{t('admin.reports.dismissed')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border bg-white shadow-sm hover:shadow-lg transition rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('admin.reports.recentReports')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">{t('admin.reports.errorLoading')}</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchReports} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('admin.reports.tryAgain')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border mt-3">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>{t('admin.reports.type')}</TableHead>
                    <TableHead>{t('admin.reports.reportedContent')}</TableHead>
                    <TableHead>{t('admin.reports.reporter')}</TableHead>
                    <TableHead>{t('admin.reports.reason')}</TableHead>
                    <TableHead>{t('admin.reports.status')}</TableHead>
                    <TableHead>{t('admin.reports.date')}</TableHead>
                    <TableHead className="text-right">{t('admin.reports.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">{t('admin.reports.loading')}</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-600">{t('admin.reports.noReports')}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-muted/30 transition"
                      >
                        <TableCell>{getTypeBadge(report.type)}</TableCell>
                        <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                          {report.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.reporter}
                        </TableCell>
                        <TableCell className="text-foreground max-w-[150px] truncate">
                          {report.reason}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {report.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(report)}
                              title={t('admin.reports.viewDetails')}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            {report.sellerPhone && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedReportForContact(report);
                                  setMessage('');
                                  setContactModalOpen(true);
                                }}
                                title={t('admin.reports.contactSeller')}
                              >
                                <Phone className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {report.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleResolve(report)}
                                  title={t('admin.reports.resolve')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDismiss(report)}
                                  title={t('admin.reports.dismiss')}
                                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Report Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              {t('admin.reports.resolveReport')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.reports.resolveDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>{t('admin.reports.reportedContent')}:</strong> {selectedReport.title}</p>
                <p><strong>{t('admin.reports.reason')}:</strong> {selectedReport.reason}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="admin-notes" className="text-sm font-medium">
                {t('admin.reports.adminNotes')} <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('admin.reports.resolveNotesPlaceholder')}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolveModalOpen(false)}
              disabled={processing}
            >
              {t('admin.reports.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleResolveSubmit}
              disabled={!adminNotes.trim() || processing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {processing ? t('admin.reports.processing') : t('admin.reports.confirmResolve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dismiss Report Modal */}
      <Dialog open={dismissModalOpen} onOpenChange={setDismissModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-gray-600" />
              {t('admin.reports.dismissReport')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.reports.dismissDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>{t('admin.reports.reportedContent')}:</strong> {selectedReport.title}</p>
                <p><strong>{t('admin.reports.reason')}:</strong> {selectedReport.reason}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="dismiss-notes" className="text-sm font-medium">
                {t('admin.reports.adminNotes')} <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="dismiss-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('admin.reports.dismissNotesPlaceholder')}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDismissModalOpen(false)}
              disabled={processing}
            >
              {t('admin.reports.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleDismissSubmit}
              disabled={!adminNotes.trim() || processing}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              {processing ? t('admin.reports.processing') : t('admin.reports.confirmDismiss')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Details Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>{t('admin.reports.reportDetails')}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('admin.reports.type')}</p>
                  <p className="font-medium">{getTypeBadge(selectedReport.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('admin.reports.status')}</p>
                  <p className="font-medium">{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.reports.reportedContent')}</p>
                <p className="font-medium">{selectedReport.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.reports.reporter')}</p>
                <p className="font-medium">{selectedReport.reporter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.reports.reason')}</p>
                <p className="font-medium">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <p className="text-sm text-gray-500">{t('admin.reports.description')}</p>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.sellerName && (
                <div>
                  <p className="text-sm text-gray-500">{t('admin.reports.seller')}</p>
                  <p className="font-medium">{selectedReport.sellerName}</p>
                  {selectedReport.sellerPhone && (
                    <p className="text-sm text-gray-600">{selectedReport.sellerPhone}</p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{t('admin.reports.date')}</p>
                <p className="font-medium">{selectedReport.date}</p>
              </div>
              {selectedReport.admin_notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t('admin.reports.adminNotes')}</p>
                  <p className="text-gray-700">{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailModalOpen(false)}
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Seller Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>{t('admin.reports.contactSellerWhatsApp')}</DialogTitle>
            <DialogDescription>
              {t('admin.reports.sendMessageToSeller')}
              {contact?.supportPhone && (
                <span className="block mt-1 text-xs text-[#D6BA69]">
                  {t('admin.settings.supportPhone')}: {contact.supportPhone}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="whatsapp-message" className="text-sm font-medium">
                {t('admin.reports.message')} <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="whatsapp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setContactModalOpen(false)}
            >
              {t('admin.reports.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (message.trim()) {
                  const encodedMessage = encodeURIComponent(message.trim());
                  window.open(`https://wa.me/${selectedReportForContact.sellerPhone}?text=${encodedMessage}`, '_blank');
                  setContactModalOpen(false);
                  setMessage('');
                  setSelectedReportForContact(null);
                }
              }}
              disabled={!message.trim()}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {t('admin.reports.sendViaWhatsApp')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
