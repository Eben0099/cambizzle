import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Plus, User, Heart, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AuthModal from '../auth/AuthModal';
import { getPhotoUrl } from '../../utils/helpers';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();



  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-black shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#D6BA69] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-[#D6BA69]">Cambizzle</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/create-ad">
                  <Button variant="primary" size="sm" className="flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Post an ad</span>
                  </Button>
                </Link>
                
                <Link to="/favorites" className="p-2 text-gray-600 hover:text-[#D6BA69] rounded-lg hover:bg-gray-100">
                  <Heart className="w-5 h-5" />
                </Link>
                
                <Link to="/notifications" className="p-2 text-gray-600 hover:text-[#D6BA69] rounded-lg hover:bg-gray-100 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-[#D6BA69] rounded-full flex items-center justify-center overflow-hidden">
                      {user?.photoUrl ? (
                        <img src={getPhotoUrl(user.photoUrl)} alt={`${user?.firstName || ''} ${user?.lastName || ''}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-black text-sm font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="w-4 h-4 mr-2" />
                        My profile
                      </Link>
                      <Link to="/my-ads" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Plus className="w-4 h-4 mr-2" />
                        My ads
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div onClick={() => openAuthModal('login')}>
                  <Button variant="ghost" size="sm">Log in</Button>
                </div>
                <div onClick={() => openAuthModal('register')}>
                  <Button variant="primary" size="sm">Sign up</Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#D6BA69] hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-ad"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="w-5 h-5 text-[#D6BA69]" />
                  <span>Post an ad</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span>My profile</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span>My favorites</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <div
                  onClick={() => {
                    openAuthModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  Log in
                </div>
                <div
                  onClick={() => {
                    openAuthModal('register');
                    setIsMenuOpen(false);
                  }}
                  className="block p-3 rounded-lg hover:bg-gray-100"
                >
                  Sign up
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
