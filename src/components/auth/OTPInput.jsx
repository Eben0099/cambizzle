import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * OTPInput Component
 * A 6-digit OTP input with individual boxes, countdown timer, and resend functionality
 */
const OTPInput = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error = null,
  attemptsRemaining = 3,
  resendCooldown = 0,
  disabled = false,
  autoFocus = true
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [timer, setTimer] = useState(resendCooldown);
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Countdown timer
  useEffect(() => {
    setTimer(resendCooldown);
  }, [resendCooldown]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Clear OTP when error changes (for retry)
  useEffect(() => {
    if (error) {
      setOtp(new Array(length).fill(''));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [error, length]);

  const handleChange = (element, index) => {
    const value = element.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste of multiple digits
    if (value.length > 1) {
      const digits = value.slice(0, length - index).split('');
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus on next empty or last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }

      // Check if complete
      if (newOtp.every(d => d !== '')) {
        onComplete?.(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (newOtp.every(d => d !== '')) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split('').forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Focus on appropriate input
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();

      // Check if complete
      if (newOtp.every(d => d !== '')) {
        onComplete?.(newOtp.join(''));
      }
    }
  };

  const handleResend = () => {
    if (timer === 0 && !isLoading) {
      setOtp(new Array(length).fill(''));
      onResend?.();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={length}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled || isLoading}
            className={`
              w-10 h-12 sm:w-12 sm:h-14
              text-center text-xl sm:text-2xl font-bold
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${error
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : digit
                  ? 'border-[#D6BA69] focus:ring-[#D6BA69] bg-[#D6BA69]/5'
                  : 'border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]'
              }
              ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}
            `}
            aria-label={`${t('otp.digit')} ${index + 1}`}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-[#D6BA69] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{t('otp.verifying')}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          {attemptsRemaining > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {t('otp.attemptsRemaining', { count: attemptsRemaining })}
            </p>
          )}
        </div>
      )}

      {/* Resend section */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          {t('otp.didntReceive')}
        </p>

        {timer > 0 ? (
          <p className="text-sm text-gray-500">
            {t('otp.resendIn')} <span className="font-semibold text-[#D6BA69]">{formatTime(timer)}</span>
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={isLoading || disabled}
            className="text-[#D6BA69] hover:text-[#C5A952] hover:bg-[#D6BA69]/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('otp.resendCode')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OTPInput;
