// Service to fetch country data with their dial codes
class CountriesService {
  constructor() {
    this.baseURL = 'https://restcountries.com/v3.1';
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Convert country code to flag emoji
  getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🏳️';

    // Convert letters to regional codepoints
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));

    try {
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      // Fallback in case of conversion error
      return '🏳️';
    }
  }

  // Fetch all countries from REST Countries API
  async fetchAllCountries() {
    try {
      // Check cache
      const cached = this.getCachedData('all_countries');
      if (cached) {
        return cached;
      }

      const response = await fetch(`${this.baseURL}/all?fields=name,cca2,flags,idd`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const countries = await response.json();

      // Transform data and add dial codes
      const processedCountries = countries.map(country => ({
        code: country.cca2,
        name: country.name.common,
        nativeName: country.name.nativeName?.[Object.keys(country.name.nativeName)[0]]?.common || country.name.common,
        flag: this.getFlagEmoji(country.cca2),
        dialCode: this.getDialCode(country.cca2, country.idd),
        format: this.getPhoneFormat(country.cca2)
      }));

      // Sort by country name
      processedCountries.sort((a, b) => a.name.localeCompare(b.name));

      // Cache
      this.setCachedData('all_countries', processedCountries);

      return processedCountries;
    } catch (error) {
      // Return fallback data
      return this.getFallbackCountries();
    }
  }

  // Get dial code
  getDialCode(countryCode, idd) {
    // Use API data if available
    if (idd && idd.root && idd.suffixes && idd.suffixes.length > 0) {
      return idd.root + idd.suffixes[0];
    }

    // Fallback to our local database
    const dialCodes = {
      'AF': '+93', 'AL': '+355', 'DZ': '+213', 'BE': '+32', 'BF': '+226',
      'CM': '+237', 'CA': '+1', 'CF': '+236', 'TD': '+235', 'CG': '+242',
      'CD': '+243', 'CI': '+225', 'FR': '+33', 'GA': '+241', 'DE': '+49',
      'IT': '+39', 'MA': '+212', 'ML': '+223', 'NE': '+227', 'SN': '+221',
      'ES': '+34', 'CH': '+41', 'TN': '+216', 'GB': '+44', 'US': '+1'
    };

    return dialCodes[countryCode] || '+1';
  }

  // Get phone number format
  getPhoneFormat(countryCode) {
    const formats = {
      'AF': 'XX XXX XXXX', 'AL': 'XXX XXX XXX', 'DZ': 'XXX XX XX XX',
      'BE': 'XXX XX XX XX', 'BF': 'XX XX XX XX', 'CM': 'XXXXX XXXX',
      'CA': 'XXX XXX XXXX', 'CF': 'XX XX XX XX', 'TD': 'XX XX XX XX',
      'CG': 'XX XXX XXXX', 'CD': 'XXX XXX XXX', 'CI': 'XX XX XX XX',
      'FR': 'X XX XX XX XX', 'GA': 'X XX XX XX', 'DE': 'XXXX XXXXXXXX',
      'IT': 'XXX XXX XXXX', 'MA': 'XXX XXX XXX', 'ML': 'XX XX XX XX',
      'NE': 'XX XX XX XX', 'SN': 'XX XXX XX XX', 'ES': 'XXX XXX XXX',
      'CH': 'XX XXX XX XX', 'TN': 'XX XXX XXX', 'GB': 'XXXX XXX XXXX',
      'US': 'XXX XXX XXXX'
    };

    return formats[countryCode] || 'XXX XXX XXXX';
  }

  // Fallback data in case of API error
  getFallbackCountries() {
    const fallbackData = [
      { code: 'CM', name: 'Cameroon', nativeName: 'Cameroun', dialCode: '+237', format: 'XXXXX XXXX' },
      { code: 'FR', name: 'France', nativeName: 'France', dialCode: '+33', format: 'X XX XX XX XX' },
      { code: 'CI', name: 'Côte d\'Ivoire', nativeName: 'Côte d\'Ivoire', dialCode: '+225', format: 'XX XX XX XX' },
      { code: 'SN', name: 'Senegal', nativeName: 'Sénégal', dialCode: '+221', format: 'XX XXX XX XX' },
      { code: 'MA', name: 'Morocco', nativeName: 'Maroc', dialCode: '+212', format: 'XXX XXX XXX' },
      { code: 'TN', name: 'Tunisia', nativeName: 'Tunisie', dialCode: '+216', format: 'XX XXX XXX' },
      { code: 'DZ', name: 'Algeria', nativeName: 'Algérie', dialCode: '+213', format: 'XXX XX XX XX' },
      { code: 'BF', name: 'Burkina Faso', nativeName: 'Burkina Faso', dialCode: '+226', format: 'XX XX XX XX' },
      { code: 'ML', name: 'Mali', nativeName: 'Mali', dialCode: '+223', format: 'XX XX XX XX' },
      { code: 'NE', name: 'Niger', nativeName: 'Niger', dialCode: '+227', format: 'XX XX XX XX' },
      { code: 'TD', name: 'Chad', nativeName: 'Tchad', dialCode: '+235', format: 'XX XX XX XX' },
      { code: 'GA', name: 'Gabon', nativeName: 'Gabon', dialCode: '+241', format: 'X XX XX XX' },
      { code: 'CG', name: 'Congo', nativeName: 'Congo', dialCode: '+242', format: 'XX XXX XXXX' },
      { code: 'CD', name: 'Congo (DRC)', nativeName: 'RD Congo', dialCode: '+243', format: 'XXX XXX XXX' },
      { code: 'CF', name: 'Central African Republic', nativeName: 'Centrafrique', dialCode: '+236', format: 'XX XX XX XX' },
      { code: 'BE', name: 'Belgium', nativeName: 'Belgique', dialCode: '+32', format: 'XXX XX XX XX' },
      { code: 'CH', name: 'Switzerland', nativeName: 'Suisse', dialCode: '+41', format: 'XX XXX XX XX' },
      { code: 'CA', name: 'Canada', nativeName: 'Canada', dialCode: '+1', format: 'XXX XXX XXXX' },
      { code: 'US', name: 'United States', nativeName: 'États-Unis', dialCode: '+1', format: 'XXX XXX XXXX' },
      { code: 'GB', name: 'United Kingdom', nativeName: 'Royaume-Uni', dialCode: '+44', format: 'XXXX XXX XXXX' },
      { code: 'DE', name: 'Germany', nativeName: 'Allemagne', dialCode: '+49', format: 'XXXX XXXXXXXX' },
      { code: 'IT', name: 'Italy', nativeName: 'Italie', dialCode: '+39', format: 'XXX XXX XXXX' },
      { code: 'ES', name: 'Spain', nativeName: 'Espagne', dialCode: '+34', format: 'XXX XXX XXX' }
    ];

    // Add flag emojis to fallback data
    return fallbackData.map(country => ({
      ...country,
      flag: this.getFlagEmoji(country.code)
    }));
  }

  // Cache methods
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
const countriesService = new CountriesService();



export default countriesService;
