import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import {
  Car,
  Home,
  Briefcase,
  Shirt,
  Smartphone,
  Sofa,
  Baby,
  Book,
  Dumbbell,
  Wrench,
  ChevronRight,
  ChevronDown,
  Package,
  LayoutGrid,
  X,
  Menu,
  Grid
} from 'lucide-react';
import { useAds } from '../../contexts/AdsContext';
import useCategories from '../../hooks/useCategories';

const CategorySidebar = ({ className = '' }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { ads } = useAds();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const navigate = useNavigate();

  // Icon mapping helper
  const getCategoryIcon = (slug) => {
    const iconMap = {
      'electronique': Smartphone,
      'vehicules': Car,
      'immobilier': Home,
      'emplois': Briefcase,
      'services': Wrench,
      'mode': Shirt,
      'maison': Sofa,
      'sports': Dumbbell,
      'animaux': Package,
      'agriculture': Package
    };
    return iconMap[slug] || Package;
  };

  const getSubcategoryIcon = (slug) => {
    const iconMap = {
      'smartphones': Smartphone,
      'ordinateurs': Package,
      'tablettes': Package,
      'tv-video': Package,
      'photo-camera': Package,
      'voitures': Car,
      'motos': Car,
      'velos': Package,
      'pieces-auto': Package,
      'camions': Car,
      'appartements': Home,
      'maisons': Home,
      'terrains': Home,
      'bureaux': Home,
      'locations': Home,
      'informatique': Package,
      'commerce': Package,
      'restauration': Package,
      'batiment': Package,
      'sante': Package,
      'reparation': Wrench,
      'nettoyage': Package,
      'cours': Book,
      'transport': Car,
      'beaute': Package,
      'vetements-hommes': Shirt,
      'vetements-femmes': Shirt,
      'chaussures': Shirt,
      'sacs': Package,
      'bijoux': Package,
      'meubles': Sofa,
      'electromenager': Sofa,
      'decoration': Sofa,
      'jardinage': Package,
      'bricolage': Wrench,
      'fitness': Dumbbell,
      'football': Dumbbell,
      'basketball': Dumbbell,
      'tennis': Dumbbell,
      'natation': Dumbbell,
      'chiens': Package,
      'chats': Package,
      'oiseaux': Package,
      'poissons': Package,
      'accessoires-animaux': Package,
      'produits-agricoles': Package,
      'machines-agricoles': Package,
      'engrais': Package,
      'semences': Package,
      'elevage': Package
    };
    return iconMap[slug] || Package;
  };

  // Get category count from API data
  const getCategoryCount = (categorySlug) => {
    if (!categories) return 0;
    const category = categories.find(cat => cat.slug === categorySlug);
    return category ? category.totalAds : 0;
  };

  // Get subcategory count from API data
  const getSubcategoryCount = (categorySlug, subcategorySlug) => {
    if (!categories) return 0;
    const category = categories.find(cat => cat.slug === categorySlug);
    if (!category) return 0;
    const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug);
    return subcategory ? subcategory.totalAds : 0;
  };

  const handleCategoryClick = (categorySlug) => {
    logger.debug('Category clicked:', categorySlug);
    navigate(`/search?category=${categorySlug}`);
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    // Clear any pending timeouts
    if (window.sidebarTimeout) {
      clearTimeout(window.sidebarTimeout);
      window.sidebarTimeout = null;
    }
    if (window.submenuTimeout) {
      clearTimeout(window.submenuTimeout);
      window.submenuTimeout = null;
    }

    // Prevent closing during click
    setIsClicking(true);

    // Close submenu immediately
    setHoveredCategory(null);
    setIsDropdownVisible(false);
    setExpandedCategory(null);
    setIsMobileMenuOpen(false);

    // Small pause to allow submenu closing before navigation
    setTimeout(() => {
      navigate(`/subcategory?category=${categorySlug}&subcategory=${subcategorySlug}`);
      setIsClicking(false);
    }, 50);
  };

  const toggleMobileCategory = (categorySlug) => {
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setHoveredCategory(null);
        setIsDropdownVisible(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownVisible || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible, isMobileMenuOpen]);

  // Mobile Toggle Button Component
  const MobileToggleButton = () => (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-16 z-30">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center justify-between w-full text-left transition-colors hover:bg-gray-50 rounded-lg p-2"
      >
        <div className="flex items-center">
          <LayoutGrid className="w-5 h-5 mr-3 text-[#D6BA69]" />
          <span className="text-lg font-semibold text-gray-900">Categories</span>
        </div>
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600 transition-transform" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
        )}
      </button>
    </div>
  );

  // Mobile Categories Grid Component
  const MobileCategoriesGrid = () => {
    if (categoriesLoading) {
      return (
        <div className={`lg:hidden bg-white border-b border-gray-200 transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="space-y-2 animate-pulse">
                  <div className="w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="bg-gray-300 rounded-full p-3"></div>
                      <div>
                        <div className="h-3 bg-gray-300 rounded mb-1"></div>
                        <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className={`lg:hidden bg-white border-b border-gray-200 transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-4 text-center">
            <div className="text-red-500 mb-2">Erreur de chargement</div>
            <div className="text-sm text-gray-500">{categoriesError}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`lg:hidden bg-white border-b border-gray-200 transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((category, index) => {
              const IconComponent = getCategoryIcon(category.slug);
              const totalCount = getCategoryCount(category.slug);

              return (
                <div key={category.slug} className="space-y-2" style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen ? 'fadeInUp 0.3s ease forwards' : 'none'
                }}>
                  {/* Category Card */}
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#D6BA69]/10 hover:to-[#D6BA69]/20 rounded-xl p-4 transition-all duration-200 border border-gray-200 hover:border-[#D6BA69] hover:shadow-md transform hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
                      <div className="bg-white rounded-full p-3 shadow-sm">
                        <IconComponent className="w-6 h-6 text-[#D6BA69]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 leading-tight">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 bg-gray-200 px-2 py-1 rounded-full">
                          {totalCount} annonce{totalCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Subcategories for Mobile */}
                  {expandedCategory === category.slug && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 animate-fadeIn">
                      {category.subcategories.map((subcategory, subIndex) => {
                        const SubIconComponent = getSubcategoryIcon(subcategory.slug);
                        const subCount = getSubcategoryCount(category.slug, subcategory.slug);
                        return (
                          <button
                            key={subcategory.slug}
                            onClick={() => handleSubcategoryClick(category.slug, subcategory.slug)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-[#D6BA69] hover:bg-[#D6BA69]/10 rounded-md transition-colors flex items-center justify-between"
                            style={{
                              animationDelay: `${subIndex * 30}ms`,
                              animation: 'slideInLeft 0.2s ease forwards'
                            }}
                          >
                            <div className="flex items-center">
                              <SubIconComponent className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="truncate">{subcategory.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full ml-2 flex-shrink-0 shadow-sm">
                              {subCount}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full text-left px-3 py-3 text-sm text-[#D6BA69] hover:bg-[#D6BA69]/20 rounded-md transition-colors font-medium border border-[#D6BA69] hover:border-[#C5A952]"
                      >
                        Voir toutes les annonces {category.name} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View All Button for Mobile */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/search');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 px-4 text-sm font-medium text-[#D6BA69] hover:text-white hover:bg-[#D6BA69] rounded-lg transition-all duration-200 border border-[#D6BA69] hover:border-[#C5A952] transform hover:scale-105"
            >
              Voir toutes les catégories
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Desktop Sidebar Component
  const DesktopSidebar = () => {
    if (categoriesLoading) {
      return (
        <div className="relative hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
          <div className={`bg-white border-r border-gray-200 w-64 h-full ${className}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Catégories
              </h2>
            </div>
            <div className="py-2 overflow-y-auto h-[calc(100%-8rem)]">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="px-4 py-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="relative hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
          <div className={`bg-white border-r border-gray-200 w-64 h-full ${className}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#D6BA69]" />
                Catégories
              </h2>
            </div>
            <div className="p-4 text-center">
              <div className="text-red-500 mb-2">Erreur de chargement</div>
              <div className="text-sm text-gray-500">{categoriesError}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Main sidebar - fixed */}
        <div
          ref={sidebarRef}
          className={`bg-white border-r border-gray-200 w-64 h-full ${className}`}
          onMouseLeave={() => {
            // Longer delay to allow transition to submenu
            if (window.sidebarTimeout) {
              clearTimeout(window.sidebarTimeout);
            }
            window.sidebarTimeout = setTimeout(() => {
              // Check if not already on submenu before closing
              const submenuHovered = document.querySelector('.submenu-container:hover') ||
                                   document.querySelector('[style*="left: 15.5rem"]:hover');
              // Do not close if currently clicking
              if (!submenuHovered && !isClicking) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 300);
          }}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-[#D6BA69]" />
              Catégories
            </h2>
          </div>

          <div className="py-2 overflow-y-auto h-[calc(100%-8rem)]">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              const totalCount = getCategoryCount(category.slug);
              const isHovered = hoveredCategory === category.slug;

              return (
                <div
                  key={category.slug}
                  className="relative group"
                  onMouseEnter={() => {
                    setHoveredCategory(category.slug);
                    setIsDropdownVisible(true);
                  }}
                >
                  {/* Catégorie principale */}
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer group"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-[#D6BA69] mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 group-hover:text-[#D6BA69] truncate">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full min-w-[2rem] text-center">
                        {totalCount}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => navigate('/search')}
              className="w-full text-center py-2 px-4 text-sm font-medium text-[#D6BA69] hover:text-[#C5A952] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Voir toutes les catégories
            </button>
          </div>
        </div>

        {/* Invisible buffer zone to facilitate transition */}
        {isDropdownVisible && (
          <div
            className="fixed pointer-events-none"
            style={{
              left: '15.5rem',
              top: 0,
              width: '1rem',
              height: '100vh',
              zIndex: 49
            }}
            onMouseEnter={() => {
              setIsDropdownVisible(true);
              // Clear any pending timeouts when entering buffer zone
              if (window.sidebarTimeout) {
                clearTimeout(window.sidebarTimeout);
                window.sidebarTimeout = null;
              }
            }}
          />
        )}

        {/* Fixed subcategory box - same size as sidebar */}
        <div
          className={`submenu-container w-64 bg-white border border-gray-200 rounded-lg shadow-lg h-full transition-all duration-300 border-l-4 border-l-[#D6BA69] ${
            isDropdownVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
          style={{
            position: 'absolute',
            left: '16rem',
            top: 0,
            zIndex: 50,
            pointerEvents: isDropdownVisible ? 'auto' : 'none'
          }}
          onMouseEnter={() => {
            setIsDropdownVisible(true);
            // Clear any pending timeouts when entering submenu
            if (window.sidebarTimeout) {
              clearTimeout(window.sidebarTimeout);
              window.sidebarTimeout = null;
            }
            if (window.submenuTimeout) {
              clearTimeout(window.submenuTimeout);
              window.submenuTimeout = null;
            }
          }}
          onMouseLeave={() => {
            // Shorter delay to close when really leaving submenu
            window.submenuTimeout = setTimeout(() => {
              // Do not close if currently clicking
              if (!isClicking) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 150);
          }}
        >
          {categories.map((category) => {
            if (category.slug === hoveredCategory) {
              const IconComponent = getCategoryIcon(category.slug);
              return (
                <div key={category.slug} className="h-full flex flex-col">
                  {/* Category header */}
                  <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <IconComponent className="w-4 h-4 text-[#D6BA69] mr-2" />
                      {category.name}
                    </h3>
                  </div>

                  {/* Subcategory list */}
                  <div className="flex-1 py-2 overflow-y-auto">
                    {category.subcategories.map((subcategory, index) => {
                      const SubIconComponent = getSubcategoryIcon(subcategory.slug);
                      const subCount = getSubcategoryCount(category.slug, subcategory.slug);
                      return (
                        <button
                          key={subcategory.slug}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubcategoryClick(category.slug, subcategory.slug);
                          }}
                          onMouseDown={(e) => {
                            // Prevent conflicts with mouseleave
                            e.stopPropagation();
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 hover:border-l-4 hover:border-l-[#D6BA69] transition-all duration-200 group cursor-pointer rounded-lg border-l-4 border-l-transparent active:scale-95"
                          style={{
                            animationDelay: `${index * 0.05}s`,
                            animation: isDropdownVisible ? 'fadeInRight 0.3s ease forwards' : 'none'
                          }}
                          title={`Voir les annonces dans ${subcategory.name}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <SubIconComponent className="w-4 h-4 text-gray-500 group-hover:text-[#D6BA69] mr-3 flex-shrink-0 transition-colors duration-200" />
                            <span className="text-sm text-gray-700 group-hover:text-[#D6BA69] truncate transition-colors duration-200">
                              {subcategory.name}
                            </span>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-[#D6BA69] group-hover:text-white transition-all duration-200">
                              {subCount}
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#D6BA69] ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* "View all" button */}
                  <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategoryClick(category.slug);
                      }}
                      onMouseDown={(e) => {
                        // Prevent conflicts with mouseleave
                        e.stopPropagation();
                      }}
                      className="w-full text-center text-sm text-[#D6BA69] hover:text-white hover:bg-[#D6BA69] font-medium py-3 rounded-lg transition-all duration-200 border border-[#D6BA69] hover:border-[#C5A952] cursor-pointer active:scale-95"
                      title={`Voir toutes les annonces dans ${category.name}`}
                    >
                      Voir toutes les annonces →
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Mobile Components */}
      <MobileToggleButton />
      <MobileCategoriesGrid />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default CategorySidebar;
