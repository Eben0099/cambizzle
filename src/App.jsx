import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import WeglotProvider from './components/WeglotProvider';
import Header from './components/layout/Header';
import CategoryAds from './pages/CategoryAds';
import SubcategoryAds from './pages/SubcategoryAds';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import AdDetail from './pages/AdDetail';
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
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeglotProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AdsProvider>
              <Router>
              <Routes>
                {/* Routes publiques avec header */}
                <Route path="/" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Home />
                    </main>
                  </div>
                } />
                <Route path="/login" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Login />
                    </main>
                  </div>
                } />
                <Route path="/register" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Register />
                    </main>
                  </div>
                } />
                <Route path="/search" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Search />
                    </main>
                  </div>
                } />
                <Route path="/category/:categoryId" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      {/* Affiche les annonces d'une catégorie */}
                      <CategoryAds />
                    </main>
                  </div>
                } />
                <Route path="/subcategory" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      {/* Affiche les annonces d'une sous-catégorie */}
                      <SubcategoryAds />
                    </main>
                  </div>
                } />
                <Route path="/create-ad" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <CreateAd />
                    </main>
                  </div>
                } />
                <Route path="/profile" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Profile />
                    </main>
                  </div>
                } />
                <Route path="/ads/:slug" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <AdDetail />
                    </main>
                  </div>
                } />

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
                {/* Autres routes admin seront ajoutées ici */}
              </Routes>
            </Router>
          </AdsProvider>
        </AuthProvider>
      </TooltipProvider>
      </WeglotProvider>
    </QueryClientProvider>
  );
}

export default App;
