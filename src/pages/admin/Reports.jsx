"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
import { AlertTriangle, Search, Download, RefreshCw, Phone } from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";
import Input from "../../components/ui/input";
import { useToast } from "../../components/toast/useToast";
import { API_BASE_URL } from "../../config/api";
import storageService from "../../services/storageService";

const Reports = () => {
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedReportForContact, setSelectedReportForContact] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = storageService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.data?.reports) {
        // Transform API data to match component structure
        const transformedReports = data.data.reports.map(report => ({
          id: parseInt(report.id),
          type: report.reportType === 'ad' ? 'Ad' : 'User',
          title: report.adTitle || (report.reportedAdId ? `Ad #${report.reportedAdId}` : `User #${report.reportedUserId}`),
          reporter: report.authorName || `User #${report.reporterId}`,
          reason: report.reportReason,
          status: report.status,
          date: new Date(report.createdAt).toLocaleString('fr-FR'),
          priority: report.reportReason === 'fraud' ? 'high' : 'medium', // Simple priority logic
          description: report.description,
          reporter_id: report.reporterId,
          reported_ad_id: report.reportedAdId,
          reported_user_id: report.reportedUserId,
          admin_notes: report.adminNotes,
          handled_by: report.handledBy,
          handled_at: report.handledAt,
          created_at: report.createdAt,
          updated_at: report.updatedAt,
          sellerPhone: report.sellerPhone
        }));

        setReports(transformedReports);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
      toast({
        title: "Error loading reports",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

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
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      handled: { color: "bg-green-100 text-green-800", label: "Handled" },
      reviewed: { color: "bg-blue-100 text-blue-800", label: "Reviewed" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={`${config.color} font-medium`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge className={`${colors[priority]} font-medium`}>
        {priority === "high" ? "Urgent" : priority === "medium" ? "Medium" : "Low"}
      </Badge>
    );
  };

  // Handle actions
  const handleApprove = async (id) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setAdminNotes("");
      setResolveModalOpen(true);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport || !adminNotes.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter admin notes before resolving the report."
      });
      return;
    }

    setResolving(true);

    try {
      const token = storageService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/admin/reports/${selectedReport.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: adminNotes.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // Update local state
        const updated = reports.map((r) =>
          r.id === selectedReport.id ? { ...r, status: "handled" } : r
        );
        setReports(updated);
        setResolveModalOpen(false);
        setSelectedReport(null);
        setAdminNotes("");
        showToast({
          type: "success",
          title: "Report Resolved",
          message: "The report has been successfully resolved."
        });
      } else {
        throw new Error(data.message || 'Failed to resolve report');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      showToast({
        type: "error",
        title: "Resolution Failed",
        message: error.message || "Failed to resolve report"
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}  
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage reported ads. Depending on the nature of the report, you can take necessary actions such as deleting the ad and informing the seller via WhatsApp.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchReports}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => exportToExcel(filteredReports, 'reports', {
              columns: [
                { header: 'ID', key: 'id' },
                { header: 'Type', key: 'type' },
                { header: 'Title', key: 'title' },
                { header: 'Reporter', key: 'reporter' },
                { header: 'Reason', key: 'reason' },
                { header: 'Description', key: 'description' },
                { header: 'Status', key: 'status' },
                { header: 'Priority', key: 'priority' },
                { header: 'Date', key: 'date' },
              ],
              sheetName: 'Reports'
            })}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
            disabled={filteredReports.length === 0 || loading}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { 
            label: "Pending", 
            count: reports.filter(r => r.status === 'pending').length, 
            color: "#D6BA69" 
          },
          { 
            label: "Handled", 
            count: reports.filter(r => r.status === 'handled').length, 
            color: "#4CAF50" 
          },
          { 
            label: "Total Reports", 
            count: reports.length, 
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

      {/* Search Bar */}
      <Card className="border border-border shadow-sm hover:shadow-md transition bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, reporter, or reason..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border bg-white shadow-sm hover:shadow-lg transition rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Error loading reports</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchReports} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border mt-3">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reported Content</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Contact Seller</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading reports...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-gray-600">No reports found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-muted/30 transition cursor-pointer"
                      >
                        <TableCell>
                          <Badge className="border border-[#D6BA69] text-[#D6BA69]">
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground max-w-[250px] truncate">
                          {report.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.reporter}
                        </TableCell>
                        <TableCell>
                          {report.sellerPhone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReportForContact(report);
                                setMessage('');
                                setContactModalOpen(true);
                              }}
                              title="Contact seller via WhatsApp"
                            >
                              <Phone className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {report.reason}
                        </TableCell>
                        <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {report.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                                onClick={() => handleApprove(report.id)}
                              >
                                Resolve
                              </Button>
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
            <DialogTitle>Resolve Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="admin-notes" className="text-sm font-medium">
                Admin Notes <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="admin-notes"
                placeholder="Enter your resolution notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolveModalOpen(false)}
              disabled={resolving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResolveReport}
              disabled={!adminNotes.trim() || resolving}
              className="bg-[#D6BA69] text-white hover:bg-[#c3a55d]"
            >
              {resolving ? "Resolving..." : "Resolve Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Seller Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Contact Seller via WhatsApp</DialogTitle>
            <DialogDescription>
              Send a message to the seller regarding this report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="whatsapp-message" className="text-sm font-medium">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="whatsapp-message"
                placeholder="Enter your message to the seller..."
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
              Cancel
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
              Send via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
