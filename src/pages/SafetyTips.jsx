import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Shield, AlertTriangle, Eye, CreditCard, Users, Lock, MapPin, Phone } from 'lucide-react';

const SafetyTipsPage = () => {
  const tips = [
    {
      icon: MapPin,
      title: "Meet in Public or Safe Places",
      description: "Always arrange to meet buyers or sellers in well-lit, public locations, preferably during daylight hours. Avoid meeting in suspicious or secluded areas.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Bring a Friend or Family Member",
      description: "Whenever possible, bring someone with you for added safety. Let a friend or family member know your whereabouts and who you meet.",
      color: "text-blue-600"
    },
    {
      icon: Eye,
      title: "Verify the Other Party",
      description: "Check the reviews and ratings of sellers on the website. Avoid dealing with users who have negative feedback or no history. Keep a record of any chat history. If possible, use video calls or voice chats to confirm the other party's identity.",
      color: "text-purple-600"
    },
    {
      icon: CreditCard,
      title: "Inspect Items Before Payment",
      description: "For physical goods, thoroughly inspect the item before making any payment. For services, be sure you understand the terms and conditions before committing.",
      color: "text-orange-600"
    },
    {
      icon: Lock,
      title: "Avoid Prepayment and Use Secure Payment Methods",
      description: "Refrain from making advance payments when the goods have not been inspected, or the service has not been provided. Avoid cash transactions for high-value items. Instead, use secure payment methods like Mobile Money, Orange Money, or Bank Transfers.",
      color: "text-indigo-600"
    },
    {
      icon: Shield,
      title: "Trust Your Instincts",
      description: "If something feels off or too good to be true, trust your instincts and walk away. Report suspicious users or listings to the platform immediately.",
      color: "text-red-600"
    },
    {
      icon: AlertTriangle,
      title: "Beware of Scams",
      description: "Be alert for common scams, such as overpayment schemes, very low prices, or requests for upfront fees. Exercise caution with deals that seem too good to be true.",
      color: "text-yellow-600"
    },
    {
      icon: Phone,
      title: "Report Suspicious Activity",
      description: "If you encounter scams, fraud, or suspicious behaviour, report it to the platform's support team immediately. Help keep the community safe by flagging inappropriate content or users.",
      color: "text-pink-600"
    }
  ];

  const additionalTips = [
    {
      title: "Be Cautious with Shipping or Delivery",
      content: "When shipping items, use tracked and insured shipping methods. Avoid shipping items before receiving payment."
    },
    {
      title: "Educate Yourself",
      content: "Stay informed about common online scams and safety practices. Regularly review the platform's safety guidelines and updates."
    },
    {
      title: "Avoid Pressure Tactics",
      content: "Be cautious of users who pressure you to make quick decisions or bypass the platform's recommended processes."
    },
    {
      title: "Use Strong Passwords",
      content: "Protect your account by using a strong, unique password."
    }
  ];

  return (
    <>
      <SEO
        title="Safety Tips | Cambizzle"
        description="Important safety tips for buying and selling on Cambizzle. Learn how to stay safe while using our marketplace."
        url="/safety-tips"
        image="https://images.unsplash.com/photo-1633356426806-f72df37bfe42?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Stay Safe on <span className="text-[#D6BA69]">Cambizzle</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Essential safety tips for secure buying and selling
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Cambizzle Family</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                As a user of www.cambizzle.com, we want to ensure you have a safe experience. Here are some important safety tips to follow:
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Following these tips can help ensure a safer experience while using our platform. Stay safe and enjoy your transactions!
              </p>
            </div>
          </section>

          {/* Safety Tips Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Essential Safety Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip, index) => {
                const IconComponent = tip.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <IconComponent className={`${tip.color} w-8 h-8 flex-shrink-0 mt-1`} />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* For Buyers */}
          <section className="mb-16">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Buyers</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Check Seller Profile:</strong> Review the seller's history, ratings, and number of successful transactions.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Ask Questions:</strong> Don't hesitate to ask detailed questions about the item's condition, age, and any defects.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Request Photos:</strong> Ask for additional photos or videos if the listing photos look suspicious or incomplete.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Use Cash Carefully:</strong> When using cash, count it carefully before handing it over.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Verify Items:</strong> For electronics, test them on the spot if possible. For vehicles, consider getting an inspection.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Get a Receipt:</strong> Ask for a written receipt or take a photo of the transaction for your records.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* For Sellers */}
          <section className="mb-16">
            <div className="bg-green-50 rounded-lg border border-green-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Sellers</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Be Accurate:</strong> Provide honest and detailed descriptions of your items, including any flaws or wear.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Use Quality Photos:</strong> Clear, well-lit photos from multiple angles help build trust and reduce disputes.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Respond Promptly:</strong> Answer questions quickly and thoroughly to build confidence with potential buyers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Set Fair Prices:</strong> Research similar items to ensure your pricing is competitive and realistic.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Verify Buyers:</strong> Check their profile history and ratings before meeting.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700"><strong>Count Money Carefully:</strong> Always count cash in front of the buyer before concluding the transaction.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Red Flags */}
          <section className="mb-16">
            <div className="bg-red-50 rounded-lg border border-red-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">🚩 Red Flags to Watch For</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Requests to pay outside of normal methods or in untraceable ways</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Urgency or pressure to complete the transaction quickly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Sellers or buyers who avoid meeting in person</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Unusually low prices for high-value items</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Requests for your personal or financial information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Poor grammar or suspicious communication patterns</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Accounts with no history or reviews</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">!</span>
                  <span className="text-gray-700">Photos that appear to be copied from other listings</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-4">If Something Goes Wrong</h2>
              <p className="text-lg mb-6">
                If you encounter fraud, harassment, or any suspicious activity, please report it immediately to our team:
              </p>
              <div className="space-y-3">
                <p className="flex items-center gap-3">
                  <span className="text-[#D6BA69] font-bold">📧</span>
                  <a href="mailto:info@cambizzle.com" className="text-white hover:text-[#D6BA69] transition-colors underline">
                    info@cambizzle.com
                  </a>
                </p>
                <p className="text-sm text-purple-100 mt-6">
                  We take all reports seriously and investigate suspicious accounts and transactions. Your report helps keep Cambizzle safe for everyone.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mt-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Learn More</h2>
              <p className="text-gray-600 mb-8">
                For more information about Cambizzle, check out our other pages:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/about"
                  className="inline-block text-[#D6BA69] font-semibold hover:underline"
                >
                  → About Cambizzle
                </Link>
                <Link
                  to="/terms"
                  className="inline-block text-[#D6BA69] font-semibold hover:underline"
                >
                  → Terms & Conditions
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SafetyTipsPage;
