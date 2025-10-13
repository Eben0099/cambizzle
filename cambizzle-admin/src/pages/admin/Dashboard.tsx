import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, DollarSign, TrendingUp, Eye } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Utilisateurs",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Annonces Actives",
      value: "1,829",
      change: "+8.2%",
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "En Attente",
      value: "47",
      change: "-5.1%",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      title: "Signalements",
      value: "23",
      change: "+3.4%",
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Revenus (XAF)",
      value: "12.5M",
      change: "+15.8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Vues Totales",
      value: "45.2K",
      change: "+22.1%",
      icon: Eye,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme Cambizzle</p>
        </div>
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
                <p className="text-xs text-muted-foreground">{stat.change} ce mois</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "Jean Dupont", action: "a publié une annonce", time: "Il y a 2 min" },
                { user: "Marie Claire", action: "a été vérifiée", time: "Il y a 15 min" },
                { user: "Admin", action: "a approuvé 5 annonces", time: "Il y a 1h" },
                { user: "Paul Martin", action: "a signalé une annonce", time: "Il y a 2h" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Statistiques Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taux d'approbation</span>
                  <span className="font-medium text-foreground">94%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilisateurs actifs</span>
                  <span className="font-medium text-foreground">78%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Annonces premium</span>
                  <span className="font-medium text-foreground">34%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "34%" }} />
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
