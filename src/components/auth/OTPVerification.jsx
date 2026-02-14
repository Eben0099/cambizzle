import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Phone, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../toast/useToast';
import OTPInput from './OTPInput';
import Button from '../ui/Button';

/**
 * OTPVerification Component
 * Handles the complete OTP verification flow for registration and password reset
 */
const OTPVerification = ({
  phone,
  purpose = 'registration', // 'registration' | 'password_reset'
  onVerified,
  onBack,
  onError,
  autoSend = true
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Start in 'input' state if autoSend is false (OTP already sent), otherwise 'sending'
  const [step, setStep] = useState(autoSend ? 'sending' : 'input'); // 'sending' | 'input' | 'verified' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [resendCooldown, setResendCooldown] = useState(300); // Default 5 min cooldown when OTP already sent
  const [channel, setChannel] = useState('whatsapp');

  // Send OTP on mount if autoSend is true
  useEffect(() => {
    if (autoSend && phone) {
      handleSendOTP();
    }
  }, [autoSend, phone]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError(null);
    setStep('sending');

    try {
      const response = await authService.sendOTP(phone, purpose);

      if (response.success) {
        setChannel(response.data?.channel || 'whatsapp');
        setResendCooldown(response.data?.expires_in_minutes ? response.data.expires_in_minutes * 60 : 300);
        setStep('input');
        setAttemptsRemaining(3);

        showToast({
          type: 'success',
          title: t('otp.codeSent'),
          message: t('otp.codeSentTo', { phone: formatPhone(phone) })
        });
      }
    } catch (err) {
      if (err.retryAfter) {
        setResendCooldown(err.retryAfter);
        setStep('input');
        setError(err.message);
      } else {
        setStep('error');
        setError(err.message);
        onError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOTP(phone, code, purpose);

      if (response.success) {
        setStep('verified');
        showToast({
          type: 'success',
          title: t('otp.verified'),
          message: t('otp.verifiedSuccess')
        });

        // Small delay before callback to show success state
        setTimeout(() => {
          onVerified?.(code);
        }, 1000);
      }
    } catch (err) {
      setError(err.message);

      if (err.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.attemptsRemaining);

        if (err.attemptsRemaining === 0) {
          // Blocked - need to resend
          setError(t('otp.tooManyAttempts'));
          setResendCooldown(0); // Allow immediate resend
        }
      }

      showToast({
        type: 'error',
        title: t('otp.verificationFailed'),
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    await handleSendOTP();
  };

  const formatPhone = (phoneNumber) => {
    // Mask middle digits for privacy
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return phoneNumber.slice(0, 6) + '****' + phoneNumber.slice(-2);
    }
    return phoneNumber;
  };

  // Sending state
  if (step === 'sending') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#D6BA69]/10 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#D6BA69] border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('otp.sendingCode')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('otp.sendingTo', { phone: formatPhone(phone) })}
        </p>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('otp.sendFailed')}
        </h3>
        <p className="text-sm text-red-600 mb-6">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <Button
            onClick={handleSendOTP}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  // Verified state
  if (step === 'verified') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('otp.verified')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('otp.redirecting')}
        </p>
      </div>
    );
  }

  // Input state (main)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#D6BA69]/10 rounded-full flex items-center justify-center">
          {channel === 'whatsapp' ? (
            <MessageSquare className="w-8 h-8 text-[#25D366]" />
          ) : (
            <Phone className="w-8 h-8 text-[#D6BA69]" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('otp.enterCode')}
        </h3>

        <p className="text-sm text-gray-600">
          {channel === 'whatsapp'
            ? t('otp.sentViaWhatsApp', { phone: formatPhone(phone) })
            : t('otp.sentViaSMS', { phone: formatPhone(phone) })
          }
        </p>
      </div>

      {/* OTP Input */}
      <OTPInput
        length={6}
        onComplete={handleVerifyOTP}
        onResend={handleResend}
        isLoading={isLoading}
        error={error}
        attemptsRemaining={attemptsRemaining}
        resendCooldown={resendCooldown}
        disabled={isLoading}
      />

      {/* Back button */}
      {onBack && (
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#D6BA69] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('otp.changeNumber')}
          </button>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
