import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { useAds } from '../../contexts/AdsContext';
import Loader from '../ui/Loader';
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

  // Base fallback icon
  const BaseIcon = Package;

  // Get category icon - prefer image if available, else fallback to Lucide or base
  const getCategoryIcon = (category) => {
    if (category.iconUrl) {
      return () => <img src={category.iconUrl} alt={category.name} className="w-6 h-6 object-contain" />;
    }
    const iconMap = {
      'electronics': Smartphone,
      'vehicles': Car,
      'real-estate': Home,
      'jobs': Briefcase,
      'services': Wrench,
      'fashion': Shirt,
      'home': Sofa,
      'sports': Dumbbell,
      'animals': Package,
      'agriculture': Package
    };
    return iconMap[category.slug] || BaseIcon;
  };

  // Get subcategory icon - prefer image if available, else fallback to Lucide or base
  const getSubcategoryIcon = (subcategory) => {
    if (subcategory.iconUrl) {
      return () => <img src={subcategory.iconUrl} alt={subcategory.name} className="w-4 h-4 object-contain" />;
    }
    const iconMap = {
      'smartphones': Smartphone,
      'computers': Package,
      'tablets': Package,
      'tv-video': Package,
      'photo-camera': Package,
      'cars': Car,
      'motorcycles': Car,
      'bikes': Package,
      'auto-parts': Package,
      'trucks': Car,
      'apartments': Home,
      'houses': Home,
      'lands': Home,
      'offices': Home,
      'rentals': Home,
      'it': Package,
      'commerce': Package,
      'restoration': Package,
      'building': Package,
      'health': Package,
      'repair': Wrench,
      'cleaning': Package,
      'courses': Book,
      'transport': Car,
      'beauty': Package,
      'mens-clothing': Shirt,
      'womens-clothing': Shirt,
      'shoes': Shirt,
      'bags': Package,
      'jewelry': Package,
      'furniture': Sofa,
      'appliances': Sofa,
      'decoration': Sofa,
      'gardening': Package,
      'diy': Wrench,
      'fitness': Dumbbell,
      'football': Dumbbell,
      'basketball': Dumbbell,
      'tennis': Dumbbell,
      'swimming': Dumbbell,
      'dogs': Package,
      'cats': Package,
      'birds': Package,
      'fish': Package,
      'pet-accessories': Package,
      'agricultural-products': Package,
      'agricultural-machinery': Package,
      'fertilizers': Package,
      'seeds': Package,
      'livestock': Package
    };
    return iconMap[subcategory.slug] || BaseIcon;
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
    navigate(`/search?category=${categorySlug}`);
    setIsMobileMenuOpen(false);
    setExpandedCategory(null);
    setHoveredCategory(null);
    setIsDropdownVisible(false);
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
    // Only toggle subcategories, don't navigate
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setHoveredCategory(null);
        setIsDropdownVisible(false);
        setIsMobileMenuOpen(false);
        setExpandedCategory(null);
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
    <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center justify-between w-full text-left transition-colors hover:bg-gray-50 rounded-lg p-3"
      >
        <div className="flex items-center">
          <LayoutGrid className="w-6 h-6 mr-4 text-[#D6BA69]" />
          <span className="text-xl font-semibold text-gray-900">Categories</span>
        </div>
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 transition-transform" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-600 transition-transform" />
        )}
      </button>
    </div>
  );

  // Mobile Categories Grid Component
  const MobileCategoriesGrid = () => {
    if (categoriesLoading) {
      return (
        <div className={`lg:hidden bg-white transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <Loader text="Loading categories..." />
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className={`lg:hidden bg-white transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-6 py-4 text-center">
            <div className="text-red-500 mb-2 font-medium">Loading Error</div>
            <div className="text-sm text-gray-500">{categoriesError}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`lg:hidden bg-white transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category, index) => {
              const IconComponent = getCategoryIcon(category);
              const totalCount = getCategoryCount(category.slug);

              return (
                <div key={category.slug} className="space-y-3" style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen ? 'fadeInUp 0.3s ease forwards' : 'none'
                }}>
                  {/* Category Card */}
                  <button
                    onClick={() => {
                      if (category.subcategories && category.subcategories.length > 0) {
                        toggleMobileCategory(category.slug);
                      } else {
                        handleCategoryClick(category.slug);
                      }
                    }}
                    className="w-full bg-white hover:bg-[#D6BA69]/10 rounded-xl p-4 transition-all duration-200 border border-gray-200 hover:border-[#D6BA69] hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                  >
                    <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
                      <div className="bg-gray-50 rounded-full p-3 shadow-sm">
                        {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-8 h-8 text-[#D6BA69]" />}
                      </div>
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {totalCount} listing{totalCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Subcategories */}
                  {expandedCategory === category.slug && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-fadeIn col-span-3">
                      {category.subcategories.map((subcategory, subIndex) => {
                        const SubIconComponent = getSubcategoryIcon(subcategory);
                        const subCount = getSubcategoryCount(category.slug, subcategory.slug);
                        return (
                          <button
                            key={subcategory.slug}
                            onClick={() => handleSubcategoryClick(category.slug, subcategory.slug)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-[#D6BA69] hover:bg-[#D6BA69]/10 rounded-md transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                            style={{
                              animationDelay: `${subIndex * 30}ms`,
                              animation: 'slideInLeft 0.2s ease forwards'
                            }}
                          >
                            <div className="flex items-center">
                              {typeof SubIconComponent === 'function' ? <SubIconComponent /> : <SubIconComponent className="w-5 h-5 mr-3 text-gray-500" />}
                              <span className="truncate">{subcategory.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full ml-2 flex-shrink-0 shadow-sm">
                              {subCount}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full text-left px-4 py-3 text-sm text-[#D6BA69] hover:bg-[#D6BA69]/20 rounded-md transition-colors font-medium border border-[#D6BA69] hover:border-[#C5A952] focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                      >
                        View all {category.name} listings →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/search');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 px-6 text-sm font-medium text-[#D6BA69] hover:text-white hover:bg-[#D6BA69] rounded-lg transition-all duration-200 border border-[#D6BA69] hover:border-[#C5A952] transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
            >
              View all categories
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-3 text-[#D6BA69]" />
                Categories
              </h2>
            </div>
            <div className="py-3 overflow-y-auto h-[calc(100%-8rem)] flex items-center justify-center">
              <Loader text="Loading categories..." />
            </div>
          </div>
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="relative hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
          <div className={`bg-white border-r border-gray-200 w-64 h-full ${className}`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-3 text-[#D6BA69]" />
                Categories
              </h2>
            </div>
            <div className="p-6 text-center">
              <div className="text-red-500 mb-2 font-medium">Loading Error</div>
              <div className="text-sm text-gray-500">{categoriesError}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
        <div
          ref={sidebarRef}
          className={`bg-white border-r border-gray-200 w-64 h-full ${className}`}
          onMouseLeave={() => {
            if (window.sidebarTimeout) {
              clearTimeout(window.sidebarTimeout);
            }
            window.sidebarTimeout = setTimeout(() => {
              const submenuHovered = document.querySelector('.submenu-container:hover') ||
                                   document.querySelector('[style*="left: 15.5rem"]:hover');
              if (!submenuHovered && !isClicking) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 300);
          }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="w-6 h-6 mr-3 text-[#D6BA69]" />
              Categories
            </h2>
          </div>

          <div className="py-3 overflow-y-auto h-[calc(100%-8rem)]">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category);
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
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#D6BA69]/10 transition-all duration-200 rounded-lg cursor-pointer border-b border-gray-100 last:border-0 hover:shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-[#D6BA69] mr-3 flex-shrink-0 transition-colors" />}
                      <span className="text-sm font-medium text-gray-900 group-hover:text-[#D6BA69] truncate transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full min-w-[2rem] text-center group-hover:bg-[#D6BA69]/10 group-hover:text-[#D6BA69] transition-colors">
                        {totalCount}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2 group-hover:text-[#D6BA69] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-6">
            <button
              onClick={() => navigate('/search')}
              className="w-full text-center py-3 px-6 text-sm font-medium text-[#D6BA69] hover:text-white hover:bg-[#D6BA69] rounded-lg transition-all duration-200 border border-[#D6BA69] hover:border-[#C5A952] transform hover:scale-105 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
            >
              View all categories
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
              if (window.sidebarTimeout) {
                clearTimeout(window.sidebarTimeout);
                window.sidebarTimeout = null;
              }
            }}
          />
        )}

        {/* Fixed subcategory box */}
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
            window.submenuTimeout = setTimeout(() => {
              if (!isClicking) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 150);
          }}
        >
          {categories.map((category) => {
            if (category.slug === hoveredCategory) {
              const IconComponent = getCategoryIcon(category);
              return (
                <div key={category.slug} className="h-full flex flex-col">
                  <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-4 h-4 text-[#D6BA69] mr-2" />}
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex-1 py-3 overflow-y-auto">
                    {category.subcategories.map((subcategory, index) => {
                      const SubIconComponent = getSubcategoryIcon(subcategory);
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
                            e.stopPropagation();
                          }}
                          className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#D6BA69]/10 hover:border-l-4 hover:border-l-[#D6BA69] transition-all duration-200 group cursor-pointer rounded-lg border-l-4 border-l-transparent active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                          style={{
                            animationDelay: `${index * 0.05}s`,
                            animation: isDropdownVisible ? 'fadeInRight 0.3s ease forwards' : 'none'
                          }}
                          title={`View listings in ${subcategory.name}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {typeof SubIconComponent === 'function' ? <SubIconComponent /> : <SubIconComponent className="w-4 h-4 text-gray-500 group-hover:text-[#D6BA69] mr-3 flex-shrink-0 transition-colors duration-200" />}
                            <span className="text-sm text-gray-700 group-hover:text-[#D6BA69] truncate transition-colors duration-200">
                              {subcategory.name}
                            </span>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-[#D6BA69] group-hover:text-white transition-all duration-200">
                              {subCount}
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#D6BA69] ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategoryClick(category.slug);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="w-full text-center text-sm text-[#D6BA69] hover:text-white hover:bg-[#D6BA69] font-medium py-3 rounded-lg transition-all duration-200 border border-[#D6BA69] hover:border-[#C5A952] cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D6BA69]"
                      title={`View all listings in ${category.name}`}
                    >
                      View all {category.name} listings →
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
    <div className="w-full" ref={sidebarRef}>
      <MobileToggleButton />
      <MobileCategoriesGrid />
      <DesktopSidebar />
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