import { useState, useEffect, useRef } from 'react';
import { X, Clock, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adsService } from '../services/adsService';
import logger from '../utils/logger';

const PaymentModal = ({ paymentInfo, adId, onClose, onSuccess, onFailure }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('waiting'); // waiting, success, failed, timeout
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const pollingIntervalIdRef = useRef(null);
  const timerIntervalIdRef = useRef(null);

  useEffect(() => {
    logger.log('PaymentModal useEffect - adId:', adId, 'paymentInfo:', paymentInfo);
    if (paymentInfo && Object.keys(paymentInfo).length > 0) {
      logger.log('Starting payment polling and timer...');
      startPolling();
      startTimer();
    } else {
      logger.log('No paymentInfo provided, skipping polling');
    }
    return () => {
      if (pollingIntervalIdRef.current) {
        logger.log('Clearing polling interval');
        clearInterval(pollingIntervalIdRef.current);
      }
      if (timerIntervalIdRef.current) {
        logger.log('Clearing timer interval');
        clearInterval(timerIntervalIdRef.current);
      }
    };
  }, [paymentInfo]);

  const startTimer = () => {
    logger.log('Starting real-time countdown timer');
    // Clear any existing timer
    if (timerIntervalIdRef.current) {
      clearInterval(timerIntervalIdRef.current);
    }
    const id = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          logger.log('Timeout reached!');
          setStatus('timeout');
          if (timerIntervalIdRef.current) {
            clearInterval(timerIntervalIdRef.current);
            timerIntervalIdRef.current = null;
          }
          return 0;
        }
        return newTime;
      });
    }, 1000); // Update every second
    timerIntervalIdRef.current = id;
  };

  const startPolling = () => {
    logger.log('startPolling called with paymentInfo:', paymentInfo);
    logger.debug('paymentInfo keys:', Object.keys(paymentInfo || {}));

    // Prioritize paymentId over reference
    const paymentId = paymentInfo?.paymentId || paymentInfo?.id || paymentInfo?.reference;
    logger.log('Extracted paymentId:', paymentId);

    if (!paymentId) {
      logger.error('Payment ID not found in paymentInfo. Available fields:', paymentInfo);
      setStatus('failed');
      return;
    }

    logger.log('Starting polling every 15 seconds for paymentId:', paymentId);

    // Clear any existing polling
    if (pollingIntervalIdRef.current) {
      clearInterval(pollingIntervalIdRef.current);
    }

    const id = setInterval(async () => {
      try {
        const response = await adsService.checkPaymentStatus(paymentId);
        logger.log('Backend response:', response);

        if (response.status === 'payment_success' || response.status === 'success' || response.status === 'paid') {
          logger.log('Payment successful!');
          setStatus('success');
          if (pollingIntervalIdRef.current) {
            clearInterval(pollingIntervalIdRef.current);
            pollingIntervalIdRef.current = null;
          }
          if (timerIntervalIdRef.current) {
            clearInterval(timerIntervalIdRef.current);
            timerIntervalIdRef.current = null;
          }
          setTimeout(() => {
            onSuccess && onSuccess();
          }, 2000);
        } else if (response.status === 'payment_failed' || response.status === 'failed') {
          logger.log('Payment failed!');
          setStatus('failed');
          if (pollingIntervalIdRef.current) {
            clearInterval(pollingIntervalIdRef.current);
            pollingIntervalIdRef.current = null;
          }
          if (timerIntervalIdRef.current) {
            clearInterval(timerIntervalIdRef.current);
            timerIntervalIdRef.current = null;
          }
          onFailure && onFailure();
        } else if (response.status === 'published') {
          logger.log('Ad published!');
          setStatus('success');
          if (pollingIntervalIdRef.current) {
            clearInterval(pollingIntervalIdRef.current);
            pollingIntervalIdRef.current = null;
          }
          if (timerIntervalIdRef.current) {
            clearInterval(timerIntervalIdRef.current);
            timerIntervalIdRef.current = null;
          }
          setTimeout(() => {
            onSuccess && onSuccess();
          }, 2000);
        } else {
          logger.log('Payment still pending, status:', response.status);
        }
        // Continue polling for other statuses like 'pending', 'processing', etc.
      } catch (error) {
        logger.error('Error during payment check:', error);
      }
    }, 15000); // 15 seconds interval

    pollingIntervalIdRef.current = id;
    logger.log('Polling started with interval ID:', id);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    // Reset and restart polling
    setStatus('waiting');
    setTimeLeft(120);
    startPolling();
  };

  const handleCancel = () => {
    if (pollingIntervalIdRef.current) clearInterval(pollingIntervalIdRef.current);
    if (timerIntervalIdRef.current) clearInterval(timerIntervalIdRef.current);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" data-wg-notranslate="true">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {status === 'success' ? t('payment.paymentSuccessful') : t('payment.completePayment')}
            </h2>
            {status !== 'success' && (
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Content based on status */}
          {status === 'waiting' && (
            <div className="text-center">
              <div className="mb-6">
                <Clock className="w-16 h-16 text-[#D6BA69] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('payment.paymentInProgress')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('payment.completePaymentInstructions')}
                  {!adId && <span className="block text-sm text-orange-600 mt-2">({t('payment.adIdNotAvailable')})</span>}
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center mb-3">
                  <Phone className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">{t('payment.paymentInstructions')}</span>
                </div>
                {paymentInfo ? (
                  <>
                    <p className="text-sm text-gray-700 mb-2">
                      {paymentInfo.instructions}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>{t('payment.ussdCode')}:</strong> {paymentInfo.ussd_code}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>{t('payment.amount')}:</strong> {paymentInfo.amount} {paymentInfo.currency}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>{t('payment.reference')}:</strong> {paymentInfo.reference}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-700">
                    {t('payment.loadingInstructions')}
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{t('payment.timeRemaining')}</p>
                <div className="text-2xl font-mono font-bold text-[#D6BA69]">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('payment.paymentConfirmed')}
              </h3>
              <p className="text-gray-600">
                {t('payment.adPublishedSuccessfully')}
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('payment.paymentFailed')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('payment.paymentFailedMessage')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-[#D6BA69] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#D6BA69]/90 cursor-pointer"
                >
                  {t('payment.tryAgain')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {status === 'timeout' && (
            <div className="text-center">
              <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('payment.paymentTimeout')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('payment.paymentTimeoutMessage')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-[#D6BA69] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#D6BA69]/90 cursor-pointer"
                >
                  {t('payment.checkMyAds')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
