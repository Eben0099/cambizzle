import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-gray-300" data-wg-notranslate="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-[#D6BA69] font-semibold text-lg">{t('footer.aboutUs')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-[#D6BA69] transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#D6BA69] transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <a href="mailto:info@cambizzle.com" className="hover:text-[#D6BA69] transition-colors">
                  info@cambizzle.com
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <h3 className="text-[#D6BA69] font-semibold text-lg">{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/safety-tips" className="hover:text-[#D6BA69] transition-colors">
                  {t('footer.safetyCenter')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-[#D6BA69] font-semibold text-lg">{t('footer.connect')}</h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.facebook.com/share/p/Cu98uFNDkjT6Xn7K/"
                className="text-gray-400 hover:text-[#D6BA69] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/p/DBROxgBu6VM/?igsh=dDEwZzY3ajU0bW42"
                className="text-gray-400 hover:text-[#D6BA69] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://vm.tiktok.com/ZMhPTtCLf/"
                className="text-gray-400 hover:text-[#D6BA69] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.5a4.85 4.85 0 0 1-1.04 0z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Cambizzle. {t('footer.copyright')}
            </p>
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
