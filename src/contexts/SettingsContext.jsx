import React, { createContext, useContext, useState, useEffect } from 'react';
import cmsService from '../services/cmsService';
import logger from '../utils/logger';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        contact: {
            supportPhone: '',
            supportEmail: '',
            whatsappNumber: '',
            officeAddress: ''
        },
        socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            tiktok: '',
            youtube: ''
        },
        sections: {
            terms: [],
            aboutUs: [],
            safetyTips: []
        },
        faqs: [],
        loading: true,
        error: null
    });

    const fetchSettings = async () => {
        try {
            setSettings(prev => ({ ...prev, loading: true }));
            const response = await cmsService.getSettings();
            console.log('CMS API Response (Full Body):', response);

            // The response might be { status: 'success', data: { ... } } 
            // or just the data object directly if the service was changed
            const rawData = response?.data || response;
            const status = response?.status || (response?.data ? 'success' : 'unknown');

            if (status === 'success' || rawData?.contact || rawData?.sections) {
                const { contact, socialLinks, sections, faqs } = rawData;
                console.log('Detected CMS components:', {
                    hasContact: !!contact,
                    hasSocial: !!socialLinks,
                    hasSections: !!sections,
                    hasFaqs: !!faqs
                });

                // Normaliser les sections (gérer SnakeCase et CamelCase)
                const normalizedSections = {
                    terms: sections?.terms || [],
                    aboutUs: sections?.aboutUs || sections?.about_us || [],
                    safetyTips: sections?.safetyTips || sections?.safety_tips || []
                };

                // Normaliser les contacts
                const normalizedContact = {
                    supportPhone: contact?.supportPhone || contact?.support_phone || '',
                    supportEmail: contact?.supportEmail || contact?.support_email || '',
                    whatsappNumber: contact?.whatsappNumber || contact?.whatsapp_number || '',
                    officeAddress: contact?.officeAddress || contact?.office_address || ''
                };

                setSettings({
                    contact: normalizedContact,
                    socialLinks: {
                        facebook: socialLinks?.facebook || '',
                        instagram: socialLinks?.instagram || '',
                        twitter: socialLinks?.twitter || '',
                        linkedin: socialLinks?.linkedin || '',
                        tiktok: socialLinks?.tiktok || '',
                        youtube: socialLinks?.youtube || ''
                    },
                    sections: normalizedSections,
                    faqs: Array.isArray(faqs) ? faqs : (rawData?.faqs || []),
                    loading: false,
                    error: null
                });
                console.log('Settings updated successfully in context');
            } else {
                console.warn('CMS API responded but structure was unexpected or status failed:', status);
                setSettings(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Error in SettingsContext fetchSettings:', error);
            setSettings(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const value = {
        ...settings,
        refreshSettings: fetchSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
