import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, FolderTree, Filter, MapPin, AlertTriangle, Settings, LogOut, Tag } from "lucide-react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";

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

const AdminLayout = ({
  children
}) => {
  return <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col shadow-lg">
        <div className="p-6 bg-gradient-to-r from-[#D6BA69] to-[#C5A858] border-b border-[#D6BA69]/30">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Cambizzle</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 bg-slate-950">
          {navigation.map(item => <NavLink key={item.name} to={item.href} end={item.href === "/admin"} className={({ isActive }) => {
            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl group";
            const activeClasses = "bg-[#D6BA69] text-black shadow-lg border border-[#D6BA69]/50";
            const inactiveClasses = "text-gray-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:text-white hover:shadow-lg hover:shadow-slate-900/50 border border-transparent hover:border-slate-600/50";
            return cn(baseClasses, isActive ? activeClasses : inactiveClasses);
          }}>
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-[#D6BA69]'}`} />
                  {item.name}
                </>
              )}
            </NavLink>)}
        </nav>

        <div className="p-4 space-y-2 bg-slate-950 border-t border-slate-800">
          <NavLink to="/admin/settings" className={({ isActive }) => {
            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl";
            const activeClasses = "bg-[#D6BA69] text-black shadow-lg border border-[#D6BA69]/50";
            const inactiveClasses = "text-gray-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:text-white hover:shadow-lg hover:shadow-slate-900/50";
            return cn(baseClasses, isActive ? activeClasses : inactiveClasses);
          }}>
            {({ isActive }) => (
              <>
                <Settings className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                Paramètres
              </>
            )}
          </NavLink>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-gradient-to-r hover:from-red-900/80 hover:to-red-800/80 hover:text-red-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-900/30 w-full border border-red-800/50 hover:border-red-700/70">
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
