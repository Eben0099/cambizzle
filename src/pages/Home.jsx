import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, Car, Home as HomeIcon, Briefcase, Shirt, Smartphone, Sofa, Baby, Book, Dumbbell, Wrench, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
// import SearchAutocomplete from '../components/ui/SearchAutocomplete';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';
import CategorySidebar from '../components/layout/CategorySidebar';
import Loader from '../components/ui/Loader';
import CategoryGrid from '../components/categories/CategoryGrid';
import SEO from '../components/SEO';
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData';
import { SERVER_BASE_URL } from '../config/api';
import useCategories from '../hooks/useCategories';
import useHomeAds from '../hooks/useHomeAds';
import useDebouncedValue from '../hooks/useDebouncedValue';
import Pagination from '../components/ui/Pagination';

const Home = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500);
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { ads, pagination, isLoading: adsLoading, error: adsError, goToPage } = useHomeAds(1, 30, debouncedSearch);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
      navigate(`/search?category=${category.slug}`);
    }
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    navigate(`/subcategory?category=${categorySlug}&subcategory=${subcategorySlug}`);
  };

  // Icon mapping for categories (aligned with CategorySidebar slugs)
  const categoryIcons = {
    'electronics': Smartphone,
    'vehicles': Car,
    'real-estate': HomeIcon,
    'jobs': Briefcase,
    'services': Wrench,
    'fashion': Shirt,
    'home': Sofa,
    'sports': Dumbbell,
    'animals': Smartphone, // Fallback
    'agriculture': Smartphone, // Fallback
    'phones-tablets': Smartphone,
    'automobiles': Car,
    'immobilier': HomeIcon,
    'emplois': Briefcase,
  };

  const getIconUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  // Safe icon renderer
  const CategoryIcon = ({ category, className = "w-6 h-6" }) => {
    const IconComponent = categoryIcons[category.slug] || Smartphone;
    const iconPath = category.iconPath || category.iconUrl || category.icon;

    if (iconPath) {
      return (
        <div className="relative flex items-center justify-center">
          <img
            src={getIconUrl(iconPath)}
            alt={category.name}
            className={`${className} object-contain`}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }}>
            <IconComponent className={className} />
          </div>
        </div>
      );
    }

    return <IconComponent className={className} />;
  };

  return (
    <>
      <SEO
        title="Cambizzle | Buy and Sell in Cameroon"
        description="Discover the best deals for buying and selling in Cameroon. Browse ads, post your own, and connect with buyers and sellers effortlessly."
        url="/"
        keywords="buy, sell, classifieds, ads, Cameroon, marketplace, Cambizzle, second hand, electronics, cars, real estate"
      />
      <OrganizationSchema />
      <WebsiteSchema />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-8 sm:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-[#D6BA69] drop-shadow-md">Sell Faster. Buy Better in Cameroon.</span>
              </h1>

              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('common.search')}
                    className="text-base sm:text-lg py-3 sm:py-4 pr-12 bg-white text-black rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 w-full"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D6BA69] hover:bg-[#C5A952] rounded-lg p-2 transition-colors duration-200 pointer-events-none">
                    <Search className="w-5 h-5 text-black" />
                  </div>
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer z-10"
                      title="Clear filter"
                    >
                      ✕
                    </button>
                  )}
                </div>
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
            {/* Mobile Categories Flow */}
            <div className="lg:hidden bg-white shadow-sm p-4">
              {!selectedCategory ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">{t('sidebar.categories')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {categories
                      ?.sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category)}
                          className="flex flex-col items-center space-y-2 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-12 h-12 bg-[#D6BA69]/10 rounded-full flex items-center justify-center text-[#D6BA69] group-hover:bg-[#D6BA69]/20 transition-all">
                            <CategoryIcon category={category} className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-medium text-center line-clamp-2 text-gray-700 group-hover:text-[#D6BA69]">{t(`categoryNames.${category.slug}`, category.name)}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b pb-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[#D6BA69] flex items-center text-sm font-medium"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                      {t('common.back')}
                    </button>
                    <h3 className="text-sm font-bold text-gray-900">{t(`categoryNames.${selectedCategory.slug}`, selectedCategory.name)}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCategory.subcategories
                      ?.sort((a, b) => a.name.localeCompare(b.name))
                      .map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(selectedCategory.slug, sub.slug)}
                          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl text-center hover:bg-gray-50 hover:border-[#D6BA69] transition-all cursor-pointer group shadow-sm active:scale-95"
                        >
                          <div className="w-14 h-14 bg-[#D6BA69]/10 rounded-full flex items-center justify-center text-[#D6BA69] mb-3 group-hover:bg-[#D6BA69]/20 transition-colors">
                            <CategoryIcon category={sub} className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-bold text-gray-800 group-hover:text-[#D6BA69] line-clamp-2 leading-tight">
                            {t(`subcategoryNames.${sub.slug}`, sub.name)}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Ads Section */}
            <section className="py-12 sm:py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      {t('home.recentListings')}
                    </h2>
                    {/* <p className="text-base sm:text-lg text-gray-600">
                      Explore the latest offers
                    </p> */}
                  </div>
                  {/* <Link to="/search">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 mt-4 sm:mt-0 border-[#D6BA69] text-[#D6BA69] hover:bg-[#D6BA69]/10 hover:text-[#C5A952] transition-colors duration-200"
                    >
                      <span className="hidden sm:inline">{t('home.viewAllListings')}</span>
                      <span className="sm:hidden">{t('common.viewAll')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link> */}
                </div>

                {adsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      {t('home.loadingError')}
                    </h3>
                    <p className="text-red-600">
                      {adsError}
                    </p>
                  </div>
                ) : adsLoading ? (
                  <Loader text={t('common.loading')} />
                ) : (
                  <>
                    {ads.length === 0 && search ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                        <Search className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                          {t('home.noAdsFound')}
                        </h3>
                        <p className="text-yellow-600 mb-4">
                          {t('home.noAdsMatchSearch')} "{search}"
                        </p>
                        <Button
                          onClick={() => setSearch('')}
                          className="bg-[#D6BA69] hover:bg-[#C5A952] text-black"
                        >
                          {t('home.clearFilter')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                          {ads
                            .sort((a, b) => {
                              // Prioritize boosted ads (isBoosted === "1" or true)
                              const aBoosted = a.isBoosted === "1" || a.isBoosted === 1 || a.isBoosted === true;
                              const bBoosted = b.isBoosted === "1" || b.isBoosted === 1 || b.isBoosted === true;
                              if (aBoosted && !bBoosted) return -1;
                              if (!aBoosted && bBoosted) return 1;
                              return 0;
                            })
                            .slice(0, 30) // Ensure only 30 are shown
                            .map((ad) => (
                              <AdCard key={ad.id} ad={ad} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300" />
                            ))}
                        </div>

                        {/* Pagination removed from Home page per request */}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Features Section */}
            {/* <section className="py-12 sm:py-16 bg-white">
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
            </section> */}

            {/* CTA Section */}
            {/* <section className="py-12 sm:py-16 bg-gradient-to-r from-[#D6BA69] to-[#C5A858]">
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
            </section> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;