import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { changeLanguage, getCurrentLanguage } from '../i18n';

/**
 * Language Switcher Component
 * Permet de changer la langue du site (UI via i18n, contenu via Weglot)
 */
const LanguageSwitcher = ({ className = '', variant = 'light' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Francais', flag: '🇫🇷' }
  ];

  useEffect(() => {
    // Synchroniser avec i18n
    const handleLanguageChange = (lang) => {
      setCurrentLang(lang);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  const getCurrentLanguageData = () => {
    return languages.find(l => l.code === currentLang) || languages[0];
  };

  // Styles selon la variante
  const styles = {
    dark: {
      trigger: 'bg-transparent hover:bg-gray-800 border-gray-700 text-gray-300 hover:text-white',
      dropdown: 'bg-gray-900 border-gray-700',
      option: 'text-gray-300 hover:bg-gray-800 hover:text-white',
      optionActive: 'bg-[#D6BA69]/20'
    },
    light: {
      trigger: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900',
      dropdown: 'bg-white border-gray-200 shadow-lg',
      option: 'text-gray-700 hover:bg-gray-100',
      optionActive: 'bg-[#D6BA69]/10'
    }
  };

  const currentStyles = styles[variant] || styles.light;
  const currentLanguageData = getCurrentLanguageData();

  return (
    <div className={`relative ${className}`} data-wg-notranslate="true">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors duration-200 cursor-pointer ${currentStyles.trigger}`}
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguageData.flag}</span>
        <span className="text-sm font-medium">
          {currentLanguageData.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className={`absolute left-0 bottom-full mb-2 w-44 rounded-lg border py-1 z-50 ${currentStyles.dropdown}`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${currentStyles.option} ${
                  currentLang === lang.code ? currentStyles.optionActive : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                {currentLang === lang.code && (
                  <Check className="w-4 h-4 text-[#D6BA69]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
