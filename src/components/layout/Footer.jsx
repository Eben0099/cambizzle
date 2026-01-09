import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import { useSettings } from '../../contexts/SettingsContext';

const Footer = () => {
  const { t } = useTranslation();
  const { contact, socialLinks } = useSettings();

  const socialIcons = [
    {
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884zM20.52 3.449A11.008 11.008 0 0012.046 0C5.418 0 .022 5.4.019 12.028c0 2.116.551 4.182 1.604 6.01L0 24l6.117-1.605a10.985 10.985 0 005.922 1.633h.005c6.627 0 12.023-5.399 12.026-12.029a10.957 10.957 0 00-3.328-7.799z" />
        </svg>
      ),
      href: contact?.whatsappNumber ? `https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}` : "#",
      label: 'WhatsApp'
    },
    {
      icon: Facebook,
      href: socialLinks?.facebook || "https://www.facebook.com/share/p/Cu98uFNDkjT6Xn7K/",
      label: 'Facebook'
    },
    {
      icon: Instagram,
      href: socialLinks?.instagram || "https://www.instagram.com/p/DBROxgBu6VM/?igsh=dDEwZzY3ajU0bW42",
      label: 'Instagram'
    },
    {
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.5a4.85 4.85 0 0 1-1.04 0z" />
        </svg>
      ),
      href: socialLinks?.tiktok || "https://vm.tiktok.com/ZMhPTtCLf/",
      label: 'TikTok'
    },
    {
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      href: socialLinks?.linkedin || "#",
      label: 'LinkedIn'
    },
    {
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: socialLinks?.twitter || "#",
      label: 'Twitter'
    },
    {
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      href: socialLinks?.youtube || "#",
      label: 'YouTube'
    }
  ];

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
                <a href={`mailto:${contact?.supportEmail || 'info@cambizzle.com'}`} className="hover:text-[#D6BA69] transition-colors">
                  {contact?.supportEmail || 'info@cambizzle.com'}
                </a>
              </li>
              {contact?.supportPhone && (
                <li>
                  <a href={`tel:${contact.supportPhone}`} className="hover:text-[#D6BA69] transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    {contact.supportPhone}
                  </a>
                </li>
              )}
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
              <li>
                <Link to="/faq" className="hover:text-[#D6BA69] transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-[#D6BA69] font-semibold text-lg">{t('footer.connect')}</h3>
            <div className="flex justify-center space-x-6">
              {socialIcons.filter(social => social.href && social.href !== '#' && social.href !== 'https://wa.me/').map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-[#D6BA69] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Cambizzle. {t('footer.copyright')}
            </p>
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
