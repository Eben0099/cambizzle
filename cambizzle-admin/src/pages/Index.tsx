import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, BarChart } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center max-w-4xl px-6">
        <div className="mb-8 inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary">
          <span className="text-4xl font-bold text-primary-foreground">C</span>
        </div>
        
        <h1 className="mb-4 text-5xl font-bold text-foreground">
          Cambizzle Admin
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plateforme d'administration pour gérer votre marketplace. 
          Contrôlez les utilisateurs, modérez les annonces et gérez votre contenu.
        </p>
        
        <Link to="/admin">
          <Button size="lg" className="gap-2">
            Accéder au Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Gestion Utilisateurs",
              description: "Vérifiez, suspendez et gérez tous les comptes"
            },
            {
              icon: Shield,
              title: "Modération",
              description: "Approuvez ou rejetez les annonces en attente"
            },
            {
              icon: BarChart,
              title: "Statistiques",
              description: "Suivez les performances de votre plateforme"
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all">
              <feature.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
