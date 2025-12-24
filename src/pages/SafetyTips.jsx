import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { Shield, AlertTriangle, Eye, CreditCard, Users, Lock, MapPin, Phone } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const SafetyTipsPage = () => {
  const { t } = useTranslation();

  const tips = [
    {
      icon: MapPin,
      title: t('safetyPage.tip1Title'),
      description: t('safetyPage.tip1Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: Users,
      title: t('safetyPage.tip2Title'),
      description: t('safetyPage.tip2Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: Eye,
      title: t('safetyPage.tip3Title'),
      description: t('safetyPage.tip3Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: CreditCard,
      title: t('safetyPage.tip4Title'),
      description: t('safetyPage.tip4Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: Lock,
      title: t('safetyPage.tip5Title'),
      description: t('safetyPage.tip5Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: Shield,
      title: t('safetyPage.tip6Title'),
      description: t('safetyPage.tip6Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: AlertTriangle,
      title: t('safetyPage.tip7Title'),
      description: t('safetyPage.tip7Desc'),
      color: "text-[#D6BA69]"
    },
    {
      icon: Phone,
      title: t('safetyPage.tip8Title'),
      description: t('safetyPage.tip8Desc'),
      color: "text-[#D6BA69]"
    }
  ];

  return (
    <>
      <SEO
        title={t('safetyPage.seoTitle')}
        description={t('safetyPage.seoDescription')}
        url="/safety-tips"
        image="https://images.unsplash.com/photo-1633356426806-f72df37bfe42?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50" data-wg-notranslate="true">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('safetyPage.title')} <span className="text-[#D6BA69]">Cambizzle</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('safetyPage.subtitle')}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('safetyPage.welcomeTitle')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {t('safetyPage.welcomeText1')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('safetyPage.welcomeText2')}
              </p>
            </div>
          </section>

          {/* Safety Tips Accordion */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('safetyPage.essentialTips')}</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Accordion type="multiple" className="w-full">
                {tips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <AccordionItem key={index} value={`tip-${index}`}>
                      <AccordionTrigger className="text-left hover:text-[#D6BA69]">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`${tip.color} w-6 h-6 flex-shrink-0`} />
                          <span className="font-semibold">{tip.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed pt-2 pl-9">
                        {tip.description}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </section>

          {/* For Buyers, Sellers, and Red Flags Accordion */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Accordion type="multiple" className="w-full">
                {/* For Buyers */}
                <AccordionItem value="buyers">
                  <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                    {t('safetyPage.tipsForBuyers')}
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                      <ul className="space-y-4">
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip1Title')}</strong> {t('safetyPage.buyerTip1Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip2Title')}</strong> {t('safetyPage.buyerTip2Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip3Title')}</strong> {t('safetyPage.buyerTip3Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip4Title')}</strong> {t('safetyPage.buyerTip4Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip5Title')}</strong> {t('safetyPage.buyerTip5Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.buyerTip6Title')}</strong> {t('safetyPage.buyerTip6Desc')}</span>
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* For Sellers */}
                <AccordionItem value="sellers">
                  <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                    {t('safetyPage.tipsForSellers')}
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                      <ul className="space-y-4">
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip1Title')}</strong> {t('safetyPage.sellerTip1Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip2Title')}</strong> {t('safetyPage.sellerTip2Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip3Title')}</strong> {t('safetyPage.sellerTip3Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip4Title')}</strong> {t('safetyPage.sellerTip4Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip5Title')}</strong> {t('safetyPage.sellerTip5Desc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          <span className="text-gray-700"><strong>{t('safetyPage.sellerTip6Title')}</strong> {t('safetyPage.sellerTip6Desc')}</span>
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Red Flags */}
                <AccordionItem value="red-flags">
                  <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                    {t('safetyPage.redFlagsTitle')}
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                      <ul className="space-y-3">
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag1')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag2')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag3')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag4')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag5')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag6')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag7')}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-600 font-bold flex-shrink-0">!</span>
                          <span className="text-gray-700">{t('safetyPage.redFlag8')}</span>
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-4">{t('safetyPage.ifSomethingWrong')}</h2>
              <p className="text-lg mb-6">
                {t('safetyPage.reportText')}
              </p>
              <div className="space-y-3">
                <p className="flex items-center gap-3">
                  <span className="text-[#D6BA69] font-bold">•</span>
                  <a href="mailto:info@cambizzle.com" className="text-white hover:text-[#D6BA69] transition-colors underline">
                    info@cambizzle.com
                  </a>
                </p>
                <p className="text-sm text-gray-300 mt-6">
                  {t('safetyPage.reportNote')}
                </p>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('safetyPage.learnMore')}</h2>
              <p className="text-gray-600 mb-8">
                {t('safetyPage.learnMoreText')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/about"
                  className="inline-block text-[#D6BA69] font-semibold hover:underline"
                >
                  → {t('safetyPage.aboutLink')}
                </Link>
                <Link
                  to="/terms"
                  className="inline-block text-[#D6BA69] font-semibold hover:underline"
                >
                  → {t('safetyPage.termsLink')}
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
