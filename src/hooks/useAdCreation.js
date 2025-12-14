import { useState, useEffect, useCallback } from 'react';
import { adsService } from '../services/adsService';

const useAdCreation = () => {
  const [creationData, setCreationData] = useState({
    locations: [],
    categories: []
  });
  const [subcategoryFields, setSubcategoryFields] = useState({
    brands: [],
    filters: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCreationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📋 Chargement des données de création d\'annonce...');

      const response = await adsService.getAdCreationData();

      // Conversion snake_case vers camelCase avec tri alphabétique
      const processedData = {
        locations: response.locations
          .map(location => ({
            id: location.id,
            city: location.city,
            region: location.region
          }))
          .sort((a, b) => a.city.localeCompare(b.city)),
        categories: response.categories
          .map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            subcategories: category.subcategories?.map(sub => ({
              id: sub.id,
              categoryId: sub.categoryId || sub.category_id,
              name: sub.name,
              slug: sub.slug
            })).sort((a, b) => a.name.localeCompare(b.name)) || []
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      };

      console.log('✅ Données de création traitées:', processedData);
      setCreationData(processedData);
    } catch (err) {
      console.error('❌ Erreur chargement données création:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSubcategoryFields = useCallback(async (subcategorySlug) => {
    if (!subcategorySlug) {
      setSubcategoryFields({ brands: [], filters: [] });
      return;
    }

    try {
      setFieldsLoading(true);
      console.log('🔧 Chargement des champs pour:', subcategorySlug);

      const response = await adsService.getSubcategoryFields(subcategorySlug);

      // Conversion snake_case vers camelCase avec tri alphabétique
      const processedFields = {
        brands: response.brands
          .map(brand => ({
            id: brand.id,
            name: brand.name,
            fullLogoUrl: brand.fullLogoUrl || brand.full_logo_url
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        filters: response.filters.map(filter => ({
          id: filter.id,
          name: filter.name,
          type: filter.type,
          isRequired: filter.isRequired || filter.is_required,
          options: filter.options || []
        }))
      };

      console.log('✅ Champs sous-catégorie traités:', processedFields);
      setSubcategoryFields(processedFields);
    } catch (err) {
      console.error('❌ Erreur chargement champs sous-catégorie:', err);
      setSubcategoryFields({ brands: [], filters: [] });
    } finally {
      setFieldsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreationData();
  }, [loadCreationData]);

  return {
    creationData,
    subcategoryFields,
    isLoading,
    fieldsLoading,
    error,
    loadSubcategoryFields,
    refetch: loadCreationData
  };
};

export default useAdCreation;
