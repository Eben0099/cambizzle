import { useState } from 'react';
import { ChevronDown, ChevronRight, Grid, List } from 'lucide-react';
import { SERVER_BASE_URL } from '../../config/api';

const CategoryGrid = ({ categories, isLoading, error }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
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
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Explorez nos catégories
        </h2>
        <div className="text-sm text-gray-500">
          {categories.length} catégories disponibles
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            {/* Header de la catégorie */}
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#D6BA69] rounded-lg flex items-center justify-center">
                    {category.iconPath ? (
                      <img
                        src={`${SERVER_BASE_URL}/${category.iconPath}`.replace(/\/+/g, '/')}
                        alt={category.name}
                        className="w-6 h-6 text-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <Grid className="w-6 h-6 text-white" style={{ display: category.iconPath ? 'none' : 'block' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.totalAds} annonce{category.totalAds !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Barre de progression pour les annonces */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Annonces actives</span>
                  <span>{category.totalAds}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#D6BA69] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((category.totalAds / Math.max(...categories.map(c => c.totalAds))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sous-catégories (expandable) */}
            {expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0 && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-3 pt-4">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#D6BA69] bg-opacity-20 rounded-md flex items-center justify-center">
                          {subcategory.iconPath ? (
                            <img
                              src={`${SERVER_BASE_URL}/${subcategory.iconPath}`.replace(/\/+/g, '/')}
                              alt={subcategory.name}
                              className="w-4 h-4"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <List className="w-4 h-4 text-[#D6BA69]" style={{ display: subcategory.iconPath ? 'none' : 'block' }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {subcategory.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {subcategory.totalAds} annonce{subcategory.totalAds !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques globales */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statistiques générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D6BA69]">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">
              Catégories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D6BA69]">
              {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
            </div>
            <div className="text-sm text-gray-600">
              Sous-catégories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D6BA69]">
              {categories.reduce((total, cat) => total + cat.totalAds, 0)}
            </div>
            <div className="text-sm text-gray-600">
              Annonces totales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
