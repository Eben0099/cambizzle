import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, Shield, Users, Star, Plus, Car, Home as HomeIcon, Briefcase, Shirt, Smartphone, Sofa, Baby, Book, Dumbbell, Wrench, Truck, HeadphonesIcon } from 'lucide-react';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';
import CategorySidebar from '../components/layout/CategorySidebar';
import Loader from '../components/ui/Loader';
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
    <>
      <Helmet>
        <title>Cambizzle | Buy and Sell in Cameroon</title>
        <meta name="description" content="Discover the best deals for buying and selling in Cameroon. Browse ads, post your own, and connect with buyers and sellers effortlessly." />
        <meta property="og:title" content="Cambizzle | Buy and Sell in Cameroon" />
        <meta property="og:description" content="Discover the best deals for buying and selling in Cameroon. Browse ads, post your own, and connect with buyers and sellers effortlessly." />
        <meta property="og:image" content="/assets/cambizzle-og-image.jpg" />
        <meta property="og:url" content="https://cambizzle.com/" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Everything You Need on{' '}
                <span className="text-[#D6BA69] drop-shadow-md">Cambizzle</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Your trusted platform for buying and selling across Cameroon
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                  <Input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-base sm:text-lg py-3 sm:py-4 pr-12 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D6BA69] hover:bg-[#C5A952] rounded-lg p-2 transition-colors duration-200"
                    size="sm"
                  >
                    <Search className="w-5 h-5 text-black" />
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
            <CategorySidebar className="w-72 flex-shrink-0 sticky top-0 h-screen bg-white shadow-sm" />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-x-hidden">
            {/* Mobile Categories */}
            <div className="lg:hidden bg-white shadow-sm">
              <CategorySidebar />
            </div>

            {/* Recent Ads Section */}
            <section className="py-12 sm:py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      Recent Listings
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                      Explore the latest offers
                    </p>
                  </div>
                  <Link to="/search">
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2 mt-4 sm:mt-0 border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10 hover:text-[#C5A952] transition-colors duration-200"
                    >
                      <span className="hidden sm:inline">View All Listings</span>
                      <span className="sm:hidden">View All</span>
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
                      Loading Error
                    </h3>
                    <p className="text-red-600">
                      {adsError}
                    </p>
                  </div>
                ) : adsLoading ? (
                  <Loader text="Loading ads..." />
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {ads.map((ad) => (
                        <AdCard key={ad.id} ad={ad} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300" />
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
                          className="bg-white shadow-sm rounded-lg"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Why Choose Cambizzle?
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600">
                    Your secure and user-friendly marketplace
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-6 sm:p-8">
                      <div className="w-16 h-16 bg-[#D6BA69]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D6BA69] group-hover:shadow-md transition-all duration-300">
                        <Shield className="w-8 h-8 text-[#D6BA69] group-hover:text-black" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#D6BA69] transition-colors">
                        Secure
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Verified sellers and robust reporting for your safety
                      </p>
                    </div>
                  </Card>

                  <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-6 sm:p-8">
                      <div className="w-16 h-16 bg-[#D6BA69]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D6BA69] group-hover:shadow-md transition-all duration-300">
                        <Users className="w-8 h-8 text-[#D6BA69] group-hover:text-black" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#D6BA69] transition-colors">
                        Community
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Join thousands of trusted users on Cambizzle
                      </p>
                    </div>
                  </Card>

                  <Card className="text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-6 sm:p-8">
                      <div className="w-16 h-16 bg-[#D6BA69]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D6BA69] group-hover:shadow-md transition-all duration-300">
                        <TrendingUp className="w-8 h-8 text-[#D6BA69] group-hover:text-black" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#D6BA69] transition-colors">
                        Growth
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Boost your business with our promotion tools
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 bg-gradient-to-r from-[#D6BA69] to-[#C5A858]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4">
                  Ready to Start?
                </h2>
                <p className="text-base sm:text-lg text-black/80 mb-8 max-w-2xl mx-auto">
                  Sign up for free and start buying or selling today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto rounded-lg py-3 px-6 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/create-ad">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-black text-black hover:bg-black hover:text-white w-full sm:w-auto rounded-lg py-3 px-6 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Post an Ad
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;