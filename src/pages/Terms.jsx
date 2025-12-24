import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">

            <Accordion type="multiple" className="w-full">
              {/* 1. Introduction */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section1Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed space-y-3 pt-2">
                  <p>
                    {t('terms.section1Text1')} <a href="https://www.cambizzle.com" className="text-[#D6BA69] hover:underline">www.cambizzle.com</a> {t('terms.section1Text2')}
                  </p>
                  <p>
                    {t('terms.section1Text3')}
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Eligibility */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section2Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section2Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Registration */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section3Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section3Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 4. User Responsibilities */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section4Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
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
                </AccordionContent>
              </AccordionItem>

              {/* 5. Prohibited Activities */}
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section5Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
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
                </AccordionContent>
              </AccordionItem>

              {/* 6. Listing and Transactions */}
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section6Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
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
                </AccordionContent>
              </AccordionItem>

              {/* 7. Payment and Fees */}
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section7Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
                    <li className="flex gap-3">
                      <span className="text-[#D6BA69]">•</span>
                      <span>{t('terms.section7Item1')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#D6BA69]">•</span>
                      <span>{t('terms.section7Item2')}</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* 8. Privacy Policy */}
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section8Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section8Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 9. Intellectual Property */}
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section9Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
                    <li className="flex gap-3">
                      <span className="text-[#D6BA69]">•</span>
                      <span>{t('terms.section9Item1')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#D6BA69]">•</span>
                      <span>{t('terms.section9Item2')}</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* 10. Disclaimers and Limitation of Liability */}
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section10Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="space-y-3 ml-6">
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
                </AccordionContent>
              </AccordionItem>

              {/* 11. Termination */}
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section11Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section11Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 12. Governing Law */}
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section12Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section12Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 13. Modifications */}
              <AccordionItem value="item-13">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section13Title')}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  <p>{t('terms.section13Text')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* 14. Contact Us */}
              <AccordionItem value="item-14">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                  {t('terms.section14Title')}
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
