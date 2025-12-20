import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('terms.seoTitle')}
        description={t('terms.seoDescription')}
        url="/terms"
        image="https://images.unsplash.com/photo-1450101499163-c8917c7b175c?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50" data-wg-notranslate="true">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('terms.title')} <span className="text-[#D6BA69]">{t('terms.conditions')}</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('terms.subtitle')}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section1Title')}</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                {t('terms.section1Text1')} <a href="https://www.cambizzle.com" className="text-[#D6BA69] hover:underline">www.cambizzle.com</a> {t('terms.section1Text2')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section1Text3')}
              </p>
            </section>

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section2Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section2Text')}
              </p>
            </section>

            {/* 3. Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section3Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section3Text')}
              </p>
            </section>

            {/* 4. User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section4Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section4Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section4Item2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section4Item3')}</span>
                </li>
              </ul>
            </section>

            {/* 5. Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section5Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section5Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section5Item2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section5Item3')}</span>
                </li>
              </ul>
            </section>

            {/* 6. Listing and Transactions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section6Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section6Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section6Item2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section6Item3')}</span>
                </li>
              </ul>
            </section>

            {/* 7. Payment and Fees */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section7Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section7Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section7Item2')}</span>
                </li>
              </ul>
            </section>

            {/* 8. Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section8Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section8Text')}
              </p>
            </section>

            {/* 9. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section9Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section9Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section9Item2')}</span>
                </li>
              </ul>
            </section>

            {/* 10. Disclaimers and Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section10Title')}</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section10Item1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section10Item2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.section10Item3')}</span>
                </li>
              </ul>
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section11Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section11Text')}
              </p>
            </section>

            {/* 12. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section12Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section12Text')}
              </p>
            </section>

            {/* 13. Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section13Title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('terms.section13Text')}
              </p>
            </section>

            {/* 14. Contact Us */}
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section14Title')}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t('terms.section14Text')}
              </p>
              <ul className="space-y-2 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.website')}: <a href="https://www.cambizzle.com" className="text-[#D6BA69] hover:underline">www.cambizzle.com</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.emailLabel')}: <a href="mailto:info@cambizzle.com" className="text-[#D6BA69] hover:underline">info@cambizzle.com</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>{t('terms.phoneLabel')}: +237678185437</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
