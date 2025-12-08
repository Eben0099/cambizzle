import { useState, useEffect, useRef } from 'react';
import { X, Clock, CheckCircle, XCircle, Phone } from 'lucide-react';
import { adsService } from '../services/adsService';

const PaymentModal = ({ paymentInfo, adId, onClose, onSuccess, onFailure }) => {
  const [status, setStatus] = useState('waiting'); // waiting, success, failed, timeout
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const pollingIntervalIdRef = useRef(null);
  const timerIntervalIdRef = useRef(null);

  useEffect(() => {
    console.log('🔄 PaymentModal useEffect - adId:', adId, 'paymentInfo:', paymentInfo);
    if (paymentInfo && Object.keys(paymentInfo).length > 0) {
      console.log('🚀 Starting payment polling and timer...');
      startPolling();
      startTimer();
    } else {
      console.log('❌ No paymentInfo provided, skipping polling');
    }
    return () => {
      if (pollingIntervalIdRef.current) {
        console.log('🛑 Clearing polling interval');
        clearInterval(pollingIntervalIdRef.current);
      }
      if (timerIntervalIdRef.current) {
        console.log('🛑 Clearing timer interval');
        clearInterval(timerIntervalIdRef.current);
      }
    };
  }, [paymentInfo]);

  const startTimer = () => {
    console.log('⏱️ Starting real-time countdown timer');
    // Clear any existing timer
    if (timerIntervalIdRef.current) {
      clearInterval(timerIntervalIdRef.current);
    }
    const id = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        console.log('⏱️ Countdown:', formatTime(newTime));
        if (newTime <= 0) {
          console.log('⏰ Timeout reached!');
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
    console.log('🎯 startPolling called with paymentInfo:', paymentInfo);
    console.log('🔍 paymentInfo keys:', Object.keys(paymentInfo || {}));
    console.log('🔍 paymentInfo values:', paymentInfo);

    // Prioritize paymentId over reference
    const paymentId = paymentInfo?.paymentId || paymentInfo?.id || paymentInfo?.reference;
    console.log('🔍 Extracted paymentId:', paymentId, 'from field priority: paymentId -> id -> reference');

    if (!paymentId) {
      console.error('❌ Payment ID not found in paymentInfo. Available fields:', paymentInfo);
      setStatus('failed');
      return;
    }

    console.log('✅ Using paymentId for API call:', paymentId);
    console.log('⏰ Starting polling every 15 seconds for paymentId:', paymentId);
    
    // Clear any existing polling
    if (pollingIntervalIdRef.current) {
      clearInterval(pollingIntervalIdRef.current);
    }
    
    const id = setInterval(async () => {
      try {
        const response = await adsService.checkPaymentStatus(paymentId);
        console.log('📡 Backend response:', response);

        if (response.status === 'payment_success' || response.status === 'success' || response.status === 'paid') {
          console.log('✅ Payment successful!');
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
          console.log('❌ Payment failed!');
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
          console.log('📝 Ad published!');
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
          console.log('⏳ Payment still pending, status:', response.status);
        }
        // Continue polling for other statuses like 'pending', 'processing', etc.
      } catch (error) {
        console.error('❌ Error during payment check:', error);
      }
    }, 15000); // 15 seconds interval

    pollingIntervalIdRef.current = id;
    console.log('✅ Polling started with interval ID:', id);
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
    if (intervalId) clearInterval(intervalId);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {status === 'success' ? 'Payment Successful!' : 'Complete Payment'}
            </h2>
            {status !== 'success' && (
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
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
                  Payment in Progress
                </h3>
                <p className="text-gray-600 mb-4">
                  Please complete the payment using the instructions below
                  {!adId && <span className="block text-sm text-orange-600 mt-2">(Ad ID not available - payment tracking may be limited)</span>}
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center mb-3">
                  <Phone className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Payment Instructions</span>
                </div>
                {paymentInfo ? (
                  <>
                    <p className="text-sm text-gray-700 mb-2">
                      {paymentInfo.instructions}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>USSD Code:</strong> {paymentInfo.ussd_code}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Amount:</strong> {paymentInfo.amount} {paymentInfo.currency}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> {paymentInfo.reference}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-700">
                    Loading payment instructions...
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Time remaining</p>
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
                Payment Confirmed!
              </h3>
              <p className="text-gray-600">
                Your ad has been published successfully.
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                The payment could not be processed. Please try again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-[#D6BA69] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#D6BA69]/90"
                >
                  Try Again
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {status === 'timeout' && (
            <div className="text-center">
              <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Timeout
              </h3>
              <p className="text-gray-600 mb-6">
                Payment confirmation is taking longer than expected. Please check your account or contact support.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-[#D6BA69] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#D6BA69]/90"
                >
                  Check My Ads
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
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