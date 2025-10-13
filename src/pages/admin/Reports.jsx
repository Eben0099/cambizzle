import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { Eye, Check, X, AlertTriangle } from "lucide-react";

const Reports = () => {
  const reports = [
    {
      id: 1,
      type: "Annonce",
      title: "iPhone 12 Pro - Faux",
      reporter: "Marie Claire",
      reason: "Fraude / Arnaque",
      status: "pending",
      date: "10/01/2025 14:30",
      priority: "high",
    },
    {
      id: 2,
      type: "Utilisateur",
      title: "Profil: Jean Dupont",
      reporter: "Paul Martin",
      reason: "Comportement inapproprié",
      status: "reviewed",
      date: "11/01/2025 09:15",
      priority: "medium",
    },
    {
      id: 3,
      type: "Annonce",
      title: "Voiture volée",
      reporter: "Alice Kameni",
      reason: "Contenu illégal",
      status: "pending",
      date: "12/01/2025 16:45",
      priority: "high",
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", label: "En attente" },
      reviewed: { variant: "default", label: "Traité" },
      rejected: { variant: "destructive", label: "Rejeté" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge className={colors[priority]}>
        {priority === "high" ? "Urgent" : priority === "medium" ? "Moyen" : "Faible"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Signalements</h1>
          <p className="text-muted-foreground mt-1">
            Gérer les signalements d'annonces et d'utilisateurs
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "En attente", count: 12, color: "text-yellow-600" },
          { label: "Traités", count: 45, color: "text-green-600" },
          { label: "Urgents", count: 3, color: "text-red-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <AlertTriangle className={`h-10 w-10 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Signalements Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Contenu Signalé</TableHead>
                <TableHead>Signalé par</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[250px] truncate">
                    {report.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.reporter}</TableCell>
                  <TableCell className="text-foreground">{report.reason}</TableCell>
                  <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{report.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === "pending" && (
                        <>
                          <Button size="sm" variant="default">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
