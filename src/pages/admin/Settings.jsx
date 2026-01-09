import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Loader from "../../components/ui/Loader";
import {
    Phone,
    Mail,
    MessageSquare,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Save,
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useToast } from "../../components/toast/useToast";
import logger from "../../utils/logger";
import adminService from "../../services/adminService";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

/**
 * Settings and CMS Management Page
 */
const Settings = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Nested state to match API response (CamelCase based on latest sample)
    const [settings, setSettings] = useState({
        contact: {
            supportPhone: "",
            whatsappNumber: "",
            supportEmail: ""
        },
        socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: ""
        },
        sections: {
            terms: [],
            aboutUs: [],
            safetyTips: []
        },
        faqs: []
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSettings();
            if (response.status === 'success' && response.data) {
                const data = response.data;
                setSettings({
                    contact: {
                        supportPhone: data.contact?.supportPhone || "",
                        whatsappNumber: data.contact?.whatsappNumber || "",
                        supportEmail: data.contact?.supportEmail || ""
                    },
                    socialLinks: {
                        facebook: data.socialLinks?.facebook || "",
                        twitter: data.socialLinks?.twitter || "",
                        instagram: data.socialLinks?.instagram || "",
                        linkedin: data.socialLinks?.linkedin || ""
                    },
                    sections: {
                        terms: data.sections?.terms || [],
                        aboutUs: data.sections?.aboutUs || [],
                        safetyTips: data.sections?.safetyTips || []
                    },
                    faqs: data.faqs || []
                });
            }
        } catch (err) {
            logger.error('Error fetching settings:', err);
            showToast({ type: 'info', message: 'Using local settings state' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async () => {
        try {
            setSaving(true);
            // Prepare data for the general/social update (Matching CamelCase format)
            const updateData = {
                contact: settings.contact,
                socialLinks: settings.socialLinks
            };

            const response = await adminService.updateSettings(updateData);
            if (response.status === 'success') {
                showToast({ type: 'success', message: t('admin.settings.saveSuccess') });
            }
        } catch (err) {
            logger.error('Error saving settings:', err);
            showToast({ type: 'error', message: t('admin.settings.saveError') });
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (group, field, value) => {
        setSettings(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [field]: value
            }
        }));
    };

    // Map state page keys to API page_types
    const PAGE_TYPE_MAP = {
        terms: 'terms',
        aboutUs: 'about_us',
        safetyTips: 'safety_tips'
    };

    // Structured Section Handlers (Terms, About, Safety)
    const handleAddSection = (pageKey) => {
        setSettings(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [pageKey]: [...(prev.sections[pageKey] || []), { title: "", content: "", isLocal: true }]
            }
        }));
    };

    const handleSaveSection = async (pageKey, index) => {
        const section = settings.sections[pageKey][index];
        try {
            setSaving(true);
            const sectionData = {
                page_type: PAGE_TYPE_MAP[pageKey] || pageKey,
                title: section.title,
                content: section.content,
                display_order: index + 1
            };

            let response;
            if (section.id) {
                response = await adminService.updateSection(section.id, sectionData);
            } else {
                response = await adminService.createSection(sectionData);
            }

            if (response.status === 'success') {
                showToast({ type: 'success', message: t('admin.settings.saveSuccess') });
                fetchSettings(); // Refresh to get IDs
            }
        } catch (err) {
            logger.error('Error saving section:', err);
            showToast({ type: 'error', message: t('admin.settings.saveError') });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveSection = async (pageKey, index) => {
        const section = settings.sections[pageKey][index];
        if (!section.id) {
            setSettings(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [pageKey]: prev.sections[pageKey].filter((_, i) => i !== index)
                }
            }));
            return;
        }

        if (!window.confirm(t('common.confirmDelete') || "Confirmer la suppression ?")) return;

        try {
            setSaving(true);
            const response = await adminService.deleteSection(section.id);
            if (response.status === 'success') {
                showToast({ type: 'success', message: t('common.deleteSuccess') || 'Supprimé' });
                fetchSettings();
            }
        } catch (err) {
            logger.error('Error deleting section:', err);
            showToast({ type: 'error', message: t('common.error') });
        } finally {
            setSaving(false);
        }
    };

    const handleSectionChange = (pageKey, index, field, value) => {
        setSettings(prev => {
            const updatedSections = [...(prev.sections[pageKey] || [])];
            updatedSections[index] = { ...updatedSections[index], [field]: value };
            return {
                ...prev,
                sections: { ...prev.sections, [pageKey]: updatedSections }
            };
        });
    };

    const moveSection = (pageKey, index, direction) => {
        const updatedSections = [...(settings.sections[pageKey] || [])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= updatedSections.length) return;

        [updatedSections[index], updatedSections[newIndex]] = [updatedSections[newIndex], updatedSections[index]];

        setSettings(prev => ({
            ...prev,
            sections: { ...prev.sections, [pageKey]: updatedSections }
        }));
    };

    // FAQ Handlers
    const handleAddFaq = () => {
        setSettings(prev => ({
            ...prev,
            faqs: [...prev.faqs, { question: "", answer: "", isLocal: true }]
        }));
    };

    const handleSaveFaq = async (index) => {
        const faq = settings.faqs[index];
        try {
            setSaving(true);
            const faqData = {
                question: faq.question,
                answer: faq.answer,
                display_order: index + 1,
                is_active: 1
            };

            let response;
            if (faq.id) {
                response = await adminService.updateFaq(faq.id, faqData);
            } else {
                response = await adminService.createFaq(faqData);
            }

            if (response.status === 'success') {
                showToast({ type: 'success', message: t('admin.settings.saveSuccess') });
                fetchSettings();
            }
        } catch (err) {
            logger.error('Error saving FAQ:', err);
            showToast({ type: 'error', message: t('admin.settings.saveError') });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveFaq = async (index) => {
        const faq = settings.faqs[index];
        if (!faq.id) {
            setSettings(prev => ({
                ...prev,
                faqs: prev.faqs.filter((_, i) => i !== index)
            }));
            return;
        }

        if (!window.confirm(t('common.confirmDelete') || "Confirmer la suppression ?")) return;

        try {
            setSaving(true);
            const response = await adminService.deleteFaq(faq.id);
            if (response.status === 'success') {
                showToast({ type: 'success', message: t('common.deleteSuccess') || 'Supprimé' });
                fetchSettings();
            }
        } catch (err) {
            logger.error('Error deleting FAQ:', err);
            showToast({ type: 'error', message: t('common.error') });
        } finally {
            setSaving(false);
        }
    };

    const handleFaqChange = (index, field, value) => {
        setSettings(prev => {
            const updatedFaqs = [...prev.faqs];
            updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
            return { ...prev, faqs: updatedFaqs };
        });
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('admin.settings.title')}</h1>
                <Button
                    onClick={handleSaveGeneral}
                    disabled={saving}
                    className="bg-[#D6BA69] text-black px-4 py-2 rounded hover:bg-[#c9a63a] flex items-center gap-2"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? t('admin.settings.saving') : t('common.save')}
                </Button>
            </div>

            {(activeTab === "faq" || activeTab === "terms" || activeTab === "about" || activeTab === "safety") && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Plus className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    {t('admin.settings.granularSaveHint') || "Note: Les éléments de cette section sont enregistrés individuellement via l'icône de sauvegarde sur chaque carte."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-6 border-b mb-6 overflow-x-auto scrollbar-hide">
                {[
                    { id: "general", label: t('admin.settings.general') },
                    { id: "social", label: t('admin.settings.socialMedia') },
                    { id: "terms", label: t('admin.settings.terms') },
                    { id: "about", label: t('admin.settings.about') },
                    { id: "safety", label: t('admin.settings.safety') },
                    { id: "faq", label: t('admin.settings.faq') }
                ].map((tab) => (
                    <Button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? "border-b-2 border-[#D6BA69] text-[#D6BA69]"
                            : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Loading */}
            {loading && <Loader text={t('common.loading')} />}

            {!loading && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('admin.settings.contactInfo')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {t('admin.settings.supportPhone')}
                                    </Label>
                                    <PhoneInput
                                        defaultCountry="CM"
                                        international
                                        value={settings.contact.supportPhone}
                                        onChange={(value) => handleInputChange('contact', 'supportPhone', value || '')}
                                        className="[&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:ring-0 [&_.PhoneInputInput]:focus:border-none w-full px-3 py-2 border rounded transition-colors duration-200 border-gray-300 focus-within:ring-2 focus-within:ring-[#D6BA69] focus-within:border-[#D6BA69] text-gray-900 bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <MessageSquare className="h-4 w-4 text-green-500" />
                                        {t('admin.settings.whatsappNumber')}
                                    </Label>
                                    <PhoneInput
                                        defaultCountry="CM"
                                        international
                                        value={settings.contact.whatsappNumber}
                                        onChange={(value) => handleInputChange('contact', 'whatsappNumber', value || '')}
                                        className="[&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:ring-0 [&_.PhoneInputInput]:focus:border-none w-full px-3 py-2 border rounded transition-colors duration-200 border-gray-300 focus-within:ring-2 focus-within:ring-[#D6BA69] focus-within:border-[#D6BA69] text-gray-900 bg-white"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Mail className="h-4 w-4 text-blue-500" />
                                        {t('admin.settings.supportEmail')}
                                    </Label>
                                    <Input
                                        type="email"
                                        value={settings.contact.supportEmail}
                                        onChange={(e) => handleInputChange('contact', 'supportEmail', e.target.value)}
                                        className="border rounded px-3 py-2 w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Tab */}
                    {activeTab === "social" && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('admin.settings.socialLinks')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Facebook, color: "text-blue-600", key: "facebook", label: t('admin.settings.facebook') },
                                    { icon: Twitter, color: "text-sky-500", key: "twitter", label: t('admin.settings.twitter') },
                                    { icon: Instagram, color: "text-purple-500", key: "instagram", label: t('admin.settings.instagram') },
                                    { icon: Linkedin, color: "text-blue-700", key: "linkedin", label: t('admin.settings.linkedin') }
                                ].map(({ icon: Icon, color, key, label }) => (
                                    <div key={key} className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Icon className={`h-4 w-4 ${color}`} />
                                            {label}
                                        </Label>
                                        <Input
                                            value={settings.socialLinks[key]}
                                            onChange={(e) => handleInputChange('socialLinks', key, e.target.value)}
                                            className="border rounded px-3 py-2 w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Static Pages Tabs */}
                    {activeTab === "terms" && (
                        <SectionEditor
                            pageKey="terms"
                            title={t('admin.settings.terms')}
                            sectionsList={settings.sections.terms}
                            t={t}
                            onAdd={handleAddSection}
                            onSave={handleSaveSection}
                            onRemove={handleRemoveSection}
                            onChange={handleSectionChange}
                            onMove={moveSection}
                        />
                    )}
                    {activeTab === "about" && (
                        <SectionEditor
                            pageKey="aboutUs"
                            title={t('admin.settings.about')}
                            sectionsList={settings.sections.aboutUs}
                            t={t}
                            onAdd={handleAddSection}
                            onSave={handleSaveSection}
                            onRemove={handleRemoveSection}
                            onChange={handleSectionChange}
                            onMove={moveSection}
                        />
                    )}
                    {activeTab === "safety" && (
                        <SectionEditor
                            pageKey="safetyTips"
                            title={t('admin.settings.safety')}
                            sectionsList={settings.sections.safetyTips}
                            t={t}
                            onAdd={handleAddSection}
                            onSave={handleSaveSection}
                            onRemove={handleRemoveSection}
                            onChange={handleSectionChange}
                            onMove={moveSection}
                        />
                    )}

                    {/* FAQ Tab */}
                    {activeTab === "faq" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">{t('admin.settings.faqManagement')}</h2>
                                <Button
                                    onClick={handleAddFaq}
                                    className="bg-[#D6BA69] text-black px-4 py-2 rounded hover:bg-[#c9a63a] flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('admin.settings.addFaq')}
                                </Button>
                            </div>

                            {settings.faqs.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                                    <p>{t('admin.settings.noFaqs')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settings.faqs.map((faq, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow p-6 relative border-l-4 border-gray-900">
                                            <div className="absolute top-3 right-3 flex items-center gap-1">
                                                <Button
                                                    onClick={() => handleSaveFaq(index)}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded"
                                                    title={t('common.save')}
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleRemoveFaq(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-4 pt-4 sm:pt-0">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t('admin.settings.question')} #{index + 1}
                                                    </Label>
                                                    <Input
                                                        value={faq.question}
                                                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                        className="border rounded px-3 py-2 w-full font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">{t('admin.settings.answer')}</Label>
                                                    <Textarea
                                                        value={faq.answer}
                                                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                        className="min-h-[100px] border rounded px-3 py-2 w-full text-gray-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Moved outside to prevent focus loss (remounting) on every state update
const SectionEditor = ({ pageKey, title, sectionsList, t, onAdd, onSave, onRemove, onChange, onMove }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button
                    onClick={() => onAdd(pageKey)}
                    className="bg-[#D6BA69] text-black px-4 py-2 rounded hover:bg-[#c9a63a] flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {t('common.add')}
                </Button>
            </div>

            <div className="space-y-4">
                {sectionsList.map((section, index) => (
                    <div key={section.id || `local-${index}`} className="bg-white rounded-lg shadow p-6 relative border-l-4 border-[#D6BA69]">
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                            <Button
                                onClick={() => onMove(pageKey, index, 'up')}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => onMove(pageKey, index, 'down')}
                                disabled={index === sectionsList.length - 1}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => onSave(pageKey, index)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded"
                                title={t('common.save')}
                            >
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => onRemove(pageKey, index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded ml-1"
                                title={t('common.delete')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4 pt-4 sm:pt-0">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('admin.settings.sectionTitle')}</Label>
                                <Input
                                    value={section.title}
                                    onChange={(e) => onChange(pageKey, index, 'title', e.target.value)}
                                    placeholder={t('admin.settings.sectionTitlePlaceholder')}
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">{t('admin.settings.sectionContent')}</Label>
                                <Textarea
                                    value={section.content}
                                    onChange={(e) => onChange(pageKey, index, 'content', e.target.value)}
                                    placeholder={t('admin.settings.sectionContentPlaceholder')}
                                    className="min-h-[150px] border rounded px-3 py-2 w-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {sectionsList.length === 0 && (
                    <div className="bg-gray-50 rounded-lg border-2 border-dashed p-8 text-center text-gray-400">
                        {t('admin.settings.noSections')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;