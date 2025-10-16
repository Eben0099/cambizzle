import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    clearError();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link 
        to="/" 
        className="flex justify-center items-center space-x-3 mb-6 sm:mb-8"
      >
        <div className="w-12 h-12 bg-[#D6BA69] rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-black font-bold text-2xl">C</span>
        </div>
        <span className="text-2xl sm:text-3xl font-bold text-black hidden sm:block">
          Cambizzle
        </span>
      </Link>
      
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Log in to your account
        </h2>
        <p className="text-sm text-gray-600">
          Or{' '}
          <Link 
            to="/register" 
            className="font-medium text-[#D6BA69] hover:text-[#D6BA69]/80 transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="pr-12 border-gray-300 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            />
            <button
              type="button"
              className="absolute right-4 top-10 sm:top-11 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-[#D6BA69] hover:text-[#D6BA69]/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-[#D6BA69] hover:bg-[#D6BA69]/90 text-black border-[#D6BA69] px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            loading={isLoading}
            disabled={isLoading}
          >
            Sign in
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Test Accounts</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-left justify-start bg-white border-black text-black hover:bg-gray-50 hover:border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => setFormData({ email: 'admin@cambizzle.com', password: 'admin123' })}
            >
              Admin: admin@cambizzle.com / admin123
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-left justify-start bg-white border-black text-black hover:bg-gray-50 hover:border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => setFormData({ email: 'seller@test.com', password: 'seller123' })}
            >
              Seller: seller@test.com / seller123
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
