"use client";
import { useState } from "react";
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
import { Eye, Check, X, AlertTriangle, Search } from "lucide-react";
import Input from "../../components/ui/input";
import { useToast } from "../../components/ui/use-toast";

const Reports = () => {
  const { toast } = useToast();

  const [reports, setReports] = useState([
    {
      id: 1,
      type: "Ad",
      title: "iPhone 12 Pro - Fake",
      reporter: "Marie Claire",
      reason: "Fraud / Scam",
      status: "pending",
      date: "10/01/2025 14:30",
      priority: "high",
    },
    {
      id: 2,
      type: "User",
      title: "Profile: Jean Dupont",
      reporter: "Paul Martin",
      reason: "Inappropriate behavior",
      status: "reviewed",
      date: "11/01/2025 09:15",
      priority: "medium",
    },
    {
      id: 3,
      type: "Ad",
      title: "Stolen Car",
      reporter: "Alice Kameni",
      reason: "Illegal content",
      status: "pending",
      date: "12/01/2025 16:45",
      priority: "high",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helpers for badges
  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      reviewed: { color: "bg-green-100 text-green-800", label: "Reviewed" },
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
  const handleApprove = (id) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status: "reviewed" } : r
    );
    setReports(updated);
    toast({ title: "Report approved", description: "The report has been marked as reviewed." });
  };

  const handleReject = (id) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status: "rejected" } : r
    );
    setReports(updated);
    toast({
      title: "Report rejected",
      description: "The report has been marked as rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage reported ads and users
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending", count: 12, color: "#D6BA69" },
          { label: "Reviewed", count: 45, color: "#4CAF50" },
          { label: "Urgent", count: 3, color: "#E53935" },
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
                    {stat.count}
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
          <div className="overflow-x-auto rounded-lg border mt-3">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reported Content</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:border-[#D6BA69] hover:text-[#D6BA69] transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-[#D6BA69] text-white hover:bg-[#c3a55d] transition"
                              onClick={() => handleApprove(report.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:border-red-500 hover:text-red-500 transition"
                              onClick={() => handleReject(report.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
