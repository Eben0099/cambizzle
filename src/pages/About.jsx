import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { CheckCircle, Users, Globe, Zap } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        url="/about"
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50" data-wg-notranslate="true">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {t('about.title')} <span className="text-[#D6BA69]">Cambizzle</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              {t('about.subtitle')}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.whoWeAre')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {t('about.whoWeAreText')}
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.ourMission')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {t('about.ourMissionText')}
              </p>
            </div>
          </section>

          {/* Our Vision */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.ourVision')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {t('about.ourVisionText1')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('about.ourVisionText2')}
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-black to-gray-900 text-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('about.readyToStart')}</h2>
            <p className="text-lg text-gray-300 mb-8">
              {t('about.joinThousands')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-[#D6BA69] text-black font-semibold px-8 py-3 rounded-lg hover:bg-[#e8d087] transition-colors"
              >
                {t('about.createAccount')}
              </Link>
              <Link
                to="/"
                className="inline-block bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t('about.browseListings')}
              </Link>
            </div>
          </section>

          {/* Additional Info */}
          <section className="mt-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.haveQuestions')}</h2>
              <p className="text-gray-600 mb-6">
                {t('about.contactUs')}{' '}
                <a href="mailto:info@cambizzle.com" className="text-[#D6BA69] hover:underline">
                  info@cambizzle.com
                </a>
              </p>
              <p className="text-gray-600">
                {t('about.readMore')} <Link to="/terms" className="text-[#D6BA69] hover:underline">{t('about.termsConditions')}</Link> {t('auth.and')} <Link to="/safety-tips" className="text-[#D6BA69] hover:underline">{t('about.safetyTips')}</Link>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
