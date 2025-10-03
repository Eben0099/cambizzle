import { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowLeft, Store, Clock, Globe, Facebook, Instagram } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import Modal from '../ui/Modal';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [step, setStep] = useState('choice'); // 'choice', 'form', 'seller'
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, login, register, updateUser } = useAuth();

  // Stocker temporairement les données utilisateur après inscription
  const [tempUser, setTempUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    photoUrl: '',
    wantsToBeSeller: false
  });

  const [sellerData, setSellerData] = useState({
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    openingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    deliveryOptions: {
      pickup: true,
      delivery: false,
      shipping: false
    }
  });


  const resetModal = () => {
    setStep('choice');
    setMode(initialMode);
    setShowPassword(false);
    setIsLoading(false);
    setErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      photoUrl: '',
      wantsToBeSeller: false
    });
    setSellerData({
      businessName: '',
      businessDescription: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      websiteUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      openingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      deliveryOptions: {
        pickup: true,
        delivery: false,
        shipping: false
      }
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage("");

    try {
      const result = await login({
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (result.success) {
        setMessage("Connexion réussie !");
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Erreur lors de la connexion' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage("");

    // --- Validation côté frontend ---
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";
    if (!formData.password) newErrors.password = "Mot de passe requis";
    if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!formData.acceptTerms) newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // --- Appel API ---
    try {
      const result = await register(formData);

      if (result.success) {
        console.log('🎉 Inscription réussie, données reçues:', result);
        // Stocker temporairement les données utilisateur pour la création du profil vendeur
        setTempUser(result.data?.user);
        console.log('👤 tempUser défini:', result.data?.user);

        setMessage("Inscription réussie !");
        // Si l'utilisateur veut être vendeur, passe à l'étape suivante
        if (formData.wantsToBeSeller) {
          setTimeout(() => {
            setStep("seller");
          }, 1500);
        } else {
          setTimeout(() => {
            handleClose(); // fermeture du modal ou redirection
          }, 1500);
        }
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: "Erreur lors de l'inscription" });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!sellerData.businessName.trim()) newErrors.businessName = 'Nom de l\'entreprise requis';
    if (!sellerData.businessDescription.trim()) newErrors.businessDescription = 'Description de l\'entreprise requise';
    if (!sellerData.businessAddress.trim()) newErrors.businessAddress = 'Adresse de l\'entreprise requise';
    if (!sellerData.businessPhone.trim()) newErrors.businessPhone = 'Téléphone de l\'entreprise requis';
    if (!sellerData.businessEmail.trim()) newErrors.businessEmail = 'Email de l\'entreprise requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Début création profil vendeur');
      console.log('👤 user (connecté):', user);
      console.log('👤 tempUser (nouvellement créé):', tempUser);
      console.log('📊 État step:', step);

      // Utiliser l'utilisateur connecté ou celui qui vient d'être créé
      const currentUser = user || tempUser;

      console.log('🎯 currentUser sélectionné:', currentUser);

      if (!currentUser) {
        console.error('❌ ERREUR: Aucun utilisateur disponible');
        console.error('- user (connecté):', user);
        console.error('- tempUser (nouveau):', tempUser);
        throw new Error('Vous devez d\'abord créer un compte ou vous connecter pour créer un profil vendeur. Retournez à l\'étape précédente.');
      }

      console.log('👤 Utilisateur pour le profil vendeur:', currentUser);
      console.log('📋 Données sellerData brutes:', sellerData);

      // Préparer les données avec l'userId et formater correctement
      const sellerProfileData = {
        ...sellerData,
        userId: currentUser.idUser || currentUser.id,
        openingHours: JSON.stringify(sellerData.openingHours),
        deliveryOptions: JSON.stringify(sellerData.deliveryOptions)
      };

      console.log('📦 Données profil vendeur préparées:', sellerProfileData);

      const result = await authService.createSellerProfile(sellerProfileData);

      // Mettre à jour l'état d'authentification avec les données vendeur
      if (result.user) {
        updateUser(result.user);
      }

      setMessage("Profil vendeur créé avec succès !");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('❌ Erreur création profil vendeur:', error);
      console.error('🔍 Détails de l\'erreur:', error.message);

      let errorMessage = 'Erreur lors de la création du profil vendeur';

      if (error.message.includes('Token') || error.message.includes('reconnecter')) {
        errorMessage = 'Vous devez être connecté pour créer un profil vendeur. Veuillez vous reconnecter.';
      } else if (error.message.includes('compte') || error.message.includes('connecter')) {
        errorMessage = 'Vous devez d\'abord créer un compte ou vous connecter pour créer un profil vendeur.';
      } else if (error.message.includes('400') || error.message.includes('422') || error.message.includes('invalides')) {
        errorMessage = 'Données invalides. Vérifiez que tous les champs requis sont remplis.';
      } else if (error.message.includes('409') || error.message.includes('existe déjà')) {
        errorMessage = 'Un profil vendeur existe déjà pour ce compte.';
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSellerInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSellerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSellerData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSellerPhoneChange = (e) => {
    const { value } = e.target;
    setSellerData(prev => ({
      ...prev,
      businessPhone: value
    }));
    
    if (errors.businessPhone) {
      setErrors(prev => ({ ...prev, businessPhone: '' }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setSellerData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  // Ordre des jours de la semaine pour l'affichage
  const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const renderChoice = () => (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Choisissez votre méthode de {mode === 'login' ? 'connexion' : 'inscription'}
          </p>
        </div>

        {/* Social Auth Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="truncate">Continuer avec Google</span>
          </button>

          <button
            onClick={() => handleSocialAuth('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm bg-[#1877F2] text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#D6BA69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="truncate">Continuer avec Facebook</span>
          </button>

          <button
            onClick={() => setStep('form')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">Continuer avec Email</span>
          </button>
        </div>

        {/* Switch Mode */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={handleSwitchMode}
            className="text-sm sm:text-base text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors"
          >
            {mode === 'login'
              ? 'Vous n\'avez pas de compte ? S\'inscrire'
              : 'Vous avez déjà un compte ? Se connecter'
            }
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-start space-x-3">
          <button
            onClick={() => setStep('choice')}
            className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Se connecter</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Se connecter avec votre email et téléphone
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="votre@email.com"
              required
            />

            <PhoneInput
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              placeholder="+237 6 12 34 56 78"
              required
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 sm:py-4 text-sm sm:text-base"
            loading={isLoading}
            disabled={isLoading}
          >
            Se connecter
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={handleSwitchMode}
            className="text-sm sm:text-base text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors"
          >
            Vous n\'avez pas de compte ? S\'inscrire
          </button>
        </div>

        {/* Test Accounts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Comptes de test</h4>
          <div className="text-xs sm:text-sm text-blue-800 space-y-1">
            <div className="break-all">Admin : admin@cambizzle.com / +237612345678 / admin123</div>
            <div className="break-all">Vendeur : vendeur@test.com / +33612345678 / vendeur123</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-start space-x-3">
          <button
            onClick={() => setStep('choice')}
            className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Inscription</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Créez votre compte avec votre email
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="Jean"
                required
              />
              <Input
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Dupont"
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="votre@email.com"
              required
            />

            <PhoneInput
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              placeholder="+237 6 12 34 56 78"
              required
            />
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Minimum 6 caractères"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="Confirmez votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Seller Option */}
          <div className="bg-[#D6BA69]/10 border border-[#D6BA69]/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                id="wantsToBeSeller"
                name="wantsToBeSeller"
                type="checkbox"
                checked={formData.wantsToBeSeller}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded mt-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="wantsToBeSeller" className="block text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <Store className="w-4 h-4 mr-2 text-[#D6BA69] flex-shrink-0" />
                    <span>Devenir vendeur</span>
                  </div>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Créez un profil vendeur pour publier des annonces et gérer votre activité commerciale
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded mt-1 flex-shrink-0"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700 flex-1">
                J'accepte les{' '}
                <a href="#" className="text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors">
                  politique de confidentialité
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms}</p>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 sm:py-4 text-sm sm:text-base"
            loading={isLoading}
            disabled={isLoading}
          >
            {formData.wantsToBeSeller ? 'Continuer vers le profil vendeur' : 'S\'inscrire'}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={handleSwitchMode}
            className="text-sm sm:text-base text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );

  const renderSellerForm = () => (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-start space-x-3">
          <button
            onClick={() => setStep('form')}
            className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Profil Vendeur</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Complétez les informations de votre entreprise
            </p>
          </div>
        </div>

        <form onSubmit={handleSellerSubmit} className="space-y-6 sm:space-y-8">
          {/* Business Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-[#D6BA69]" />
              <h3 className="text-lg font-medium text-gray-900">Informations de l'entreprise</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nom de l'entreprise"
                name="businessName"
                value={sellerData.businessName}
                onChange={handleSellerInputChange}
                error={errors.businessName}
                placeholder="Mon Entreprise SARL"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description de l'entreprise
                </label>
                <textarea
                  name="businessDescription"
                  value={sellerData.businessDescription}
                  onChange={handleSellerInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="Décrivez votre activité, vos produits et services..."
                  required
                />
                {errors.businessDescription && (
                  <p className="text-sm text-red-600">{errors.businessDescription}</p>
                )}
              </div>

              <Input
                label="Adresse de l'entreprise"
                name="businessAddress"
                value={sellerData.businessAddress}
                onChange={handleSellerInputChange}
                error={errors.businessAddress}
                placeholder="123 Rue de la Paix, Douala"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PhoneInput
                  label="Téléphone professionnel"
                  name="businessPhone"
                  value={sellerData.businessPhone}
                  onChange={handleSellerPhoneChange}
                  error={errors.businessPhone}
                  placeholder="+237 6 12 34 56 78"
                  required
                />
                <Input
                  label="Email professionnel"
                  type="email"
                  name="businessEmail"
                  value={sellerData.businessEmail}
                  onChange={handleSellerInputChange}
                  error={errors.businessEmail}
                  placeholder="contact@monentreprise.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Online Presence Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#D6BA69]" />
              <h3 className="text-lg font-medium text-gray-900">Présence en ligne</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Site web"
                name="websiteUrl"
                value={sellerData.websiteUrl}
                onChange={handleSellerInputChange}
                placeholder="https://www.monentreprise.com"
                icon={Globe}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Page Facebook"
                  name="facebookUrl"
                  value={sellerData.facebookUrl}
                  onChange={handleSellerInputChange}
                  placeholder="https://facebook.com/monentreprise"
                  icon={Facebook}
                />
                <Input
                  label="Compte Instagram"
                  name="instagramUrl"
                  value={sellerData.instagramUrl}
                  onChange={handleSellerInputChange}
                  placeholder="https://instagram.com/monentreprise"
                  icon={Instagram}
                />
              </div>
            </div>
          </div>

          {/* Delivery Options Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Options de livraison</h3>
            <div className="space-y-3">
              {[
                { key: 'pickup', label: 'Retrait en magasin' },
                { key: 'delivery', label: 'Livraison locale' },
                { key: 'shipping', label: 'Expédition nationale' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    id={key}
                    name={`deliveryOptions.${key}`}
                    type="checkbox"
                    checked={sellerData.deliveryOptions[key]}
                    onChange={handleSellerInputChange}
                    className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
                  />
                  <label htmlFor={key} className="text-sm sm:text-base text-gray-700 flex-1">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Hours Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#D6BA69]" />
              <h3 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {weekOrder.map(day => {
                const hours = sellerData.openingHours[day];
                return (
                  <div key={day} className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                    <div className="w-full sm:w-24 text-sm font-medium text-gray-700 capitalize">
                      {day === 'monday' ? 'Lundi' :
                       day === 'tuesday' ? 'Mardi' :
                       day === 'wednesday' ? 'Mercredi' :
                       day === 'thursday' ? 'Jeudi' :
                       day === 'friday' ? 'Vendredi' :
                       day === 'saturday' ? 'Samedi' : 'Dimanche'}
                    </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                      className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded flex-shrink-0"
                    />
                    {!hours.closed ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20"
                        />
                        <span className="text-gray-500 text-sm">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 sm:flex-initial sm:w-20"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Fermé</span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 sm:py-4 text-sm sm:text-base"
            loading={isLoading}
            disabled={isLoading}
          >
            Créer mon compte vendeur
          </Button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    if (step === 'choice') {
      return renderChoice();
    } else if (step === 'seller') {
      return renderSellerForm();
    } else if (mode === 'login') {
      return renderLoginForm();
    } else {
      return renderRegisterForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default AuthModal;