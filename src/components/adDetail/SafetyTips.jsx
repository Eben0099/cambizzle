import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, Eye, CreditCard, Users } from 'lucide-react';

const SafetyTips = () => {
  const { t } = useTranslation();

  const tips = [
    {
      icon: Users,
      textKey: "adDetail.safetyTip1",
      color: "text-green-600"
    },
    {
      icon: Eye,
      textKey: "adDetail.safetyTip2",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      textKey: "adDetail.safetyTip3",
      color: "text-orange-600"
    },
    {
      icon: AlertTriangle,
      textKey: "adDetail.safetyTip4",
      color: "text-red-600"
    },
    {
      icon: Shield,
      textKey: "adDetail.safetyTip5",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('adDetail.safetyTipsTitle')}</h3>
          <p className="text-sm text-gray-600">{t('adDetail.shopWithConfidence')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`p-1 rounded ${tip.color}`}>
              <tip.icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{t(tip.textKey)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium">
          {t('adDetail.safetyTipNote')}
        </p>
      </div>
    </div>
  );
};

export default SafetyTips;
