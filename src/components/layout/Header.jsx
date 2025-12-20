import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Menu, X, Plus, User, Heart, Bell, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../toast/useToast';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import AuthModal from '../auth/AuthModal';

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    showToast({
      type: 'info',
      title: t('toast.goodbye'),
      message: t('toast.logoutSuccess')
    });
    navigate('/');
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-black shadow-sm border-b border-gray-800 sticky top-0 z-40" data-wg-notranslate="true">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/cambizzle.png" alt="Cambizzle" className="w-18 h-9 rounded-lg shadow-sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/create-ad">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('header.postAd')}</span>
                  </Button>
                </Link>

                {/* Admin Link - Visible only for roleId === "1" */}
                {isAuthenticated && String(user?.roleId) == "1" && (
                  <Link
                    to="/admin"
                    className="group relative p-2 text-gray-400 hover:text-[#D6BA69] rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 hover:shadow-md border border-transparent hover:border-amber-200"
                    title={t('header.administration')}
                  >
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Shield className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {t('header.administration')}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/10 transition-colors cursor-pointer">
                    <Avatar
                      src={user?.photoUrl}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                      className="shadow-sm"
                    />
                    <span className="text-sm font-medium text-gray-300 hidden lg:block">
                      {user?.firstName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-black rounded-xl shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-black/20 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        <span>{t('header.myProfile')}</span>
                      </Link>
                      <Link
                        to="/profile/ads"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-black/20 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-3" />
                        <span>{t('header.myAds')}</span>
                      </Link>
                      <Link
                        to="/profile/favorites"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-black/20 hover:text-white transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        <span>{t('header.myFavorites')}</span>
                      </Link>
                      {isAuthenticated && String(user?.roleId) === "1" && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-black/20 hover:text-white transition-colors"
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          <span>{t('header.adminPanel')}</span>
                        </Link>
                      )}
                      <hr className="my-1 border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div onClick={() => openAuthModal('login')} className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('header.login')}
                  </Button>
                </div>
                <div onClick={() => openAuthModal('register')} className="cursor-pointer">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    {t('header.signup')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-[#D6BA69] hover:bg-black/10 transition-colors cursor-pointer"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-ad"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="w-5 h-5 text-[#D6BA69]" />
                  <span className="font-medium">{t('header.postAd')}</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t('header.myProfile')}</span>
                </Link>
                <Link
                  to="/profile/ads"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">{t('header.myAds')}</span>
                </Link>
                <Link
                  to="/profile/favorites"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{t('header.myFavorites')}</span>
                </Link>
                {isAuthenticated && String(user?.roleId) == "1" && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">{t('header.adminPanel')}</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 text-gray-300 hover:text-white transition-colors w-full text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('header.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <div
                  onClick={() => {
                    openAuthModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="block p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
                >
                  {t('header.login')}
                </div>
                <div
                  onClick={() => {
                    openAuthModal('register');
                    setIsMenuOpen(false);
                  }}
                  className="block p-3 rounded-lg hover:bg-black/10 text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
                >
                  {t('header.signup')}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      )}
    </header>
  );
};

export default Header;
