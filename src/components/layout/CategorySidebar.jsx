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
import { SERVER_BASE_URL } from '../../config/api';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';

// Composant pour traduire le nom d'une catégorie
const TranslatedName = ({ name, className = '' }) => {
  const { translatedText } = useWeglotTranslate(name || '');
  return <span className={className}>{translatedText || name}</span>;
};

const CategorySidebar = ({ className = '' }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { ads } = useAds();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const navigate = useNavigate();

  // Base fallback icon
  const BaseIcon = Package;



  // Composant pour afficher l'icône de catégorie avec fallback
  const CategoryIcon = ({ category, size = "w-6 h-6" }) => {
    const [imageError, setImageError] = useState(false);

    // Si l'image a échoué ou n'existe pas, utiliser l'icône par défaut
    if (imageError || (!category.iconPath && !category.iconUrl)) {
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
      const IconComponent = iconMap[category.slug] || BaseIcon;
      return <IconComponent className={size} />;
    }

    // Construire l'URL de l'icône
    const iconPath = category.iconPath || category.iconUrl;

    // Toujours préfixer SERVER_BASE_URL (qui inclut /api en prod)
    const iconUrl = iconPath.startsWith('http')
      ? iconPath
      : SERVER_BASE_URL.replace(/\/$/, '') + '/' + iconPath.replace(/^\//, '');


    return (
      <img 
        src={iconUrl} 
        alt={category.name} 
        className={`${size} object-contain`}
        onError={(e) => {
          setImageError(true);
        }}
      />
    );
  };

  // Composant pour afficher l'icône de sous-catégorie avec fallback
  const SubcategoryIcon = ({ subcategory, size = "w-4 h-4" }) => {
    const [imageError, setImageError] = useState(false);

    // Si l'image a échoué ou n'existe pas, utiliser l'icône par défaut
    if (imageError || (!subcategory.iconPath && !subcategory.iconUrl)) {
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
      const IconComponent = iconMap[subcategory.slug] || BaseIcon;
      return <IconComponent className={size} />;
    }

    // Construire l'URL de l'icône
    const iconPath = subcategory.iconPath || subcategory.iconUrl;

    // Toujours préfixer SERVER_BASE_URL (qui inclut /api en prod)
    const iconUrl = iconPath.startsWith('http')
      ? iconPath
      : SERVER_BASE_URL.replace(/\/$/, '') + '/' + iconPath.replace(/^\//, '');


    return (
      <img 
        src={iconUrl} 
        alt={subcategory.name} 
        className={`${size} object-contain`}
        onError={(e) => {
          setImageError(true);
        }}
      />
    );
  };

  // Get category icon (pour compatibilité avec le code existant)
  const getCategoryIcon = (category) => {
    return () => <CategoryIcon category={category} />;
  };

  // Get subcategory icon (pour compatibilité avec le code existant)
  const getSubcategoryIcon = (subcategory) => {
    return () => <SubcategoryIcon subcategory={subcategory} />;
  };

  // Trier les catégories et sous-catégories par ordre alphabétique
  const sortedCategories = categories ? [...categories].sort((a, b) => 
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  ) : [];

  const getSortedSubcategories = (category) => {
    if (!category.subcategories) return [];
    return [...category.subcategories].sort((a, b) => 
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    );
  };

  // Get counts
  const getCategoryCount = (categorySlug) => {
    if (!categories) return 0;
    const category = categories.find(cat => cat.slug === categorySlug);
    return category ? category.totalAds : 0;
  };

  const getSubcategoryCount = (categorySlug, subcategorySlug) => {
    if (!categories) return 0;
    const category = categories.find(cat => cat.slug === categorySlug);
    if (!category) return 0;
    const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug);
    return subcategory ? subcategory.totalAds : 0;
  };

  // Navigation handlers
  const handleCategoryClick = (categorySlug) => {
    navigate(`/search?category=${categorySlug}`);
    closeMobileMenu();
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    navigate(`/subcategory?category=${categorySlug}&subcategory=${subcategorySlug}`);
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedCategory(null);
  };

  const toggleMobileCategory = (e, categorySlug) => {
    e.stopPropagation();
    setExpandedCategory(prev => prev === categorySlug ? null : categorySlug);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Mobile Toggle Button
  const MobileToggleButton = () => (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center justify-between w-full text-left rounded-lg p-3 hover:bg-gray-50 transition-colors relative z-10 cursor-pointer"
        aria-label="Toggle categories menu"
        aria-expanded={isMobileMenuOpen}
      >
        <div className="flex items-center">
          <LayoutGrid className="w-6 h-6 mr-3 text-[#D6BA69]" />
          <span className="text-lg font-semibold text-gray-900">Catégories</span>
        </div>
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-600" />
        )}
      </button>
    </div>
  );

  // Mobile Categories Grid
  const MobileCategoriesGrid = () => {
    if (categoriesLoading) {
      return (
        <div
          ref={mobileMenuRef}
          className={`lg:hidden bg-white transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-6">
            <Loader text="Chargement..." />
          </div>
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div
          ref={mobileMenuRef}
          className={`lg:hidden bg-white transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-6 text-center text-red-500">
            Erreur de chargement
          </div>
        </div>
      );
    }

    return (
      <div
        ref={mobileMenuRef}
        className={`lg:hidden bg-white transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            {sortedCategories.map((category, index) => {
              const IconComponent = getCategoryIcon(category);
              const totalCount = getCategoryCount(category.slug);
              const hasSub = category.subcategories?.length > 0;
              const sortedSubs = getSortedSubcategories(category);

              return (
                <div
                  key={category.slug}
                  className="space-y-2"
                  style={{
                    animation: isMobileMenuOpen ? `fadeInUp 0.4s ease forwards ${index * 50}ms` : 'none',
                    opacity: 0
                  }}
                >
                  {/* Main Category Card */}
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full h-28 bg-white rounded-xl p-3 border border-gray-200 hover:border-[#D6BA69] hover:bg-[#D6BA69]/5 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:ring-offset-1 shadow-sm hover:shadow-md cursor-pointer"
                    aria-label={`Voir ${category.name}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <div className="bg-gray-50 rounded-full p-2.5 flex-shrink-0">
                        {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-6 h-6 text-[#D6BA69]" />}
                      </div>
                      <TranslatedName
                        name={category.name}
                        className="text-xs font-medium text-gray-800 line-clamp-2 text-center leading-tight"
                      />
                    </div>
                  </button>

                  {/* Expanded Subcategories */}
                  {expandedCategory === category.slug && hasSub && (
                    <div className="col-span-3 bg-gray-50 rounded-xl p-4 space-y-2 animate-fadeIn">
                      {sortedSubs.map((sub, i) => {
                        const SubIcon = getSubcategoryIcon(sub);
                        const count = getSubcategoryCount(category.slug, sub.slug);

                        return (
                          <button
                            key={sub.slug}
                            onClick={() => handleSubcategoryClick(category.slug, sub.slug)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] cursor-pointer"
                            style={{
                              animation: `slideInLeft 0.3s ease forwards ${i * 40}ms`,
                              opacity: 0
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              {typeof SubIcon === 'function' ? <SubIcon /> : <SubIcon className="w-5 h-5 text-gray-600" />}
                              <TranslatedName name={sub.name} className="text-sm text-gray-700 truncate" />
                            </div>
                            {/* <span className="text-xs text-gray-500 bg-white px-2.5 py-0.5 rounded-full">
                              {count}
                            </span> */}
                          </button>
                        );
                      })}
                      {/* <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full text-center py-2.5 text-sm font-medium text-[#D6BA69] bg-white rounded-lg border border-[#D6BA69] hover:bg-[#D6BA69] hover:text-white transition-all"
                      >
                        View All →
                      </button> */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => {
    if (categoriesLoading || categoriesError) {
      return (
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="p-6 border-b border-gray-200" />
          <div className="p-6 flex items-center justify-center h-full">
            {categoriesLoading ? <Loader /> : <div className="text-red-500">Erreur</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex relative" style={{ height: 'calc(100vh - 80px)' }}>
        <div
          ref={sidebarRef}
          className={`w-64 bg-white border-r border-gray-200 overflow-y-auto ${className}`}
          onMouseLeave={() => {
            setTimeout(() => {
              if (!document.querySelector('.submenu-container:hover')) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 200);
          }}
        >
          <div className="py-3">
            {sortedCategories.map((category) => {
              const Icon = getCategoryIcon(category);
              const count = getCategoryCount(category.slug);
              const isHovered = hoveredCategory === category.slug;
              const sortedSubs = getSortedSubcategories(category);

              return (
                <div
                  key={category.slug}
                  className="group"
                  onMouseEnter={() => {
                    setHoveredCategory(category.slug);
                    setIsDropdownVisible(true);
                  }}
                >
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#D6BA69]/10 transition-all rounded-r-full mx-2 group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#D6BA69]" />}
                      <TranslatedName
                        name={category.name}
                        className="text-sm font-medium text-gray-800 group-hover:text-[#D6BA69] truncate"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {count > 0 && (
                        <span className="text-xs bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-600">
                          {count}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D6BA69]" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submenu */}
        {isDropdownVisible && hoveredCategory && (
          <div
            className={`submenu-container fixed left-64 top-[30%] w-64 bg-white border border-gray-200 shadow-xl h-[70%] transition-opacity duration-200 ${
              isDropdownVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ zIndex: 50 }}
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => {
              setTimeout(() => {
                if (!sidebarRef.current?.matches(':hover')) {
                  setIsDropdownVisible(false);
                  setHoveredCategory(null);
                }
              }, 100);
            }}
          >
            {categories.find(c => c.slug === hoveredCategory) && (
              (() => {
                const cat = categories.find(c => c.slug === hoveredCategory);
                const Icon = getCategoryIcon(cat);
                return (
                  <div className="flex flex-col h-full">
                    <div className="p-5 border-b border-gray-200">
                      <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5 text-[#D6BA69] mr-2" />}
                        <TranslatedName name={cat.name} />
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                      {getSortedSubcategories(cat).map((sub, i) => {
                        const SubIcon = getSubcategoryIcon(sub);
                        const count = getSubcategoryCount(cat.slug, sub.slug);
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                            className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[#D6BA69]/10 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              {typeof SubIcon === 'function' ? <SubIcon /> : <SubIcon className="w-4 h-4 text-gray-500 group-hover:text-[#D6BA69]" />}
                              <TranslatedName
                                name={sub.name}
                                className="text-sm text-gray-700 group-hover:text-[#D6BA69] truncate"
                              />
                            </div>
                            {count > 0 && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="w-full text-center py-2.5 text-sm font-medium text-[#D6BA69] border border-[#D6BA69] rounded-lg hover:bg-[#D6BA69] hover:text-white transition-all cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full lg:w-auto">
        <MobileToggleButton />
        <MobileCategoriesGrid />
        <DesktopSidebar />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
      `}</style>
    </>
  );
};

export default CategorySidebar;