import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from './components/toast/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import WeglotProvider from './components/WeglotProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CategoryAds from './pages/CategoryAds';
import SubcategoryAds from './pages/SubcategoryAds';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import CreateAd from './pages/CreateAd';
import UpdateAd from './pages/UpdateAd';
import Profile from './pages/Profile';
import AdDetail from './pages/AdDetail';
import TestPromotionPacks from './pages/TestPromotionPacks';
import About from './pages/About';
import Terms from './pages/Terms';
import SafetyTipsPage from './pages/SafetyTips';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Ads from './pages/admin/Ads';
import Categories from './pages/admin/Categories';
import Subcategories from './pages/admin/Subcategories';
import Reports from './pages/admin/Reports';
import Filters from './pages/admin/Filters';
import Brands from './pages/admin/Brands';
import Locations from './pages/admin/Locations';
import ModerationLogs from './pages/admin/ModerationLogs';
import ReferralCodes from './pages/admin/ReferralCodes';
import PromotionPackAdmin from './components/admin/PromotionPackAdmin';
import Payments from './pages/admin/Payments';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const queryClient = new QueryClient();

// Layout wrapper pour les pages publiques avec Header et Footer
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <Router>
        <ScrollToTop />
        <WeglotProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <AdsProvider>
              <Routes>
                {/* Routes publiques avec Header et Footer */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
                <Route path="/category/:categoryId" element={<PublicLayout><CategoryAds /></PublicLayout>} />
                <Route path="/subcategory" element={<PublicLayout><SubcategoryAds /></PublicLayout>} />
                <Route path="/create-ad" element={<PublicLayout><CreateAd /></PublicLayout>} />
                <Route path="/profile" element={<Navigate to="/profile/overview" replace />} />
                <Route path="/profile/*" element={<PublicLayout><Profile /></PublicLayout>} />
                <Route path="/test/promotion-packs" element={<PublicLayout><TestPromotionPacks /></PublicLayout>} />
                <Route path="/ads/:slug" element={<PublicLayout><AdDetail /></PublicLayout>} />
                <Route path="/edit-ad/:slug" element={<PublicLayout><UpdateAd /></PublicLayout>} />
                
                {/* Info Pages */}
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
                <Route path="/safety-tips" element={<PublicLayout><SafetyTipsPage /></PublicLayout>} />

                {/* Routes admin sans header */}
                <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
                <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
                <Route path="/admin/ads" element={<AdminLayout><Ads /></AdminLayout>} />
                <Route path="/admin/categories" element={<AdminLayout><Categories /></AdminLayout>} />
                <Route path="/admin/subcategories" element={<AdminLayout><Subcategories /></AdminLayout>} />
                <Route path="/admin/filters" element={<AdminLayout><Filters /></AdminLayout>} />
                <Route path="/admin/brands" element={<AdminLayout><Brands /></AdminLayout>} />
                <Route path="/admin/locations" element={<AdminLayout><Locations /></AdminLayout>} />
                <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
                <Route path="/admin/moderation-logs" element={<AdminLayout><ModerationLogs /></AdminLayout>} />
                <Route path="/admin/referralcodes" element={<AdminLayout><ReferralCodes /></AdminLayout>} />
                <Route path="/admin/promotion-packs" element={<AdminLayout><PromotionPackAdmin /></AdminLayout>} />
                <Route path="/admin/payments" element={<AdminLayout><Payments /></AdminLayout>} />
                {/* Autres routes admin seront ajoutées ici */}
              </Routes>
            </AdsProvider>
          </AuthProvider>
        </TooltipProvider>
        </WeglotProvider>
      </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
