import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, Loader2, Search } from 'lucide-react';
import countriesService from '../../services/countriesService';

const PhoneInput = ({
  label,
  value = '',
  onChange,
  error,
  placeholder = "Phone number",
  required = false,
  className = ''
}) => {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('CM');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userLocale, setUserLocale] = useState('fr-FR');
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputRef, setSearchInputRef] = useState(null);
  const dropdownRef = useRef(null);

  // Load countries from API
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoadingCountries(true);
        setCountriesError(null);

        const countriesData = await countriesService.fetchAllCountries();

        // Add localized names
        const countriesWithLocalization = countriesData.map(country => ({
          ...country,
          localizedName: new Intl.DisplayNames([userLocale], { type: 'region' }).of(country.code) || country.name
        }));

        setCountries(countriesWithLocalization);
      } catch (error) {
        console.error('Error loading countries:', error);
        setCountriesError('Error loading countries');
        // Use fallback data
        const fallbackCountries = countriesService.getFallbackCountries();
        const countriesWithLocalization = fallbackCountries.map(country => ({
          ...country,
          localizedName: new Intl.DisplayNames([userLocale], { type: 'region' }).of(country.code) || country.name
        }));
        setCountries(countriesWithLocalization);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountries();
  }, [userLocale]);

  // Clear cache to force reload (useful for tests)
  const clearCountriesCache = () => {
    countriesService.clearCache();
    loadCountries();
  };

  // Expose cache clearing method (for development)
  if (process.env.NODE_ENV === 'development') {
    window.clearCountriesCache = clearCountriesCache;
  }

  const currentCountry = countries.length > 0
    ? (countries.find(c => c.code === selectedCountry) || countries.find(c => c.code === 'CM') || countries[0])
    : null;

  // Automatic country detection based on browser locale
  useEffect(() => {
    const detectUserCountry = () => {
      try {
        // Detect user's locale
        const userLocales = navigator.languages || [navigator.language || 'en-US'];
        const primaryLocale = userLocales[0];

        // Extract country code from locale (ex: 'fr-FR' -> 'FR', 'en-US' -> 'US')
        const countryCode = primaryLocale.split('-')[1] || primaryLocale.toUpperCase();

        setUserLocale(primaryLocale);

        // Wait for countries to be loaded
        if (countries.length === 0) {
          setSelectedCountry('CM'); // Use Cameroon by default while waiting
          return;
        }

        // Search for matching country in our list
        const detectedCountry = countries.find(country =>
          country.code === countryCode ||
          country.code === primaryLocale.toUpperCase().slice(0, 2)
        );

        // If a country is detected, use it as default, otherwise use Cameroon
        setSelectedCountry(detectedCountry ? detectedCountry.code : 'CM');
      } catch (error) {
        // In case of error, use Cameroon by default
        setSelectedCountry('CM');
        setUserLocale('fr-CM');
      }
    };

    detectUserCountry();
  }, [countries]);

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize with existing value
  useEffect(() => {
    if (value && countries.length > 0) {
      console.log('📞 Initialisation PhoneInput avec valeur:', value);
      console.log('🌍 Pays disponibles:', countries.length);

      // Try to parse existing number with dial code
      let detectedCountry = null;
      let localNumber = value;

      // Sort countries by dial code length (longest first) to match longer codes first
      const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);

      for (const country of sortedCountries) {
        if (value.startsWith(country.dialCode)) {
          detectedCountry = country;
          localNumber = value.substring(country.dialCode.length);
          console.log('✅ Pays détecté:', country.name, 'Indicatif:', country.dialCode, 'Numéro local:', localNumber);
          break;
        }
      }

      if (detectedCountry) {
        setSelectedCountry(detectedCountry.code);
        setPhoneNumber(localNumber);
        console.log('🔄 État mis à jour - Pays:', detectedCountry.code, 'Numéro:', localNumber);
      } else {
        console.log('❌ Aucun pays détecté pour le numéro:', value);
        setPhoneNumber(value); // Keep full number if no country detected
      }
    } else if (!value) {
      // Reset if no value
      setPhoneNumber('');
    }
  }, [value, countries]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.code);
    setIsCountryDropdownOpen(false);
    
    // Update full value
    const fullNumber = country.dialCode + phoneNumber;
    onChange && onChange({
      target: {
        name: 'phone',
        value: fullNumber
      }
    });
  };

  const handlePhoneNumberChange = (e) => {
    const number = e.target.value.replace(/[^\d]/g, ''); // Keep only digits
    setPhoneNumber(number);
    
    // Update full value
    const fullNumber = currentCountry.dialCode + number;
    onChange && onChange({
      target: {
        name: 'phone',
        value: fullNumber
      }
    });
  };

  const formatPhoneNumber = (number) => {
    if (!currentCountry || !number) return number;

    const format = currentCountry.format;
    let formatted = '';
    let numberIndex = 0;

    // Apply country-specific format
    for (let i = 0; i < format.length && numberIndex < number.length; i++) {
      const char = format[i];
      if (char === 'X') {
        formatted += number[numberIndex];
        numberIndex++;
      } else {
        formatted += char;
      }
    }

    // Add remaining digits without specific formatting
    if (numberIndex < number.length) {
      formatted += number.slice(numberIndex);
    }

    return formatted;
  };

  const validatePhoneNumber = (country, number) => {
    if (!country || !number) return false;

    const countryData = countries.find(c => c.code === country);
    if (!countryData) return number.length >= 7 && number.length <= 15;

    // Count required digits according to format
    const requiredDigits = (countryData.format.match(/X/g) || []).length;

    // Validation based on defined format
    return number.length >= requiredDigits - 2 && number.length <= requiredDigits + 2;
  };

  // Filter countries according to search
  const filteredCountries = countries.filter(country => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.localizedName.toLowerCase().includes(query) ||
      country.nativeName.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.dialCode.includes(searchQuery)
    );
  });

  const isValid = phoneNumber ? validatePhoneNumber(selectedCountry, phoneNumber) : true;

  // Handler to open/close dropdown
  const handleDropdownToggle = () => {
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
    if (!isCountryDropdownOpen) {
      // Reset search when opening
      setSearchQuery('');
      // Focus on search field after short delay
      setTimeout(() => {
        if (searchInputRef) {
          searchInputRef.focus();
        }
      }, 100);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="flex">
          {/* Country selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleDropdownToggle}
              disabled={isLoadingCountries}
              className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingCountries ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-500" />
              ) : (
                currentCountry && <span className="text-lg mr-2">{currentCountry.flag}</span>
              )}
              <span className="text-sm font-medium text-gray-700 mr-1">
                {isLoadingCountries ? '...' : (phoneNumber ? '' : (currentCountry?.dialCode || '+237'))}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Countries dropdown */}
            {isCountryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                {/* Search field */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={(ref) => setSearchInputRef(ref)}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a country..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                    />
                  </div>
                </div>

                {/* Filtered countries list */}
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingCountries ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-left"
                      >
                        <span className="text-lg mr-3">{country.flag}</span>
                        <span className="flex-1 text-sm text-gray-900">{country.localizedName}</span>
                        <span className="text-sm text-gray-500 font-medium">
                          {country.dialCode}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-4 px-3 text-center text-sm text-gray-500">
                      No country found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone number input field */}
          <input
            type="tel"
            value={formatPhoneNumber(phoneNumber)}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            required={required}
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] ${
              error || (!isValid && phoneNumber) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
            }`}
          />
        </div>

        {/* Phone icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Phone className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Error or help messages */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {countriesError && (
        <p className="text-sm text-orange-600">
          ⚠️ Unable to load country list. Using local data.
        </p>
      )}

      {!isValid && phoneNumber && !error && (
        <p className="text-sm text-red-600">
          Invalid phone number for {currentCountry?.localizedName || currentCountry?.name}
        </p>
      )}

      {!phoneNumber && currentCountry && !isLoadingCountries && (
        <p className="text-xs text-gray-500">
          Format: {currentCountry.dialCode} followed by local number ({currentCountry.format?.replace(/X/g, '0') || 'XXX XXX XXXX'})
        </p>
      )}

      {isLoadingCountries && (
        <p className="text-xs text-gray-500">
          Loading countries...
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
