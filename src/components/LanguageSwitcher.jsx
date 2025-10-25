import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import Weglot from 'react-weglot';
import WEGLOT_CONFIG from '../config/weglot';

/**
 * Language Switcher Component
 * Permet de changer la langue du site
 */
const LanguageSwitcher = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(WEGLOT_CONFIG.originalLanguage);

  useEffect(() => {
    // Récupérer la langue actuelle de Weglot
    const updateCurrentLanguage = () => {
      if (window.Weglot) {
        setCurrentLanguage(window.Weglot.getCurrentLang());
      }
    };

    updateCurrentLanguage();
    
    // Écouter les changements de langue
    if (window.Weglot) {
      window.Weglot.on('languageChanged', updateCurrentLanguage);
    }

    return () => {
      if (window.Weglot) {
        window.Weglot.off('languageChanged', updateCurrentLanguage);
      }
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    if (window.Weglot) {
      window.Weglot.switchTo(langCode);
      setCurrentLanguage(langCode);
      setIsOpen(false);
    }
  };

  const getCurrentLanguageName = () => {
    const lang = WEGLOT_CONFIG.cameroonLanguages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'Language';
  };

  const getCurrentLanguageFlag = () => {
    const lang = WEGLOT_CONFIG.cameroonLanguages.find(l => l.code === currentLanguage);
    return lang ? lang.flag : '🌍';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors duration-200 shadow-sm"
        aria-label="Change language"
      >
        <span className="text-xl">{getCurrentLanguageFlag()}</span>
        <span className="hidden sm:inline font-medium text-gray-700">
          {getCurrentLanguageName()}
        </span>
        <Globe className="w-4 h-4 text-gray-500" />
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {WEGLOT_CONFIG.cameroonLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage === lang.code ? 'bg-[#D6BA69]/10' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-gray-700">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
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
