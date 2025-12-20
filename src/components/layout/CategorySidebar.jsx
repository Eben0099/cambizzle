import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Icône par défaut
const BaseIcon = Package;

// Cache global pour les images déjà chargées (persiste entre les re-rendus)
const loadedImagesCache = new Set();

// Map des icônes par slug - défini une seule fois en dehors du composant
const categoryIconMap = {
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

// Map des icônes de sous-catégories par slug
const subcategoryIconMap = {
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

// Composant pour afficher l'icône de catégorie avec fallback (défini en dehors)
const CategoryIcon = memo(
  function CategoryIcon({ category, size = "w-6 h-6" }) {
    const iconPath = category?.iconPath || category?.iconUrl;
    const IconComponent = categoryIconMap[category?.slug] || BaseIcon;

    // Si pas d'icône personnalisée, utiliser l'icône par défaut
    if (!iconPath) {
      return <IconComponent className={size} />;
    }

    // Construire l'URL de l'icône
    const iconUrl = iconPath.startsWith('http')
      ? iconPath
      : SERVER_BASE_URL.replace(/\/$/, '') + '/' + iconPath.replace(/^\//, '');

    // Vérifier si l'image est déjà dans le cache
    const isAlreadyLoaded = loadedImagesCache.has(iconUrl);
    const [imageLoaded, setImageLoaded] = useState(isAlreadyLoaded);
    const [imageError, setImageError] = useState(false);

    // Si erreur, utiliser l'icône par défaut
    if (imageError) {
      return <IconComponent className={size} />;
    }

    // Si déjà chargée, afficher directement l'image
    if (imageLoaded) {
      return (
        <img
          src={iconUrl}
          alt={category?.name || ''}
          className={`${size} object-contain`}
        />
      );
    }

    // Sinon, afficher l'icône par défaut et charger l'image en arrière-plan
    return (
      <span className="relative inline-flex">
        <IconComponent className={size} />
        <img
          src={iconUrl}
          alt=""
          className="absolute opacity-0 w-0 h-0"
          onLoad={() => {
            loadedImagesCache.add(iconUrl);
            setImageLoaded(true);
          }}
          onError={() => setImageError(true)}
        />
      </span>
    );
  },
  // Comparaison personnalisée: ne re-render que si le slug ou size change
  (prevProps, nextProps) =>
    prevProps.category?.slug === nextProps.category?.slug &&
    prevProps.size === nextProps.size
);

// Composant pour afficher l'icône de sous-catégorie avec fallback (défini en dehors)
const SubcategoryIcon = memo(
  function SubcategoryIcon({ subcategory, size = "w-4 h-4" }) {
    const iconPath = subcategory?.iconPath || subcategory?.iconUrl;
    const IconComponent = subcategoryIconMap[subcategory?.slug] || BaseIcon;

    // Si pas d'icône personnalisée, utiliser l'icône par défaut
    if (!iconPath) {
      return <IconComponent className={size} />;
    }

    // Construire l'URL de l'icône
    const iconUrl = iconPath.startsWith('http')
      ? iconPath
      : SERVER_BASE_URL.replace(/\/$/, '') + '/' + iconPath.replace(/^\//, '');

    // Vérifier si l'image est déjà dans le cache
    const isAlreadyLoaded = loadedImagesCache.has(iconUrl);
    const [imageLoaded, setImageLoaded] = useState(isAlreadyLoaded);
    const [imageError, setImageError] = useState(false);

    // Si erreur, utiliser l'icône par défaut
    if (imageError) {
      return <IconComponent className={size} />;
    }

    // Si déjà chargée, afficher directement l'image
    if (imageLoaded) {
      return (
        <img
          src={iconUrl}
          alt={subcategory?.name || ''}
          className={`${size} object-contain`}
        />
      );
    }

    // Sinon, afficher l'icône par défaut et charger l'image en arrière-plan
    return (
      <span className="relative inline-flex">
        <IconComponent className={size} />
        <img
          src={iconUrl}
          alt=""
          className="absolute opacity-0 w-0 h-0"
          onLoad={() => {
            loadedImagesCache.add(iconUrl);
            setImageLoaded(true);
          }}
          onError={() => setImageError(true)}
        />
      </span>
    );
  },
  // Comparaison personnalisée: ne re-render que si le slug ou size change
  (prevProps, nextProps) =>
    prevProps.subcategory?.slug === nextProps.subcategory?.slug &&
    prevProps.size === nextProps.size
);

const CategorySidebar = ({ className = '' }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [submenuTop, setSubmenuTop] = useState(0);
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const categoryRefs = useRef({});
  const { ads } = useAds();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const navigate = useNavigate();

  // Get active category/subcategory from URL
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');
  const activeSubcategory = searchParams.get('subcategory');

  // Trier les catégories et sous-catégories par ordre alphabétique (mémorisé pour éviter les re-rendus)
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    );
  }, [categories]);

  // Mémoriser les sous-catégories triées par catégorie
  const sortedSubcategoriesMap = useMemo(() => {
    if (!categories) return {};
    const map = {};
    categories.forEach(category => {
      if (category.subcategories) {
        map[category.slug] = [...category.subcategories].sort((a, b) =>
          a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        );
      } else {
        map[category.slug] = [];
      }
    });
    return map;
  }, [categories]);

  const getSortedSubcategories = useCallback((category) => {
    return sortedSubcategoriesMap[category?.slug] || [];
  }, [sortedSubcategoriesMap]);

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
          <span className="text-lg font-semibold text-gray-900">{t('sidebar.categories')}</span>
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
            <Loader text={t('sidebar.loading')} />
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
            {t('sidebar.error')}
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
                      <div className="bg-gray-50 rounded-full p-2.5 flex-shrink-0 text-[#D6BA69]">
                        <CategoryIcon category={category} size="w-6 h-6" />
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
                            <div className="flex items-center space-x-3 text-gray-600">
                              <SubcategoryIcon subcategory={sub} size="w-5 h-5" />
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
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-5 h-5 text-[#D6BA69]" />
              <h2 className="font-semibold text-gray-900">{t('sidebar.categories')}</h2>
            </div>
          </div>
          <div className="p-6 flex items-center justify-center h-full">
            {categoriesLoading ? <Loader text={t('sidebar.loading')} /> : <div className="text-red-500">{t('sidebar.error')}</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex relative" style={{ height: 'calc(100vh - 80px)' }}>
        <div
          ref={sidebarRef}
          className={`w-64 bg-white border-r border-gray-200 overflow-y-auto scrollbar-thin ${className}`}
          onMouseLeave={() => {
            setTimeout(() => {
              if (!document.querySelector('.submenu-container:hover')) {
                setHoveredCategory(null);
                setIsDropdownVisible(false);
              }
            }, 200);
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-5 h-5 text-[#D6BA69]" />
              <h2 className="font-semibold text-gray-900">{t('sidebar.categories')}</h2>
            </div>
          </div>

          <div className="py-3">
            {sortedCategories.map((category) => {
              const count = getCategoryCount(category.slug);
              const isActive = activeCategory === category.slug;
              const sortedSubs = getSortedSubcategories(category);

              return (
                <div
                  key={category.slug}
                  className="group"
                  ref={(el) => categoryRefs.current[category.slug] = el}
                  onMouseEnter={(e) => {
                    setHoveredCategory(category.slug);
                    setIsDropdownVisible(true);
                    // Calculate submenu position
                    const rect = e.currentTarget.getBoundingClientRect();
                    const sidebarRect = sidebarRef.current?.getBoundingClientRect();
                    if (sidebarRect) {
                      setSubmenuTop(Math.max(rect.top - sidebarRect.top, 0));
                    }
                  }}
                >
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`w-full flex items-center justify-between px-5 py-3 transition-all rounded-r-full mx-2 group cursor-pointer ${
                      isActive
                        ? 'bg-[#D6BA69]/20 border-l-4 border-[#D6BA69]'
                        : 'hover:bg-[#D6BA69]/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-[#D6BA69]' : 'text-gray-600 group-hover:text-[#D6BA69]'}`}>
                        <CategoryIcon category={category} size="w-5 h-5" />
                      </span>
                      <TranslatedName
                        name={category.name}
                        className={`text-sm font-medium truncate ${isActive ? 'text-[#D6BA69]' : 'text-gray-800 group-hover:text-[#D6BA69]'}`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {count > 0 && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${isActive ? 'bg-[#D6BA69]/30 text-[#D6BA69]' : 'bg-gray-100 text-gray-600'}`}>
                          {count}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#D6BA69]' : 'text-gray-400 group-hover:text-[#D6BA69]'}`} />
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
            className="submenu-container absolute left-[254px] w-72 bg-white border border-gray-200 rounded-lg shadow-2xl transition-all duration-200 ease-out opacity-100"
            style={{
              zIndex: 50,
              top: `${Math.min(submenuTop, window.innerHeight - 400)}px`,
              maxHeight: 'min(450px, calc(100vh - 150px))'
            }}
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => {
              setTimeout(() => {
                if (!sidebarRef.current?.matches(':hover')) {
                  setIsDropdownVisible(false);
                  setHoveredCategory(null);
                }
              }, 150);
            }}
          >
            {categories.find(c => c.slug === hoveredCategory) && (
              (() => {
                const cat = categories.find(c => c.slug === hoveredCategory);
                const sortedSubs = getSortedSubcategories(cat);
                return (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
                      <h3 className="flex items-center text-sm font-semibold text-gray-900">
                        <span className="w-5 h-5 text-[#D6BA69] mr-2 flex-shrink-0">
                          <CategoryIcon category={cat} size="w-5 h-5" />
                        </span>
                        <TranslatedName name={cat.name} />
                      </h3>
                    </div>
                    <div className="flex-1 py-2 overflow-y-auto scrollbar-thin">
                      {sortedSubs.map((sub) => {
                        const count = getSubcategoryCount(cat.slug, sub.slug);
                        const isSubActive = activeCategory === cat.slug && activeSubcategory === sub.slug;
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 transition-all group cursor-pointer ${
                              isSubActive
                                ? 'bg-[#D6BA69]/20 border-l-4 border-[#D6BA69]'
                                : 'hover:bg-[#D6BA69]/10'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <span className={`flex-shrink-0 w-4 h-4 ${isSubActive ? 'text-[#D6BA69]' : 'text-gray-500 group-hover:text-[#D6BA69]'}`}>
                                <SubcategoryIcon subcategory={sub} size="w-4 h-4" />
                              </span>
                              <TranslatedName
                                name={sub.name}
                                className={`text-sm truncate ${isSubActive ? 'text-[#D6BA69] font-medium' : 'text-gray-700 group-hover:text-[#D6BA69]'}`}
                              />
                            </div>
                            {count > 0 && (
                              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${isSubActive ? 'bg-[#D6BA69]/30 text-[#D6BA69]' : 'bg-gray-100 text-gray-600'}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
                      <button
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="w-full text-center py-2.5 text-sm font-medium text-[#D6BA69] border border-[#D6BA69] rounded-lg hover:bg-[#D6BA69] hover:text-white transition-all cursor-pointer"
                      >
                        {t('sidebar.viewAll')} →
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Zone de transition invisible entre sidebar et submenu */}
        {isDropdownVisible && hoveredCategory && (
          <div
            className="absolute left-[250px] w-6 bg-transparent"
            style={{
              top: `${submenuTop}px`,
              height: '60px',
              zIndex: 49
            }}
            onMouseEnter={() => setIsDropdownVisible(true)}
          />
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

        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #D6BA69;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #c9a63a;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #D6BA69 transparent;
        }

        /* Hide horizontal scrollbar */
        .overflow-y-auto {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
};

export default CategorySidebar;