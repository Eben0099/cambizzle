import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, FolderTree, Filter, MapPin, AlertTriangle, Settings, LogOut, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
const navigation = [{
  name: "Tableau de Bord",
  href: "/admin",
  icon: LayoutDashboard
}, {
  name: "Utilisateurs",
  href: "/admin/users",
  icon: Users
}, {
  name: "Annonces",
  href: "/admin/ads",
  icon: FileText
}, {
  name: "Catégories",
  href: "/admin/categories",
  icon: FolderTree
}, {
  name: "Filtres Dynamiques",
  href: "/admin/filters",
  icon: Filter
}, {
  name: "Marques",
  href: "/admin/brands",
  icon: Tag
}, {
  name: "Localisations",
  href: "/admin/locations",
  icon: MapPin
}, {
  name: "Signalements",
  href: "/admin/reports",
  icon: AlertTriangle
}];
interface AdminLayoutProps {
  children: ReactNode;
}
const AdminLayout = ({
  children
}: AdminLayoutProps) => {
  return <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col">
        <div className="p-6 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Cambizzle</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-950" />

        <nav className="flex-1 p-4 space-y-1 bg-slate-950">
          {navigation.map(item => <NavLink key={item.name} to={item.href} end={item.href === "/admin"} className={({
          isActive
        }) => cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>)}
        </nav>

        <Separator className="bg-sidebar-border" />

        <div className="p-4 space-y-1 bg-slate-950">
          <NavLink to="/admin/settings" className={({
          isActive
        }) => cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
            <Settings className="h-5 w-5" />
            Paramètres
          </NavLink>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all w-full">
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>;
};
export default AdminLayout;