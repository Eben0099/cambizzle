import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Important !
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, error: serverError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    clearError();

    let hasError = false;
    const newErrors = {};

    if (!phone) {
      newErrors.phone = 'Phone number is required';
      hasError = true;
    } else if (!isValidPhoneNumber(phone)) {
      newErrors.phone = 'Invalid phone number';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ phone, password }); // ton contexte doit accepter phone maintenant
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // géré par le contexte
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      {/* Container principal - responsive */}
      <div className="w-full max-w-md">
        {/* Logo + Nom */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#D6BA69] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-black">C</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              Cambizzle
            </span>
          </Link>

          <h1 className="mt-8 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card du formulaire */}
        <Card className="bg-white/90 backdrop-blur shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur serveur */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
                  {serverError}
                </div>
              )}

              {/* Champ téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="CM"
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  className={`phone-input-custom ${errors.phone ? 'error' : ''}`}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#D6BA69]'
                    } focus:outline-none focus:ring-2 focus:ring-[#D6BA69]/20 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#D6BA69] rounded focus:ring-[#D6BA69]"
                  />
                  <span className="text-gray-700">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-medium text-[#D6BA69] hover:text-[#D6BA69]/80 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Bouton principal */}
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full bg-[#D6BA69] hover:bg-[#c5a55d] text-black font-semibold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-100"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Lien inscription */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#D6BA69] hover:text-[#c5a55d] transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Style custom pour react-phone-number-input */}
      <style jsx>{`
        .phone-input-custom :global(.PhoneInputInput) {
          height: 52px;
          padding-left: 12px;
          border-radius: 12px;
          border: 1px solid ${errors.phone ? '#ef4444' : '#d1d5db'};
          outline: none;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .phone-input-custom :global(.PhoneInputInput:focus) {
          border-color: #d6ba69;
          box-shadow: 0 0 0 3px rgba(214, 186, 105, 0.15);
        }
        .phone-input-custom.error :global(.PhoneInputInput) {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Login;