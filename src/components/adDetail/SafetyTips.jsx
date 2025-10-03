import { Shield, AlertTriangle, Eye, CreditCard, Users } from 'lucide-react';

const SafetyTips = () => {
  const tips = [
    {
      icon: Users,
      text: "Rencontrez le vendeur dans un lieu public et sûr",
      color: "text-green-600"
    },
    {
      icon: Eye,
      text: "Inspectez soigneusement l'article avant l'achat",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      text: "Ne payez jamais à l'avance sans voir l'article",
      color: "text-orange-600"
    },
    {
      icon: AlertTriangle,
      text: "Méfiez-vous des prix anormalement bas",
      color: "text-red-600"
    },
    {
      icon: Shield,
      text: "Signalez les annonces suspectes",
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
          <h3 className="text-lg font-semibold text-gray-900">Conseils de sécurité</h3>
          <p className="text-sm text-gray-600">Achetez en toute sécurité</p>
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
          💡 Astuce : Faites confiance à votre instinct. Si quelque chose vous semble suspect, n'hésitez pas à annuler la transaction.
        </p>
      </div>
    </div>
  );
};

export default SafetyTips;