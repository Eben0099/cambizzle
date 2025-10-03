import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Euro, MapPin, Tag, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES, AD_TYPES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import useAdCreation from '../hooks/useAdCreation';
import { adsService } from '../services/adsService';

const CreateAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    locationId: '',
    brandId: '',
    discountPercent: 0,
    // Champs dynamiques pour les filtres
    filters: {}
  });

  const [images, setImages] = useState([]);
  
  // Debug: Log des changements d'images
  const handleImagesChange = (newImages) => {
    console.log('📸 CreateAd: Changement d\'images', {
      previous: images.length,
      new: newImages.length,
      images: newImages.map((img, idx) => ({
        index: idx,
        fileName: img.file?.name,
        hasFile: !!img.file,
        hasUrl: !!img.url
      }))
    });
    setImages(newImages);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const { user, isAuthenticated } = useAuth();
  const { createAd } = useAds();
  const navigate = useNavigate();

  // Hook pour les données de création d'annonce
  const {
    creationData,
    subcategoryFields,
    isLoading: creationLoading,
    fieldsLoading,
    error: creationError,
    loadSubcategoryFields
  } = useAdCreation();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Charger les champs dynamiques quand la sous-catégorie change
  useEffect(() => {
    if (formData.subcategory) {
      loadSubcategoryFields(formData.subcategory);
    }
  }, [formData.subcategory, loadSubcategoryFields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    console.log(`🔍 Validation step ${step}:`, {
      subcategory: formData.subcategory,
      subcategoryType: typeof formData.subcategory,
      subcategoryValue: JSON.stringify(formData.subcategory),
      category: formData.category,
      hasCreationData: !!creationData,
      hasCategories: !!creationData?.categories,
      categoriesCount: creationData?.categories?.length || 0
    });
    
    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Le titre est requis';
      } else if (formData.title.length < 10) {
        newErrors.title = 'Le titre doit contenir au moins 10 caractères';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'La description est requise';
      } else if (formData.description.length < 20) {
        newErrors.description = 'La description doit contenir au moins 20 caractères';
      }
      
      if (!formData.category) {
        newErrors.category = 'Sélectionnez une catégorie';
      }

      if (!formData.subcategory) {
        newErrors.subcategory = 'La sous-catégorie est requise';
      } else if (formData.category) {
        // Vérifier si le slug de subcategory existe et peut être résolu en ID
        const selectedCategory = creationData.categories.find(cat => cat.id === formData.category);
        const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.slug === formData.subcategory);
        
        if (!selectedSubcategory?.id) {
          newErrors.subcategory = 'ID de sous-catégorie invalide';
          console.log('❌ Validation subcategory échouée:', {
            value: formData.subcategory,
            type: typeof formData.subcategory,
            categoryFound: !!selectedCategory,
            subcategoryFound: !!selectedSubcategory
          });
        } else {
          console.log('✅ Validation subcategory OK:', {
            slug: formData.subcategory,
            id: selectedSubcategory.id,
            name: selectedSubcategory.name
          });
        }
      } else {
        newErrors.subcategory = 'Sélectionnez d\'abord une catégorie';
      }
    }
    
    if (step === 2) {
      if (!formData.price) {
        newErrors.price = 'Le prix est requis';
      } else if (parseFloat(formData.price) <= 0) {
        newErrors.price = 'Le prix doit être supérieur à 0';
      }
      
      if (formData.originalPrice && parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
        newErrors.originalPrice = 'Le prix original doit être supérieur au prix de vente';
      }

      if (!formData.locationId) {
        newErrors.locationId = 'La localisation est requise';
      } else if (isNaN(parseInt(formData.locationId))) {
        newErrors.locationId = 'ID de localisation invalide';
      }
    }
    
    if (step === 3) {
      console.log('🔍 Validation étape 3 - Filtres dynamiques');
      console.log('📋 subcategoryFields:', subcategoryFields);
      console.log('📋 formData.filters:', formData.filters);

      // Validation des champs dynamiques requis
      if (subcategoryFields.filters) {
        subcategoryFields.filters.forEach(filter => {
          console.log(`🔍 Vérification filtre ${filter.id} (${filter.name}):`, {
            isRequired: filter.isRequired,
            currentValue: formData.filters[filter.id],
            hasValue: !!(formData.filters[filter.id] && formData.filters[filter.id].trim() !== '')
          });

          if (filter.isRequired && (!formData.filters[filter.id] || formData.filters[filter.id].trim() === '')) {
            newErrors[`filters.${filter.id}`] = `${filter.name} est requis`;
            console.log(`❌ Erreur ajoutée pour ${filter.name}`);
          }
        });
      } else {
        console.log('⚠️ Pas de filtres définis pour cette sous-catégorie');
      }
    }

    if (step === 4) {
      console.log('✅ CreateAd: Validation étape 4 - Photos', {
        imagesCount: images.length,
        images: images.map((img, idx) => ({
          index: idx,
          hasFile: !!img.file,
          fileName: img.file?.name
        }))
      });
      
      if (images.length === 0) {
        newErrors.images = 'Au moins une photo est requise';
        console.log('❌ CreateAd: Erreur - Aucune photo sélectionnée');
      } else if (images.length > 10) {
        newErrors.images = 'Maximum 10 photos autorisées';
        console.log('❌ CreateAd: Erreur - Trop de photos:', images.length);
      } else {
        console.log('✅ CreateAd: Validation photos OK -', images.length, 'photo(s)');
      }
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateDiscount = () => {
    if (formData.originalPrice && formData.price) {
      const original = parseFloat(formData.originalPrice);
      const current = parseFloat(formData.price);
      const discount = Math.round(((original - current) / original) * 100);
      setFormData(prev => ({
        ...prev,
        discountPercent: discount > 0 ? discount : 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        discountPercent: 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Début soumission formulaire');
    console.log('📊 État actuel:', {
      currentStep,
      formData,
      subcategoryFields,
      images: images.length
    });
    
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4)
    };

    console.log('🔍 Erreurs de validation:', allErrors);
    
    if (Object.keys(allErrors).length > 0) {
      console.log('❌ Validation échouée - Arrêt soumission');
      setErrors(allErrors);
      return;
    }

    console.log('✅ Validation réussie - Lancement création annonce');

    setIsLoading(true);

    try {
      // Créer FormData pour l'envoi avec fichiers
      const formDataToSend = new FormData();

      // Champs statiques
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('original_price', formData.originalPrice || formData.price);
      formDataToSend.append('discount_percentage', formData.discountPercent || 0);
      
      // Convertir subcategory slug en ID avant envoi
      if (formData.subcategory && formData.category) {
        const selectedCategory = creationData.categories.find(cat => cat.id === formData.category);
        const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.slug === formData.subcategory);
        
        if (selectedSubcategory?.id) {
          formDataToSend.append('subcategory_id', selectedSubcategory.id);
          console.log('🔄 Conversion subcategory:', {
            slug: formData.subcategory,
            id: selectedSubcategory.id,
            name: selectedSubcategory.name
          });
        } else {
          console.error('❌ Impossible de trouver l\'ID pour subcategory:', formData.subcategory);
        }
      }
      
      // Convertir location_id en entier avant envoi
      if (formData.locationId) {
        formDataToSend.append('location_id', parseInt(formData.locationId));
      }

      // Champs dynamiques
      if (formData.brandId) {
        formDataToSend.append('brand_id', parseInt(formData.brandId));
      }

      // Ajouter les filtres dynamiques
      Object.entries(formData.filters).forEach(([filterId, value]) => {
        if (value !== undefined && value !== '') {
          formDataToSend.append(`filters[${filterId}]`, value);
        }
      });

      // Ajouter les images
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('photos[]', image.file, `photo-${index + 1}.jpg`);
        }
      });

      // Debug logs détaillés
      console.log('📝 === DÉBUT DEBUG FORMULAIRE ===');
      console.log('📋 Données du formulaire original:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice,
        discountPercent: formData.discountPercent,
        category: formData.category,
        subcategory: formData.subcategory,
        subcategoryParsed: parseInt(formData.subcategory),
        locationId: formData.locationId,
        locationIdParsed: parseInt(formData.locationId),
        brandId: formData.brandId,
        brandIdParsed: formData.brandId ? parseInt(formData.brandId) : null,
        filters: formData.filters
      });

      console.log('🖼️ Images:', images.map((img, idx) => ({
        index: idx,
        hasFile: !!img.file,
        fileName: img.file?.name,
        fileSize: img.file?.size,
        fileType: img.file?.type
      })));

      console.log('📤 FormData contenu:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log('📝 === FIN DEBUG FORMULAIRE ===');
      console.log('🚀 Appel API en cours...');
      console.log('🔗 adsService disponible:', !!adsService);
      console.log('🔗 createAd méthode disponible:', !!adsService.createAd);

      const result = await adsService.createAd(formDataToSend);
      console.log('📡 Réponse API reçue:', result);

      if (result.success) {
        navigate(`/ads/${result.data.slug}`);
      }
    } catch (err) {
      console.error('Erreur création annonce:', err);
      setErrors({ submit: err.message || 'Erreur lors de la création de l\'annonce' });
    } finally {
      setIsLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like new' },
    { value: 'good', label: 'Good condition' },
    { value: 'fair', label: 'Fair condition' },
    { value: 'poor', label: 'Needs renovation' }
  ];

  const typeOptions = [
    { value: 'sell', label: 'Sell' },
    { value: 'rent', label: 'Rent' },
    { value: 'service', label: 'Service' }
  ];

  const steps = [
    { number: 1, title: 'Informations générales', icon: Tag },
    { number: 2, title: 'Prix et localisation', icon: Euro },
    { number: 3, title: 'Caractéristiques spécifiques', icon: MapPin },
    { number: 4, title: 'Photos', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create an Ad
            </h1>
            <p className="text-gray-600 mt-1">
              Easily sell or rent your items
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-[#D6BA69] border-[#D6BA69] text-black' 
                      : isActive 
                        ? 'border-[#D6BA69] text-[#D6BA69]' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-[#D6BA69]' : 'text-gray-500'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-[#D6BA69]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: General Information */}
          {currentStep === 1 && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    General Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'annonce
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                    </label>
                  {creationLoading ? (
                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Chargement des catégories...
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        handleChange(e);
                        // Reset subcategory when category changes
                        setFormData(prev => ({
                          ...prev,
                          subcategory: '',
                          brandId: '',
                          filters: {}
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {creationData.categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                    )}
                  </div>

                {/* Sous-catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégorie *
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => {
                      handleChange(e);
                      // Reset brand and filters when subcategory changes
                      setFormData(prev => ({
                        ...prev,
                        brandId: '',
                        filters: {}
                      }));
                    }}
                    disabled={!formData.category}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.category ? 'Sélectionner une sous-catégorie' : 'Sélectionnez d\'abord une catégorie'}
                    </option>
                    {formData.category && creationData.categories
                      .find(cat => cat.id === formData.category)?.subcategories
                      .map(subcategory => (
                        <option key={subcategory.id} value={subcategory.slug}>
                          {subcategory.name}
                        </option>
                      ))}
                  </select>
                  {errors.subcategory && (
                    <p className="text-sm text-red-600 mt-1">{errors.subcategory}</p>
                  )}
                </div>

                <Input
                  label="Ad Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="Ex: iPhone 14 Pro Max 256GB - Like new"
                  helperText="Be precise and attractive (min. 10 characters)"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                    placeholder="Describe your item in detail: condition, features, reason for selling..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length} characters (min. 20)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                  >
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Keywords (optional)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="smartphone, apple, iphone (separated by commas)"
                  helperText="Add keywords to improve visibility"
                />
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Price and Location */}
          {currentStep === 2 && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Price and Location
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Selling Price *"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    error={errors.price}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />

                  <Input
                    label="Original Price (optional)"
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    onBlur={calculateDiscount}
                    error={errors.originalPrice}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    helperText="To display a discount"
                  />
                </div>

                {formData.discountPercent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      🎉 {formData.discountPercent}% discount displayed!
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation *
                  </label>
                  {creationLoading ? (
                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Chargement des localisations...
                    </div>
                  ) : (
                    <select
                      name="locationId"
                      value={formData.locationId}
                    onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                    >
                      <option value="">Sélectionner une localisation</option>
                      {creationData.locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.city} - {location.region}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.locationId && (
                    <p className="text-sm text-red-600 mt-1">{errors.locationId}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="isPremium"
                    name="isPremium"
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
                  />
                  <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900">
                    Premium ad (+€5) - Featured listing and premium badge
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Specific Characteristics */}
          {currentStep === 3 && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Caractéristiques spécifiques
                  </h2>
                  <p className="text-gray-600">
                    Renseignez les caractéristiques spécifiques à votre produit
                  </p>
                </div>

                {/* Brand Selection */}
                {subcategoryFields.brands && subcategoryFields.brands.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque
                    </label>
                    {fieldsLoading ? (
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Chargement des marques...
                      </div>
                    ) : (
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                      >
                        <option value="">Sélectionner une marque (optionnel)</option>
                        {subcategoryFields.brands.map(brand => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Dynamic Filters */}
                {subcategoryFields.filters && subcategoryFields.filters.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Caractéristiques techniques</h3>
                    {fieldsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Chargement des caractéristiques...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subcategoryFields.filters.map(filter => (
                          <div key={filter.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {filter.name}
                              {filter.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {filter.type === 'select' ? (
                              <select
                                name={`filters.${filter.id}`}
                                value={formData.filters[filter.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: {
                                      ...prev.filters,
                                      [filter.id]: value
                                    }
                                  }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                              >
                                <option value="">Sélectionner {filter.name.toLowerCase()}</option>
                                {filter.options.map(option => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={filter.type}
                                name={`filters.${filter.id}`}
                                value={formData.filters[filter.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: {
                                      ...prev.filters,
                                      [filter.id]: value
                                    }
                                  }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                                placeholder={`Entrer ${filter.name.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!formData.subcategory && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Sélectionnez d'abord une catégorie et sous-catégorie pour voir les caractéristiques spécifiques.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Ad Photos
                  </h2>
                  <p className="text-gray-600">
                    Add quality photos to attract more buyers
                  </p>
                </div>

                <ImageUpload
                  images={images}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />

                {errors.images && (
                  <p className="text-sm text-red-600">{errors.images}</p>
                )}
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Publier l'annonce
                </Button>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateAd;
