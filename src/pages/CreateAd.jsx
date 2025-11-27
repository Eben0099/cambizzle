import Select from 'react-select';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Camera, Loader2, MapPin, Zap } from 'lucide-react';
import { FaWallet } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES, AD_TYPES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import useAdCreation from '../hooks/useAdCreation';
import { adsService } from '../services/adsService';
import StepBoostPlan from '../components/StepBoostPlan';
import PaymentModal from '../components/PaymentModal';

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
    type: 'sell',
    tags: '',
    isPremium: false,
    isNegotiable: false,
    filters: {},
    boost_plan_id: null,
    phone: '',
    payment_method: 'mtn_mobile_money'
  });
  
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [canSubmit, setCanSubmit] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ show: false, paymentInfo: null, adId: null });

  const { user, isAuthenticated } = useAuth();
  const { createAd } = useAds();
  const navigate = useNavigate();

  const {
    creationData,
    subcategoryFields,
    isLoading: creationLoading,
    fieldsLoading,
    error: creationError,
    loadSubcategoryFields
  } = useAdCreation();

  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger les champs dynamiques quand la sous-catégorie change
  useEffect(() => {
    if (formData.subcategory) {
      loadSubcategoryFields(formData.subcategory);
    }
  }, [formData.subcategory, loadSubcategoryFields]);

  // Vérifier si on peut soumettre le formulaire
  useEffect(() => {
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
      ...validateStep(5)
    };
    
    const hasNoErrors = Object.keys(allErrors).length === 0;
    const hasMinimumImages = images.length >= 3;
    
    setCanSubmit(hasNoErrors && hasMinimumImages && currentStep === 5);
  }, [formData, images, currentStep]);

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

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'price' || name === 'originalPrice') {
      let raw = value.replace(/\s/g, '');
      if (/^\d+$/.test(raw)) {
        const formatted = Number(raw).toLocaleString('fr-FR');
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    if (name === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        category: value, 
        subcategory: '',
        brandId: '',
        filters: {}
      }));
      setSubcategories([]);
      if (value) {
        try {
          const res = await adsService.getSubcategoriesByCategory(value);
          if (res.status === 'success' && Array.isArray(res.data)) {
            setSubcategories(res.data);
          } else {
            setSubcategories([]);
          }
        } catch (err) {
          setSubcategories([]);
          console.error('Erreur chargement sous-catégories:', err);
        }
      }
      return;
    }

    if (name === 'phone' || name === 'payment_method') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

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
    
    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length < 10) {
        newErrors.title = 'Title must be at least 10 characters';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
      if (!formData.type) {
        newErrors.type = 'Please select an ad type';
      }
      if (!formData.subcategory) {
        newErrors.subcategory = 'Subcategory is required';
      }
    }
    if (step === 2) {
      if (!formData.price) {
        newErrors.price = 'Price is required';
      } else {
        const priceRaw = formData.price.replace(/\s/g, '');
        if (parseFloat(priceRaw) <= 0) {
          newErrors.price = 'Price must be greater than 0';
        }
      }
      if (formData.originalPrice) {
        const originalPriceRaw = formData.originalPrice.replace(/\s/g, '');
        const priceRaw = formData.price.replace(/\s/g, '');
        if (parseFloat(originalPriceRaw) <= parseFloat(priceRaw)) {
          newErrors.originalPrice = 'Original price must be greater than selling price';
        }
      }
      if (!formData.locationId) {
        newErrors.locationId = 'Location is required';
      }
    }
    if (step === 3) {
      if (subcategoryFields.brands && subcategoryFields.brands.length > 0) {
        if (!formData.brandId) {
          newErrors.brandId = 'Brand is required';
        }
      }
      if (subcategoryFields.filters) {
        subcategoryFields.filters.forEach(filter => {
          const value = formData.filters[filter.id];
          let hasValue = false;
          if (Array.isArray(value)) {
            hasValue = value.length > 0;
          } else {
            hasValue = !!(value && typeof value === 'string' && value.trim() !== '');
          }
          if (filter.isRequired && !hasValue) {
            newErrors[`filters.${filter.id}`] = `${filter.name} is required`;
          }
        });
      }
    }
    if (step === 4) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;
      if (images.length < 3) {
        newErrors.images = 'At least 3 photos are required';
      } else if (images.length > 10) {
        newErrors.images = 'Maximum 10 photos allowed';
      } else {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.file) {
            if (!allowedTypes.includes(img.file.type)) {
              newErrors.images = `Photo format not allowed (photo ${i + 1}). Accepted formats: JPG, PNG, WEBP.`;
              break;
            }
            if (img.file.size > maxSize) {
              newErrors.images = `Photo too large (photo ${i + 1}). Max size: 5MB.`;
              break;
            }
          }
        }
      }
    }
    if (step === 5) {
      // Boost plan validation - always valid since "No boost" is an option
      if (formData.boost_plan_id !== null && formData.boost_plan_id !== undefined) {
        // If a paid plan is selected, validate phone and payment method
        if (formData.selectedPlan && formData.selectedPlan.price > 0) {
          if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required for paid boosts';
          } else if (formData.phone.length < 10) {
            newErrors.phone = 'Please enter a valid phone number';
          }
          if (!formData.payment_method) {
            newErrors.payment_method = 'Payment method is required for paid boosts';
          }
        }
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
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateDiscount = () => {
    if (formData.originalPrice && formData.price) {
      const originalRaw = formData.originalPrice.replace(/\s/g, '');
      const currentRaw = formData.price.replace(/\s/g, '');
      const original = parseFloat(originalRaw);
      const current = parseFloat(currentRaw);
      if (!isNaN(original) && !isNaN(current) && original > 0 && current > 0) {
        const discount = Math.round(((original - current) / original) * 100);
        setFormData(prev => ({
          ...prev,
          discountPercent: discount > 0 ? discount : ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          discountPercent: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        discountPercent: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || !canSubmit) return;

    console.log('🚀 Début soumission formulaire');
    
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4)
    };
    
    if (Object.keys(allErrors).length > 0) {
      console.log('❌ Validation échouée - Arrêt soumission');
      setErrors(allErrors);
      return;
    }

    console.log('✅ Validation réussie - Lancement création annonce');

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Champs statiques
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      const priceRaw = formData.price.replace(/\s/g, '');
      const originalPriceRaw = formData.originalPrice ? formData.originalPrice.replace(/\s/g, '') : '';
      
      formDataToSend.append('price', priceRaw);
      formDataToSend.append('original_price', originalPriceRaw || priceRaw);
      formDataToSend.append('discount_percentage', formData.discountPercent || 0);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('is_premium', formData.isPremium ? 1 : 0);
      formDataToSend.append('is_negotiable', formData.isNegotiable ? 1 : 0);
      
      // Convertir subcategory slug en ID
      if (formData.subcategory && formData.category) {
        const selectedSubcategory = subcategories.find(sub => sub.slug === formData.subcategory);
        if (selectedSubcategory?.id) {
          formDataToSend.append('subcategory_id', selectedSubcategory.id);
        }
      }
      
      // Convertir location_id en entier
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
          if (Array.isArray(value)) {
            value.forEach(val => formDataToSend.append(`filters[${filterId}][]`, val));
          } else {
            formDataToSend.append(`filters[${filterId}]`, value);
          }
        }
      });

      // Ajouter les images
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('photos[]', image.file, `photo-${index + 1}.jpg`);
        }
      });

      // Ajouter les informations de boost
      if (formData.boost_plan_id !== null && formData.boost_plan_id !== undefined) {
        formDataToSend.append('boost_plan_id', formData.boost_plan_id);
        if (formData.selectedPlan && formData.selectedPlan.price > 0) {
          formDataToSend.append('phone', formData.phone.trim());
          formDataToSend.append('payment_method', formData.payment_method);
        }
      }

      console.log('📤 Envoi des données...');
      const result = await adsService.createAd(formDataToSend);
      console.log('📡 Réponse API reçue:', result);

      if (result.status === 'success') {
        // Ad created successfully without payment
        navigate('/profile');
      } else if (result.status === 'payment_pending') {
        // Check if required data exists - be more flexible
        const adId = result.adId || result.ad_id || result.id || result.ad?.id;
        const paymentInfo = result.payment_info || result.paymentInfo;

        console.log('💳 Payment pending - extracted data:', { adId, paymentInfo, fullResult: result });

        // Show payment modal even if adId is missing (we mainly need paymentInfo)
        setPaymentModal({
          show: true,
          paymentInfo: paymentInfo || {},
          adId: adId || null
        });
      } else {
        // Handle unexpected status
        setErrors({ submit: result.message || 'Unexpected response from server' });
      }
    } catch (err) {
      console.error('Erreur création annonce:', err);
      setErrors({ submit: err.message || 'Erreur lors de la création de l\'annonce' });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'General Information', icon: Tag },
    { number: 2, title: 'Price and Location', icon: FaWallet },
    { number: 3, title: 'Specific Characteristics', icon: MapPin },
    { number: 4, title: 'Photos', icon: Camera },
    { number: 5, title: 'Boost Plan', icon: Zap }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4 bg-black hover:bg-gray-800 text-white border-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create an Ad
            </h1>
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
                <div key={step.number} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#D6BA69] border-[#D6BA69] text-black'
                      : isActive
                        ? 'border-[#D6BA69] bg-[#D6BA69]/10 text-[#D6BA69]'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {step.number === 2
                      ? <Icon style={{ width: 20, height: 20 }} />
                      : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden sm:block">
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
                      isCompleted ? 'bg-[#D6BA69]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: General Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                    >
                      <option value="sell">Sell</option>
                      <option value="rent">Rent</option>
                    </select>
                    {errors.type && (
                      <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {creationLoading ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading categories...
                      </div>
                    ) : (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                      >
                        <option value=""></option>
                        {creationData.categories?.map(category => (
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
                  {/* Subcategory */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={!formData.category}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all bg-white"
                    >
                      <option value=""></option>
                      {formData.category && subcategories.length > 0 && [...subcategories]
                        .sort((a, b) => a.name.localeCompare(b.name))
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
                  <div className="lg:col-span-2">
                    <Input
                      label={<span>Ad Title <span className="text-red-500">*</span></span>}
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      helperText="Be precise and attractive (min. 10 characters)"
                      className="w-full"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] resize-vertical transition-all bg-white"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length} characters (min. 20)
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      label="Keywords (optional)"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      helperText="Add keywords to improve visibility"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Price and Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={<span>Selling Price <span className="text-red-500">*</span></span>}
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    onBlur={e => {
                      let raw = e.target.value.replace(/\s/g, '');
                      if (/^\d+$/.test(raw)) {
                        setFormData(prev => ({
                          ...prev,
                          price: Number(raw).toLocaleString('fr-FR')
                        }));
                      }
                    }}
                    error={errors.price}
                  />
                  <Input
                    label={
                      <span>
                        Original Price (optional)
                        {formData.price && (
                          <span className="text-red-500 text-xs ml-2">
                            (must be higher than selling price)
                          </span>
                        )}
                      </span>
                    }
                    type="text"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    onBlur={e => {
                      let raw = e.target.value.replace(/\s/g, '');
                      if (/^\d+$/.test(raw)) {
                        setFormData(prev => ({
                          ...prev,
                          originalPrice: Number(raw).toLocaleString('fr-FR')
                        }));
                      }
                      calculateDiscount();
                    }}
                    error={errors.originalPrice}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Negotiable price</label>
                    <select
                      name="isNegotiable"
                      value={formData.isNegotiable ? '1' : '0'}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          isNegotiable: e.target.value === '1'
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                </div>
                {formData.discountPercent > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      {formData.discountPercent}% discount displayed!
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  {creationLoading ? (
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading locations...
                    </div>
                  ) : (
                    <select
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                    >
                      <option value=""></option>
                      {creationData.locations?.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.city}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.locationId && (
                    <p className="text-sm text-red-600 mt-1">{errors.locationId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Specific Characteristics */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="space-y-6">
                {/* Brand Selection */}
                {subcategoryFields.brands && subcategoryFields.brands.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    {fieldsLoading ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading brands...
                      </div>
                  ) : (
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                      >
                        <option value=""></option>
                        {[...subcategoryFields.brands]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                      </select>
                    )}
                    {errors.brandId && (
                      <p className="text-sm text-red-600 mt-1">{errors.brandId}</p>
                    )}
                  </div>
                )}
                {/* Dynamic Filters */}
                {subcategoryFields.filters && subcategoryFields.filters.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Technical Characteristics</h3>
                    {fieldsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading characteristics...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subcategoryFields.filters.map(filter => (
                          <div key={filter.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {filter.name} <span className="text-red-500">*</span>
                            </label>
                            {filter.type === 'select' && filter.options.length > 0 ? (
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              >
                                <option value=""></option>
                                {[...filter.options]
                                  .sort((a, b) => {
                                    const aNum = Number(a), bNum = Number(b);
                                    if (!isNaN(aNum) && !isNaN(bNum)) {
                                      return aNum - bNum;
                                    }
                                    return a.localeCompare(b);
                                  })
                                  .map(option => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                              </select>
                            ) : filter.type === 'number' ? (
                              <input
                                type="number"
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                            ) : filter.type === 'date' ? (
                              <input
                                type="date"
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                            ) : filter.type === 'checkbox' && filter.options.length > 0 ? (
                              <Select
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                isClearable={true}
                                name={`filters.${filter.id}`}
                                options={[...filter.options]
                                  .sort((a, b) => {
                                    const aNum = Number(a), bNum = Number(b);
                                    if (!isNaN(aNum) && !isNaN(bNum)) {
                                      return aNum - bNum;
                                    }
                                    return a.localeCompare(b);
                                  })
                                  .map(option => ({ value: option, label: option }))}
                                value={(formData.filters[filter.id] || []).map(val => ({ value: val, label: val }))}
                                onChange={selected => {
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: {
                                      ...prev.filters,
                                      [filter.id]: selected ? selected.map(opt => opt.value) : []
                                    }
                                  }));
                                }}
                                classNamePrefix="react-select"
                                menuPlacement="auto"
                                menuShouldScrollIntoView={false}
                                styles={{
                                  control: (base) => ({ 
                                    ...base, 
                                    borderColor: '#D6BA69', 
                                    minHeight: 44,
                                    borderRadius: '8px',
                                    boxShadow: 'none',
                                    '&:focus': { borderColor: '#D6BA69' }
                                  }),
                                  multiValue: (base) => ({ ...base, backgroundColor: '#F3F4F6' }),
                                  option: (base, state) => ({ 
                                    ...base, 
                                    backgroundColor: state.isSelected ? '#D6BA69' : '#fff', 
                                    color: state.isSelected ? 'white' : '#222',
                                    '&:hover': { backgroundColor: state.isSelected ? '#D6BA69' : '#f9fafb' },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                  })
                                }}
                                formatOptionLabel={(option, { context, isSelected }) =>
                                  context === 'menu' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        tabIndex={-1}
                                        readOnly
                                        style={{ accentColor: '#D6BA69', marginRight: 8, pointerEvents: 'none' }}
                                        onClick={e => e.stopPropagation()}
                                      />
                                      <span>{option.label}</span>
                                    </div>
                                  ) : (
                                    <span>{option.label}</span>
                                  )
                                }
                              />
                            ) : filter.type === 'text' ? (
                              <input
                                type="text"
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                            ) : null}
                            {errors[`filters.${filter.id}`] && (
                              <p className="text-sm text-red-600 mt-1">{errors[`filters.${filter.id}`]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!formData.subcategory && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>Select a category and subcategory first to see specific characteristics.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
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
                <div className={`p-4 rounded-lg ${
                  images.length >= 3 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    images.length >= 3 ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {images.length >= 3 
                      ? 'Minimum 3 photos requirement met!' 
                      : `${3 - images.length} more photo(s) needed (minimum 3 required)`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Boost Plan */}
          {currentStep === 5 && (
            <StepBoostPlan
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="bg-white border-black text-black hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Previous
              </Button>
            )}
            {currentStep === 1 && (
              <div />
            )}
            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!canSubmit || isLoading}
                className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>

        {/* Payment Modal */}
        {paymentModal.show && (
          <PaymentModal
            paymentInfo={paymentModal.paymentInfo}
            adId={paymentModal.adId}
            onClose={() => setPaymentModal({ show: false, paymentInfo: null, adId: null })}
            onSuccess={() => {
              setPaymentModal({ show: false, paymentInfo: null, adId: null });
              navigate('/profile');
            }}
            onFailure={() => {
              // Keep modal open for retry
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAd;