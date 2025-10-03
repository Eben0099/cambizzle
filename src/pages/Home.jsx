import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, Shield, Users, Star, Plus, Car, Home as HomeIcon, Briefcase, Shirt, Smartphone, Sofa, Baby, Book, Dumbbell, Wrench, Truck, HeadphonesIcon } from 'lucide-react';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';
import CategorySidebar from '../components/layout/CategorySidebar';
import CategoryGrid from '../components/categories/CategoryGrid';
import useCategories from '../hooks/useCategories';
import useHomeAds from '../hooks/useHomeAds';
import Pagination from '../components/ui/Pagination';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { ads: contextAds, fetchAds, isLoading: contextLoading } = useAds();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { ads, pagination, isLoading: adsLoading, error: adsError, goToPage } = useHomeAds(1, 8);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAds(1, { limit: 8 });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  // Icon mapping for categories
  const categoryIcons = {
    'car': Car,
    'home': HomeIcon,
    'briefcase': Briefcase,
    'shirt': Shirt,
    'smartphone': Smartphone,
    'sofa': Sofa,
    'baby': Baby,
    'book': Book,
    'dumbbell': Dumbbell,
    'wrench': Wrench
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find everything you're looking for on{' '}
              <span className="text-[#D6BA69]">Cambizzle</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The classifieds platform that connects buyers and sellers
              throughout France
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg py-4 pr-16 bg-white"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="md"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Layout */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block">
          <CategorySidebar className="w-72 flex-shrink-0 sticky top-0 h-screen" />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">

          {/* Mobile Categories */}
          <div className="lg:hidden">
            <CategorySidebar />
          </div>

          {/* Recent Ads Section */}
          <section className="py-16 bg-gray-50">
            <div className="w-full px-2 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Annonces récentes
                  </h2>
                  <p className="text-lg text-gray-600">
                    Découvrez les dernières offres
                  </p>
                </div>
                <Link to="/search">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <span className="hidden sm:inline">Voir toutes les annonces</span>
                    <span className="sm:hidden">Voir tout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {adsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-600">
                    {adsError}
                  </p>
                </div>
              ) : adsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-xl mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {ads.map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNext}
                        hasPrevious={pagination.hasPrevious}
                        onPageChange={goToPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-white">
            <div className="w-full px-2 sm:px-4 lg:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why choose Cambizzle?
                </h2>
                <p className="text-lg text-gray-600">
                  A secure and easy-to-use platform
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="text-center">
                  <div className="p-6">
                    <div className="w-16 h-16 bg-[#D6BA69] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Secure
                    </h3>
                    <p className="text-gray-600">
                      Seller verification and reporting system for your safety
                    </p>
                  </div>
                </Card>

                <Card className="text-center">
                  <div className="p-6">
                    <div className="w-16 h-16 bg-[#D6BA69] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Community
                    </h3>
                    <p className="text-gray-600">
                      Join thousands of users who trust Cambizzle
                    </p>
                  </div>
                </Card>

                <Card className="text-center">
                  <div className="p-6">
                    <div className="w-16 h-16 bg-[#D6BA69] rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Growth
                    </h3>
                    <p className="text-gray-600">
                      Grow your business with our promotion and referral tools
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-[#D6BA69] to-[#C5A858]">
            <div className="max-w-5xl mx-0 px-2 sm:px-4 lg:px-6 text-center">
              <h2 className="text-3xl font-bold text-black mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-black/80 mb-8 max-w-2xl mx-auto">
                Create your account for free and start buying or selling today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
                    Create an account
                  </Button>
                </Link>
                <Link to="/create-ad">
                  <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white w-full sm:w-auto">
                    Post an ad
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
