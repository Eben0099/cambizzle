import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useSettings } from '../contexts/SettingsContext';
import cmsService from '../services/cmsService';
import logger from '../utils/logger';
import { HelpCircle, Mail, Phone } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";

const Faq = () => {
    const { t } = useTranslation();
    const { contact, faqs, loading } = useSettings();

    return (
        <>
            <SEO
                title={t('faq.seoTitle')}
                description={t('faq.seoDescription')}
                url="/faq"
            />
            <div className="min-h-screen bg-gray-50" data-wg-notranslate="true">
                {/* Header */}
                <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                            {t('faq.title')} <span className="text-[#D6BA69]">Cambizzle</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-300">
                            {t('faq.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D6BA69]"></div>
                        </div>
                    ) : faqs.length > 0 ? (
                        <section className="mb-16">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                                <Accordion type="multiple" className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={faq.id || index} value={`faq-${index}`}>
                                            <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#D6BA69]">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </section>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">{t('faq.noFaqs')}</p>
                        </div>
                    )}

                    {/* Still Have Questions */}
                    <section>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.stillHaveQuestions')}</h2>
                            <p className="text-gray-600 mb-8">
                                {t('faq.contactSupport')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                                <a
                                    href={`mailto:${contact?.supportEmail || 'info@cambizzle.com'}`}
                                    className="flex items-center gap-3 text-gray-700 hover:text-[#D6BA69] transition-colors"
                                >
                                    <Mail className="w-6 h-6 text-[#D6BA69]" />
                                    <span className="font-semibold">{contact?.supportEmail || 'info@cambizzle.com'}</span>
                                </a>
                                {contact?.supportPhone && (
                                    <a
                                        href={`tel:${contact.supportPhone}`}
                                        className="flex items-center gap-3 text-gray-700 hover:text-[#D6BA69] transition-colors"
                                    >
                                        <Phone className="w-6 h-6 text-[#D6BA69]" />
                                        <span className="font-semibold">{contact.supportPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default Faq;
