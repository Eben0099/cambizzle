import Select from 'react-select';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Tag, Camera, Loader2, MapPin, Zap } from 'lucide-react';
import { FaWallet } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../components/toast/useToast';
import { CATEGORIES, AD_TYPES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import useAdCreation from '../hooks/useAdCreation';
import { adsService } from '../services/adsService';
import StepBoostPlan from '../components/StepBoostPlan';
import PaymentModal from '../components/PaymentModal';
import logger from '../utils/logger';
import { useWeglotTranslate, useWeglotTranslateArray } from '../hooks/useWeglotRetranslate';

// Fonction pour traduire les erreurs API
const translateApiError = (errorMessage, t) => {
  if (!errorMessage) return errorMessage;

  // Vérifier si c'est un message d'erreur connu (format "field: message")
  const colonIndex = errorMessage.indexOf(':');
  if (colonIndex > 0) {
    const field = errorMessage.substring(0, colonIndex).trim();
    const message = errorMessage.substring(colonIndex + 1).trim();

    // Traduire le nom du champ
    const translatedField = t(`errors.apiFields.${field}`, { defaultValue: field });

    // Essayer de traduire le message complet d'abord
    const fullMessageKey = `errors.apiMessages.${message}`;
    const translatedFullMessage = t(fullMessageKey, { defaultValue: '' });

    if (translatedFullMessage) {
      return `${translatedField}: ${translatedFullMessage}`;
    }

    // Sinon, essayer de traduire des parties du message
    let translatedMessage = message;
    if (message.toLowerCase().includes('required')) {
      translatedMessage = t('errors.apiMessages.required');
    } else if (message.toLowerCase().includes('min') || message.toLowerCase().includes('short')) {
      translatedMessage = t('errors.apiMessages.min');
    } else if (message.toLowerCase().includes('max') || message.toLowerCase().includes('long')) {
      translatedMessage = t('errors.apiMessages.max');
    } else if (message.toLowerCase().includes('invalid')) {
      translatedMessage = t('errors.apiMessages.invalid');
    }

    return `${translatedField} ${translatedMessage}`;
  }

  // Essayer de traduire le message complet
  const directTranslation = t(`errors.apiMessages.${errorMessage}`, { defaultValue: '' });
  if (directTranslation) {
    return directTranslation;
  }

  return errorMessage;
};

// Composant pour traduire un texte inline (pour les labels de filtres)
const TranslatedText = ({ text, className }) => {
  const { translatedText } = useWeglotTranslate(text || '');
  return <span className={className}>{translatedText || text}</span>;
};

// Composant pour traduire une option de filtre
const TranslatedOption = ({ text }) => {
  const { translatedText } = useWeglotTranslate(text || '');
  return <>{translatedText || text}</>;
};

// Composant Select avec options traduites
const TranslatedFilterSelectField = ({ filter, value, onChange, error }) => {
  const { translatedItems } = useWeglotTranslateArray(
    (filter.options || []).map(opt => ({ value: opt, displayLabel: opt })),
    'displayLabel'
  );

  const optionsToDisplay = translatedItems.length > 0 ? translatedItems : (filter.options || []).map(opt => ({ value: opt, displayLabel: opt }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedText text={filter.name} /> <span className="text-red-500">*</span>
      </label>
      <select
        name={`filters.${filter.id}`}
        value={value || ''}
        onChange={(e) => onChange(filter.id, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
      >
        <option value=""></option>
        {[...optionsToDisplay]
          .sort((a, b) => {
            const aNum = Number(a.value), bNum = Number(b.value);
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
            return a.displayLabel.localeCompare(b.displayLabel);
          })
          .map(option => (
            <option key={option.value} value={option.value}>
              {option.displayLabel}
            </option>
          ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Composant Multi-Select (checkbox) avec options traduites
const TranslatedFilterMultiSelect = ({ filter, value, onChange, error, Select: SelectComponent }) => {
  const { translatedItems } = useWeglotTranslateArray(
    (filter.options || []).map(opt => ({ value: opt, displayLabel: opt })),
    'displayLabel'
  );

  const optionsToDisplay = translatedItems.length > 0 ? translatedItems : (filter.options || []).map(opt => ({ value: opt, displayLabel: opt }));

  const selectOptions = [...optionsToDisplay]
    .sort((a, b) => {
      const aNum = Number(a.value), bNum = Number(b.value);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.displayLabel.localeCompare(b.displayLabel);
    })
    .map(option => ({ value: option.value, label: option.displayLabel }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedText text={filter.name} /> <span className="text-red-500">*</span>
      </label>
      <SelectComponent
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={true}
        name={`filters.${filter.id}`}
        options={selectOptions}
        value={(value || []).map(val => {
          const found = selectOptions.find(opt => opt.value === val);
          return found || { value: val, label: val };
        })}
        onChange={selected => onChange(filter.id, selected ? selected.map(opt => opt.value) : [])}
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
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

const CreateAd = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
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

  // Traduire les données dynamiques avec Weglot
  const { translatedItems: translatedCategories } = useWeglotTranslateArray(creationData.categories || [], 'name');
  const { translatedItems: translatedSubcategories } = useWeglotTranslateArray(subcategories, 'name');
  const { translatedItems: translatedLocations } = useWeglotTranslateArray(creationData.locations || [], 'city');
  const { translatedItems: translatedBrands } = useWeglotTranslateArray(subcategoryFields.brands || [], 'name');
  const { translatedItems: translatedFilters } = useWeglotTranslateArray(subcategoryFields.filters || [], 'name');

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
    logger.debug('CreateAd: Changement d\'images', {
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
          logger.error('Erreur chargement sous-catégories:', err);
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
        newErrors.title = t('createAd.validation.titleRequired');
      } else if (formData.title.length < 10) {
        newErrors.title = t('createAd.validation.titleMinLength');
      }
      if (!formData.description.trim()) {
        newErrors.description = t('createAd.validation.descriptionRequired');
      } else if (formData.description.length < 20) {
        newErrors.description = t('createAd.validation.descriptionMinLength');
      }
      if (!formData.category) {
        newErrors.category = t('createAd.validation.categoryRequired');
      }
      if (!formData.type) {
        newErrors.type = t('createAd.validation.adTypeRequired');
      }
      if (!formData.subcategory) {
        newErrors.subcategory = t('createAd.validation.subcategoryRequired');
      }
    }
    if (step === 2) {
      if (!formData.price) {
        newErrors.price = t('createAd.validation.priceRequired');
      } else {
        const priceRaw = formData.price.replace(/\s/g, '');
        if (parseFloat(priceRaw) <= 0) {
          newErrors.price = t('createAd.validation.priceGreaterThanZero');
        }
      }
      if (formData.originalPrice) {
        const originalPriceRaw = formData.originalPrice.replace(/\s/g, '');
        const priceRaw = formData.price.replace(/\s/g, '');
        if (parseFloat(originalPriceRaw) <= parseFloat(priceRaw)) {
          newErrors.originalPrice = t('createAd.validation.originalPriceMustBeHigher');
        }
      }
      if (!formData.locationId) {
        newErrors.locationId = t('createAd.validation.locationRequired');
      }
    }
    if (step === 3) {
      if (subcategoryFields.brands && subcategoryFields.brands.length > 0) {
        if (!formData.brandId) {
          newErrors.brandId = t('createAd.validation.brandRequired');
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
            newErrors[`filters.${filter.id}`] = t('createAd.validation.filterRequired', { filterName: filter.name });
          }
        });
      }
    }
    if (step === 4) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;
      if (images.length < 3) {
        newErrors.images = t('createAd.validation.minPhotosRequired');
      } else if (images.length > 10) {
        newErrors.images = t('createAd.validation.maxPhotosExceeded');
      } else {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.file) {
            if (!allowedTypes.includes(img.file.type)) {
              newErrors.images = t('createAd.validation.photoFormatNotAllowed', { index: i + 1 });
              break;
            }
            if (img.file.size > maxSize) {
              newErrors.images = t('createAd.validation.photoTooLarge', { index: i + 1 });
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
            newErrors.phone = t('createAd.validation.phoneRequiredForBoost');
          } else if (formData.phone.length < 10) {
            newErrors.phone = t('createAd.validation.invalidPhoneNumber');
          }
          if (!formData.payment_method) {
            newErrors.payment_method = t('createAd.validation.paymentMethodRequired');
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

    logger.log('Début soumission formulaire');

    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4)
    };

    if (Object.keys(allErrors).length > 0) {
      logger.log('Validation échouée - Arrêt soumission');
      setErrors(allErrors);
      return;
    }

    logger.log('Validation réussie - Lancement création annonce');

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

      logger.log('Envoi des données...');
      const result = await adsService.createAd(formDataToSend);
      logger.log('Réponse API reçue:', result);

      if (result.status === 'success') {
        // Ad created successfully without payment
        showToast({
          type: 'success',
          title: t('toast.success'),
          message: t('toast.adCreated')
        });
        navigate('/profile');
      } else if (result.status === 'payment_pending') {
        // Check if required data exists - be more flexible
        const adId = result.adId || result.ad_id || result.id || result.ad?.id;
        const paymentInfo = result.payment_info || result.paymentInfo;

        logger.log('Payment pending - extracted data:', { adId, paymentInfo, fullResult: result });

        // Show payment modal even if adId is missing (we mainly need paymentInfo)
        setPaymentModal({
          show: true,
          paymentInfo: paymentInfo || {},
          adId: adId || null
        });
      } else {
        // Handle unexpected status
        const errorMsg = result.message || t('errors.somethingWentWrong');
        setErrors({ submit: translateApiError(errorMsg, t) });
      }
    } catch (err) {
      logger.error('Erreur création annonce:', err);
      const errorMsg = err.message || t('errors.somethingWentWrong');
      setErrors({ submit: translateApiError(errorMsg, t) });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: t('createAd.step1'), icon: Tag },
    { number: 2, title: t('createAd.step2'), icon: FaWallet },
    { number: 3, title: t('createAd.step3'), icon: MapPin },
    { number: 4, title: t('createAd.step4'), icon: Camera },
    { number: 5, title: t('createAd.step5'), icon: Zap }
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
              {t('createAd.title')}
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
                      {t('createAd.step')} {step.number}
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
                      {t('createAd.adType')}
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                    >
                      <option value="sell">{t('createAd.sell')}</option>
                      <option value="rent">{t('createAd.rent')}</option>
                    </select>
                    {errors.type && (
                      <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createAd.category')} <span className="text-red-500">*</span>
                    </label>
                    {creationLoading ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t('createAd.loadingCategories')}
                      </div>
                    ) : (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                      >
                        <option value=""></option>
                        {(translatedCategories.length > 0 ? translatedCategories : creationData.categories || []).map(category => (
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
                      {t('createAd.subcategory')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={!formData.category}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all bg-white"
                    >
                      <option value=""></option>
                      {formData.category && subcategories.length > 0 && [...(translatedSubcategories.length > 0 ? translatedSubcategories : subcategories)]
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
                      label={<span>{t('createAd.adTitle')} <span className="text-red-500">*</span></span>}
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.title.length} {t('createAd.characters')} (min. 10)
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createAd.description')} <span className="text-red-500">*</span>
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
                      {formData.description.length} {t('createAd.characters')} (min. 20)
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <Input
                      label={t('createAd.tags')}
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
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
                    label={<span>{t('createAd.price')} (in FCFA) <span className="text-red-500">*</span></span>}
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
                        {t('createAd.originalPrice')}
                        {formData.price && (
                          <span className="text-red-500 text-xs ml-2">
                            ({t('createAd.mustBeHigher')})
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('createAd.isNegotiable')}</label>
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
                      <option value="0">{t('common.no')}</option>
                      <option value="1">{t('common.yes')}</option>
                    </select>
                  </div>
                </div>
                {formData.discountPercent > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      {formData.discountPercent}% {t('createAd.discountDisplayed')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createAd.location')} <span className="text-red-500">*</span>
                  </label>
                  {creationLoading ? (
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('createAd.loadingLocations')}
                    </div>
                  ) : (
                    <select
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                    >
                      <option value=""></option>
                      {(translatedLocations.length > 0 ? translatedLocations : creationData.locations || []).map(location => (
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
                      {t('createAd.brand')} <span className="text-red-500">*</span>
                    </label>
                    {fieldsLoading ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t('createAd.loadingBrands')}
                      </div>
                  ) : (
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                      >
                        <option value=""></option>
                        {[...(translatedBrands.length > 0 ? translatedBrands : subcategoryFields.brands || [])]
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
                    <h3 className="text-lg font-medium text-gray-900">{t('createAd.technicalCharacteristics')}</h3>
                    {fieldsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        {t('createAd.loadingFilters')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subcategoryFields.filters.map(filter => (
                          filter.type === 'select' && filter.options && filter.options.length > 0 ? (
                            <TranslatedFilterSelectField
                              key={filter.id}
                              filter={filter}
                              value={formData.filters[filter.id]}
                              onChange={(filterId, value) => {
                                setFormData(prev => ({
                                  ...prev,
                                  filters: { ...prev.filters, [filterId]: value }
                                }));
                              }}
                              error={errors[`filters.${filter.id}`]}
                            />
                          ) : filter.type === 'checkbox' && filter.options && filter.options.length > 0 ? (
                            <TranslatedFilterMultiSelect
                              key={filter.id}
                              filter={filter}
                              value={formData.filters[filter.id]}
                              onChange={(filterId, value) => {
                                setFormData(prev => ({
                                  ...prev,
                                  filters: { ...prev.filters, [filterId]: value }
                                }));
                              }}
                              error={errors[`filters.${filter.id}`]}
                              Select={Select}
                            />
                          ) : filter.type === 'number' ? (
                            <div key={filter.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <TranslatedText text={filter.name} /> <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`filters.${filter.id}`}
                                value={formData.filters[filter.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, [filter.id]: value }
                                  }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                              {errors[`filters.${filter.id}`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`filters.${filter.id}`]}</p>
                              )}
                            </div>
                          ) : filter.type === 'date' ? (
                            <div key={filter.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <TranslatedText text={filter.name} /> <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                name={`filters.${filter.id}`}
                                value={formData.filters[filter.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, [filter.id]: value }
                                  }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                              {errors[`filters.${filter.id}`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`filters.${filter.id}`]}</p>
                              )}
                            </div>
                          ) : filter.type === 'text' ? (
                            <div key={filter.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <TranslatedText text={filter.name} /> <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name={`filters.${filter.id}`}
                                value={formData.filters[filter.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, [filter.id]: value }
                                  }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
                              />
                              {errors[`filters.${filter.id}`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`filters.${filter.id}`]}</p>
                              )}
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!formData.subcategory && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>{t('createAd.selectCategoryFirst')}</p>
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
                    {t('createAd.uploadPhotos')}
                  </h2>
                  <p className="text-gray-600">
                    {t('createAd.uploadPhotosHint')}
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
                      ? t('createAd.photosRequirementMet')
                      : t('createAd.morePhotosNeeded', { count: 3 - images.length })
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
                {t('createAd.previous')}
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
                {t('createAd.next')}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!canSubmit || isLoading}
                className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('createAd.publishing') : t('createAd.publish')}
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
              showToast({ type: 'success', title: t('toast.success'), message: t('toast.paymentSuccess') });
              setTimeout(() => {
                navigate('/profile/ads');
              }, 1500);
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