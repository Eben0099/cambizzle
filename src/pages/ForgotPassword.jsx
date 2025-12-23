import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useToast } from '../components/toast/useToast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { API_BASE_URL } from '../config/api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let hasError = false;
    const newErrors = {};

    // Validate phone
    if (!phone) {
      newErrors.phone = t('auth.phoneRequired');
      hasError = true;
    } else if (!isValidPhoneNumber(phone)) {
      newErrors.phone = t('auth.invalidPhone');
      hasError = true;
    }

    // Validate password
    if (!newPassword) {
      newErrors.newPassword = t('auth.passwordRequired');
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('auth.passwordMin6');
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        showToast({
          type: 'success',
          title: t('auth.success'),
          message: t('auth.passwordResetSuccess')
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.message || t('auth.errorDuringPasswordReset'));
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: t('toast.error'),
        message: error.message || t('auth.errorDuringPasswordReset')
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.passwordResetSuccess')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('auth.redirectingToLogin')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12" data-wg-notranslate="true">
      <div className="w-full max-w-md">
        {/* Logo + Nom */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#D6BA69] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-black">C</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              Cambizzle
            </span>
          </Link>

          <h1 className="mt-8 text-2xl font-bold text-gray-900">
            {t('auth.resetPassword')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        {/* Card du formulaire */}
        <Card className="bg-white/90 backdrop-blur shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')}
                </label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="CM"
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  className={`phone-input-custom ${errors.phone ? 'error' : ''}`}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.newPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#D6BA69]'
                    } focus:outline-none focus:ring-2 focus:ring-[#D6BA69]/20 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#D6BA69]'
                    } focus:outline-none focus:ring-2 focus:ring-[#D6BA69]/20 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Bouton principal */}
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full bg-[#D6BA69] hover:bg-[#c5a55d] text-black font-semibold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-100"
              >
                {isLoading ? t('common.loading') : t('auth.resetPassword')}
              </Button>
            </form>

            {/* Lien retour */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#D6BA69] transition"
              >
                <ArrowLeft size={16} />
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
