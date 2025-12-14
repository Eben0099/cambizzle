import { useState, useEffect } from 'react';
import { Zap, Check } from 'lucide-react';
import { adsService } from '../services/adsService';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const StepBoostPlan = ({ formData, setFormData, errors, setErrors }) => {
  const [boostPlans, setBoostPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadBoostPlans();
  }, []);

  const loadBoostPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const response = await adsService.getPromotionPacks();
      console.log('📡 Réponse API plans boost:', response);
      
      let plans = [];
      
      // Gérer différents formats de réponse
      if (Array.isArray(response)) {
        plans = response;
      } else if (response.data && Array.isArray(response.data)) {
        plans = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si c'est un objet unique, le convertir en tableau
        plans = [response.data];
      } else if (typeof response === 'object' && response.id) {
        // Si la réponse directe est un objet plan
        plans = [response];
      }
      
      // Adapter la structure des données
      const adaptedPlans = plans.map(plan => ({
        id: parseInt(plan.id),
        name: plan.name,
        price: parseFloat(plan.price) || 0,
        duration_days: parseInt(plan.durationDays || plan.duration_days) || 0,
        description: plan.description
      }));
      
      console.log('🔧 Plans adaptés:', adaptedPlans);
      
      setBoostPlans([{ id: null, name: 'No boost', price: 0, duration_days: 0, description: 'Publish without boost' }, ...adaptedPlans]);
    } catch (error) {
      console.error('Erreur chargement plans boost:', error);
      // Still allow continuing without boost
      setBoostPlans([{ id: null, name: 'No boost', price: 0, duration_days: 0, description: 'Publish without boost' }]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      boost_plan_id: plan.id,
      selectedPlan: plan
    }));

    // Clear any boost-related errors
    if (errors.boost_plan_id) {
      setErrors(prev => ({ ...prev, boost_plan_id: '' }));
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D6BA69]"></div>
          <span className="ml-3 text-gray-600">Loading boost plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Boost Your Ad</h2>
        <p className="text-gray-600">Choose a boost plan to increase visibility of your ad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boostPlans.map((plan) => (
          <div
            key={plan.id || 'no-boost'}
            onClick={() => handlePlanSelect(plan)}
            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-[#D6BA69] bg-[#D6BA69]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedPlan?.id === plan.id && (
              <div className="absolute -top-2 -right-2 bg-[#D6BA69] rounded-full p-1">
                <Check className="w-4 h-4 text-black" />
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <Zap className={`w-5 h-5 ${plan.price > 0 ? 'text-[#D6BA69]' : 'text-gray-400'}`} />
                <span className="ml-2 font-medium text-gray-900">{plan.name}</span>
              </div>
              <div className="text-right">
                {plan.price > 0 ? (
                  <span className="text-lg font-bold text-[#D6BA69]">
                    {plan.price.toLocaleString('fr-FR')} XAF
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Free</span>
                )}
              </div>
            </div>

            {plan.duration_days > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                {plan.duration_days} days visibility
              </p>
            )}

            <p className="text-sm text-gray-700">{plan.description}</p>
          </div>
        ))}
      </div>

      {selectedPlan && selectedPlan.price > 0 && (
        <div className="mt-6 p-4 bg-[#D6BA69]/10 rounded-lg border border-[#D6BA69]/20">
          <h3 className="font-medium text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="CM"
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                className="w-full"
                style={{
                  border: '1px solid #D6BA69',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'white',
                  transition: 'all 0.2s'
                }}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full border border-[#D6BA69] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] transition-all bg-white"
              >
                <option value="mtn_mobile_money">MTN Mobile Money</option>
                <option value="orange_money">Orange Money</option>
              </select>
              {errors.payment_method && (
                <p className="text-sm text-red-600 mt-1">{errors.payment_method}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            For paid boosts, you'll need to provide your phone number for mobile payment after submission.
          </p>
        </div>
      )}

      {errors.boost_plan_id && (
        <p className="text-sm text-red-600 mt-4">{errors.boost_plan_id}</p>
      )}
    </div>
  );
};

export default StepBoostPlan;