import { useState, useEffect } from 'react';
import { X, Zap, CreditCard, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Button from '../ui/Button';
import boostService from '../../services/boostService';

const BoostAdModal = ({ isOpen, onClose, ad, user }) => {
  const [promotionPacks, setPromotionPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('mtn_mobile_money');
  const [loading, setLoading] = useState(false);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState('select'); // 'select', 'payment', 'processing', 'success', 'failed'
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollingMessage, setPollingMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPromotionPacks();
    }
  }, [isOpen]);

  const loadPromotionPacks = async () => {
    setLoadingPacks(true);
    setError(null);
    try {
      console.log('🔄 Step 1: Fetching promotion packs from API...');
      const response = await boostService.getPromotionPacks();
      console.log('✅ Step 1 Complete: Promotion packs received:', response);
      
      // Extract packs from different possible response structures
      const packs = response.data || response.packs || response || [];
      console.log('📦 Extracted packs:', packs);
      
      if (Array.isArray(packs) && packs.length > 0) {
        setPromotionPacks(packs);
        console.log(`✅ ${packs.length} promotion pack(s) loaded successfully`);
      } else {
        console.warn('⚠️ No promotion packs found in response');
        setPromotionPacks([]);
      }
    } catch (err) {
      console.error('❌ Step 1 Failed: Error loading promotion packs:', err);
      setError(err.message || 'Failed to load promotion packs');
    } finally {
      setLoadingPacks(false);
    }
  };

  const handleSelectPack = (pack) => {
    console.log('🎯 User selected pack:', pack);
    setSelectedPack(pack);
    setError(null);
  };

  const handleBoost = async () => {
    if (!selectedPack) {
      setError('Please select a promotion pack');
      return;
    }

    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    // Get user ID
    const userId = user?.idUser || user?.id || user?._id;
    if (!userId) {
      setError('User ID is missing. Please reconnect.');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const boostData = {
        user_id: userId,
        pack_id: selectedPack.id,
        phone: phone,
        payment_method: paymentMethod
      };

      console.log('🚀 Initiating boost for ad:', ad.slug, boostData);
      const response = await boostService.boostExistingAd(ad.slug, boostData);
      
      setPollingMessage(response.message || 'Payment initiated. Waiting for confirmation...');
      
      // Get payment ID from response
      const paymentIdFromResponse = response.payment_id || response.data?.payment_id || response.paymentId;
      
      if (!paymentIdFromResponse) {
        throw new Error('Payment ID not received from server');
      }

      setPaymentId(paymentIdFromResponse);
      
      // Start polling for payment status
      try {
        await boostService.pollPaymentStatus(
          paymentIdFromResponse,
          (statusResult) => {
            setPaymentStatus(statusResult);
            setPollingMessage(statusResult.message || 'Checking payment status...');
          },
          5 * 60 * 1000 // 5 minutes timeout
        );
        
        // Payment successful
        setStep('success');
        setSuccess('Ad boosted successfully! Your ad is now promoted.');
        
        // Wait 2 seconds before closing
        setTimeout(() => {
          onClose();
          // Refresh the page or update the ad in the parent component
          if (window.location.pathname.includes('/profile')) {
            window.location.reload();
          }
        }, 2000);
        
      } catch (pollError) {
        setStep('failed');
        setError(pollError.message || 'Payment verification failed. Please check your payment status.');
      }
      
    } catch (err) {
      setStep('failed');
      setError(err.message || 'Failed to boost ad');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    setStep('select');
    setError(null);
    setPaymentId(null);
    setPaymentStatus(null);
    setPollingMessage('');
  };

  const handleClose = () => {
    if (step === 'processing') {
      if (!confirm('Payment is being processed. Are you sure you want to close?')) {
        return;
      }
    }
    setStep('select');
    setSelectedPack(null);
    setError(null);
    setSuccess(null);
    setPaymentId(null);
    setPaymentStatus(null);
    setPollingMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-[#D6BA69] mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Boost Your Ad</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Ad info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1">{ad?.title}</h3>
            <p className="text-sm text-gray-600">Slug: {ad?.slug}</p>
          </div>

          {/* Step: Select Pack */}
          {step === 'select' && (
            <>
              {loadingPacks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-[#D6BA69] animate-spin" />
                  <span className="ml-3 text-gray-600">Loading promotion packs...</span>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Promotion Pack</h3>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {promotionPacks.map((pack) => (
                      <div
                        key={pack.id}
                        onClick={() => handleSelectPack(pack)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPack?.id === pack.id
                            ? 'border-[#D6BA69] bg-[#D6BA69]/5 shadow-md'
                            : 'border-gray-200 hover:border-[#D6BA69]/50 hover:shadow'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{pack.name}</h4>
                            <span className="text-xs text-gray-500">Type: {pack.type || 'boost'}</span>
                          </div>
                          <span className="text-lg font-bold text-[#D6BA69]">{pack.price} FCFA</span>
                        </div>
                        {pack.description && (
                          <p className="text-sm text-gray-600 mb-3">{pack.description}</p>
                        )}
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="font-medium">Duration: {pack.duration_days} days</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            <span>Active: {pack.is_active ? 'Yes' : 'No'}</span>
                          </div>
                          {pack.features && (
                            <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                              <p className="font-semibold text-gray-700">Features:</p>
                              {pack.features.split(',').map((feature, idx) => (
                                <div key={idx} className="flex items-start">
                                  <CheckCircle className="w-3 h-3 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature.trim()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedPack?.id === pack.id && (
                          <div className="mt-3 pt-3 border-t border-[#D6BA69]">
                            <p className="text-xs text-[#D6BA69] font-semibold">✓ Selected</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {promotionPacks.length === 0 && !loadingPacks && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No promotion packs available at the moment.</p>
                      <Button
                        onClick={loadPromotionPacks}
                        variant="outline"
                        className="mt-4"
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Payment details */}
                  {selectedPack && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method *
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-transparent"
                        >
                          <option value="mtn_mobile_money">MTN Mobile Money</option>
                          <option value="orange_money">Orange Money</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div>
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <span className="ml-2 text-xl font-bold text-gray-900">{selectedPack.price} FCFA</span>
                        </div>
                        <Button
                          onClick={handleBoost}
                          disabled={loading || !selectedPack || !phone}
                          className="bg-[#D6BA69] hover:bg-[#C5A952] text-black"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Boost Now
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-4">{pollingMessage}</p>
              {paymentStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-700">
                    {paymentStatus.message || 'Checking payment status...'}
                  </p>
                  {paymentStatus.data?.status && (
                    <p className="text-xs text-blue-600 mt-1">
                      Status: {paymentStatus.data.status}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Please complete the payment on your phone. This may take a few minutes.
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Boost Successful!</h3>
              <p className="text-gray-600 mb-4">{success}</p>
              <p className="text-sm text-gray-500">
                Your ad is now promoted and will appear at the top of search results.
              </p>
            </div>
          )}

          {/* Step: Failed */}
          {step === 'failed' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={handleRetryPayment}
                  className="bg-[#D6BA69] hover:bg-[#C5A952] text-black"
                >
                  Retry Payment
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoostAdModal;
