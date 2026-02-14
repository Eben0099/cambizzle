import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useToast } from '../components/toast/useToast';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('phone'); // 'phone' | 'reset' | 'success'
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // OTP input refs
  const otpInputRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format phone for display (masked)
  const formatPhoneDisplay = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return phoneNumber.slice(0, 6) + '****' + phoneNumber.slice(-2);
    }
    return phoneNumber;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtpCode(newOtp);
      // Focus last filled input or first empty
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!phone) {
      setErrors({ phone: t('auth.phoneRequired') });
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setErrors({ phone: t('auth.invalidPhone') });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.requestPasswordResetOTP(phone, 'whatsapp');
      setResendCooldown(response.data?.expires_in_minutes ? response.data.expires_in_minutes * 60 : 300);
      setStep('reset');
      showToast({
        type: 'success',
        title: t('otp.codeSent'),
        message: t('otp.codeSentTo', { phone: formatPhoneDisplay(phone) })
      });
    } catch (error) {
      if (error.code === 'ACCOUNT_NOT_FOUND') {
        setErrors({ phone: t('auth.accountNotFound') });
      } else {
        showToast({
          type: 'error',
          title: t('toast.error'),
          message: error.message || t('auth.errorDuringPasswordReset')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const response = await authService.requestPasswordResetOTP(phone, 'whatsapp');
      setResendCooldown(response.data?.expires_in_minutes ? response.data.expires_in_minutes * 60 : 300);
      setAttemptsRemaining(3);
      setOtpCode(['', '', '', '', '', '']);
      showToast({
        type: 'success',
        title: t('otp.codeSent'),
        message: t('otp.newCodeSent')
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: t('toast.error'),
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrors({});

    const code = otpCode.join('');
    let hasError = false;
    const newErrors = {};

    // Validate OTP
    if (code.length !== 6) {
      newErrors.otp = t('otp.enterFullCode') || 'Please enter the complete 6-digit code';
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
      await authService.resetPasswordWithOTP(phone, code, newPassword);
      setStep('success');
      showToast({
        type: 'success',
        title: t('auth.success'),
        message: t('auth.passwordResetSuccess')
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      // Handle attempts remaining
      if (error.attemptsRemaining !== undefined) {
        setAttemptsRemaining(error.attemptsRemaining);
        if (error.attemptsRemaining === 0) {
          setErrors({ otp: t('otp.tooManyAttempts') });
          setResendCooldown(0); // Allow immediate resend
        } else {
          setErrors({ otp: error.message });
        }
      } else {
        showToast({
          type: 'error',
          title: t('toast.error'),
          message: error.message || t('auth.errorDuringPasswordReset')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to phone step
  const handleBackToPhone = () => {
    setStep('phone');
    setOtpCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setAttemptsRemaining(3);
  };

  // Format cooldown time
  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-8 h-8 text-white" />
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

  // Reset step (OTP + new password)
  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12" data-wg-notranslate="true">
        <div className="w-full max-w-md">
          {/* Logo */}
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
              {t('auth.enterNewPassword')}
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur shadow-xl border-0 rounded-3xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* Channel indicator */}
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  <span className="text-sm text-gray-600">
                    {t('otp.sentViaWhatsApp', { phone: formatPhoneDisplay(phone) })}
                  </span>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    {t('otp.enterCode')}
                  </label>
                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2
                          ${errors.otp ? 'border-red-500' : 'border-gray-300'}
                          focus:border-[#D6BA69] focus:outline-none focus:ring-2 focus:ring-[#D6BA69]/20
                          transition-all`}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
                  )}
                  {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                    <p className="mt-2 text-sm text-amber-600 text-center">
                      {t('otp.attemptsRemaining', { count: attemptsRemaining })}
                    </p>
                  )}
                </div>

                {/* Resend link */}
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-sm text-gray-500">
                      {t('otp.resendIn')} <span className="font-medium">{formatCooldown(resendCooldown)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-[#D6BA69] hover:text-[#C5A952] font-medium transition-colors"
                    >
                      {t('otp.resendCode')}
                    </button>
                  )}
                </div>

                <hr className="border-gray-200" />

                {/* New Password */}
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
                      disabled={isLoading}
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

                {/* Confirm Password */}
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
                      disabled={isLoading}
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

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#D6BA69] hover:bg-[#c5a55d] text-black font-semibold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-100 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('common.loading')}
                    </span>
                  ) : (
                    t('auth.resetPassword')
                  )}
                </Button>

                {/* Back link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#D6BA69] transition"
                  >
                    <ArrowLeft size={16} />
                    {t('otp.changeNumber')}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Phone input step (initial)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12" data-wg-notranslate="true">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Form Card */}
        <Card className="bg-white/90 backdrop-blur shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {/* Info box */}
              <div className="flex items-start gap-3 p-4 bg-[#25D366]/10 rounded-xl text-[#25D366]">
                <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  {t('auth.otpResetInfoWhatsApp') || t('auth.otpResetInfo')}
                </p>
              </div>

              {/* Phone field */}
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
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D6BA69] hover:bg-[#c5a55d] text-black font-semibold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  t('otp.sendCode')
                )}
              </Button>
            </form>

            {/* Back link */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-[#D6BA69] hover:text-[#C5A952] transition"
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
