import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { CheckCircle, Users, Globe, Zap, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

import { useSettings } from '../contexts/SettingsContext';
import cmsService from '../services/cmsService';
import logger from '../utils/logger';

const About = () => {
  const { t } = useTranslation();
  const { contact, sections, loading } = useSettings();
  const aboutSections = sections?.aboutUs || [];

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
          {/* Accordion Sections */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D6BA69]" />
                </div>
              ) : aboutSections.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {aboutSections.map((section, index) => (
                    <AccordionItem key={section.id || index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-gray-600 leading-relaxed pt-4">
                        <div className="whitespace-pre-wrap">{section.content}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {/* Fallback to translations if no sections in DB */}
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                      {t('about.whoWeAre')}
                    </AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-600 leading-relaxed pt-4">
                      <p>{t('about.whoWeAreText')}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                      {t('about.ourMission')}
                    </AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-600 leading-relaxed pt-4">
                      <p>{t('about.ourMissionText')}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left text-2xl font-bold hover:text-[#D6BA69]">
                      {t('about.ourVision')}
                    </AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-600 leading-relaxed space-y-4 pt-4">
                      <p>{t('about.ourVisionText1')}</p>
                      <p>{t('about.ourVisionText2')}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </section>

          {/* Additional Info */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.haveQuestions')}</h2>
              <p className="text-gray-600 mb-6">
                {t('about.contactUs')}{' '}
                <a href={`mailto:${contact?.supportEmail || 'info@cambizzle.com'}`} className="text-[#D6BA69] hover:underline">
                  {contact?.supportEmail || 'info@cambizzle.com'}
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

