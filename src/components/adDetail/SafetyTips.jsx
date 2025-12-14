import { Shield, AlertTriangle, Eye, CreditCard, Users } from 'lucide-react';

const SafetyTips = () => {
  const tips = [
    {
      icon: Users,
      text: "Meet the seller in a safe, public place",
      color: "text-green-600"
    },
    {
      icon: Eye,
      text: "Carefully inspect the item before purchasing",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      text: "Never pay in advance without seeing the item",
      color: "text-orange-600"
    },
    {
      icon: AlertTriangle,
      text: "Be cautious of unusually low prices",
      color: "text-red-600"
    },
    {
      icon: Shield,
      text: "Report suspicious ads",
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
          <h3 className="text-lg font-semibold text-gray-900">Safety Tips</h3>
          <p className="text-sm text-gray-600">Shop with Confidence</p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`p-1 rounded ${tip.color}`}>
              <tip.icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium">
          💡 Tip: Trust your instincts. If something feels suspicious, don’t hesitate to cancel the transaction.
        </p>
      </div>
    </div>
  );
};

export default SafetyTips;