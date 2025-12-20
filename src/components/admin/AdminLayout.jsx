import { useEffect, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, FileText, FolderTree, Filter, MapPin, AlertTriangle, Settings, LogOut, Tag, Shield, Menu, X, Home, User, CreditCard } from "lucide-react";
import Loader from "../ui/Loader";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import adminService from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";

const navigationConfig = [
  // Section 1: Main
  { nameKey: "dashboard", href: "/admin", icon: LayoutDashboard },
  { nameKey: "myProfile", href: "/profile", icon: User },
  { nameKey: "payments", href: "/admin/payments", icon: CreditCard },
  { nameKey: "users", href: "/admin/users", icon: Users },
  { nameKey: "ads", href: "/admin/ads", icon: FileText },
  { nameKey: "feedbacks", href: "/admin/feedbacks", icon: AlertTriangle },
  // Section 2: Content Management
  { nameKey: "categories", href: "/admin/categories", icon: FolderTree },
  { nameKey: "subcategories", href: "/admin/subcategories", icon: FolderTree },
  { nameKey: "dynamicFilters", href: "/admin/filters", icon: Filter },
  { nameKey: "brands", href: "/admin/brands", icon: Tag },
  { nameKey: "locations", href: "/admin/locations", icon: MapPin },
  // Section 3: Promotion, Reports, Moderation, Referral
  { nameKey: "promotionPacks", href: "/admin/promotion-packs", icon: Tag },
  { nameKey: "reports", href: "/admin/reports", icon: AlertTriangle },
  { nameKey: "moderationLogs", href: "/admin/moderation-logs", icon: Shield },
  { nameKey: "referralCodes", href: "/admin/referralcodes", icon: Tag },
];

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Build navigation with translated names
  const navigation = navigationConfig.map(item => ({
    ...item,
    name: t(`admin.sidebar.${item.nameKey}`)
  }));

  useEffect(() => {
    verifyAdminAccess();
  }, [user]);

  const verifyAdminAccess = async () => {
    try {
      if (!adminService.isAuthenticated()) {
        setIsAuthorized(false);
        setIsVerifying(false);
        return;
      }
      
      // Vérifier que l'utilisateur a roleId === "1" (admin)
      if (user?.roleId !== "1") {
        setIsAuthorized(false);
        setIsVerifying(false);
        return;
      }
      
      setIsAuthorized(true);
    } catch (error) {
      setIsAuthorized(false);
      if (error.message.includes('Session expired')) {
        logout();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isVerifying) {
    return (
      <Loader text={t('admin.sidebar.verifyingPermissions')} />
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-gray-950 text-[#D6BA69] hover:bg-gray-800 h-10 w-10"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 sm:w-72 bg-gray-950 text-gray-200 border-r border-gray-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 z-40",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-2 sm:p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#D6BA69] flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-gray-900">C</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">Cambizzle</h1>
              <p className="text-xs text-gray-400">{t('admin.sidebar.adminPanel')}</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 sm:p-3 space-y-1 sm:space-y-1.5 overflow-y-auto">
          {/* Main Section */}
          {[navigation[0], navigation[1], navigation[2], navigation[3], navigation[4]].map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#D6BA69] text-gray-900 shadow-md border border-[#D6BA69]/50"
                    : "text-gray-300 hover:bg-gray-800 hover:text-[#D6BA69] hover:shadow-sm"
                )
              }
              aria-label={`Navigate to ${item.name}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      isActive ? "text-gray-900" : "text-gray-400 group-hover:text-[#D6BA69]"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
          {/* Content Management Section */}
          <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('admin.sidebar.contentManagement')}</div>
          {[navigation[5], navigation[6], navigation[7], navigation[8], navigation[9]].map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#D6BA69] text-gray-900 shadow-md border border-[#D6BA69]/50"
                    : "text-gray-300 hover:bg-gray-800 hover:text-[#D6BA69] hover:shadow-sm"
                )
              }
              aria-label={`Navigate to ${item.name}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      isActive ? "text-gray-900" : "text-gray-400 group-hover:text-[#D6BA69]"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
          {/* Promotion, Reports, Moderation, Referral Section */}
          <div className="mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('admin.sidebar.promotionReports')}</div>
          {[navigation[10], navigation[11], navigation[12], navigation[13]].map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#D6BA69] text-gray-900 shadow-md border border-[#D6BA69]/50"
                    : "text-gray-300 hover:bg-gray-800 hover:text-[#D6BA69] hover:shadow-sm"
                )
              }
              aria-label={`Navigate to ${item.name}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      isActive ? "text-gray-900" : "text-gray-400 group-hover:text-[#D6BA69]"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 sm:p-3 border-t border-gray-800">
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#D6BA69] text-gray-900 shadow-md border border-[#D6BA69]/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-[#D6BA69] hover:shadow-sm"
              )
            }
            aria-label="Navigate to Settings"
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5",
                    isActive ? "text-gray-900" : "text-gray-400"
                  )}
                />
                {t('admin.sidebar.settings')}
              </>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:bg-red-900/80 hover:text-red-100 transition-all duration-200 w-full"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('admin.sidebar.logOut')}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;