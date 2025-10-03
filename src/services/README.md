# Services

This folder contains the application's utility services.

## CountriesService

Service to fetch and manage country data with their dial codes.

### Features

- **REST Countries API** : Automatic retrieval of data for all countries worldwide
- **Smart cache** : Data caching for 24h to avoid repeated calls
- **Error handling** : Fallback to local data in case of network error
- **Dial codes** : Country-specific phone number formats
- **Internationalization** : Country names localized according to user's language

### Usage

```javascript
import countriesService from './services/countriesService';

// Fetch all countries
const countries = await countriesService.fetchAllCountries();

// Returned data includes:
/*
{
  code: 'FR',                    // ISO 2-letter code
  name: 'France',               // English name
  nativeName: 'France',         // Name in local language
  flag: '🇫🇷',                  // Flag emoji
  dialCode: '+33',              // Dial code
  format: 'X XX XX XX XX',      // Number format
  localizedName: 'France'       // Localized name according to locale
}
*/

// Clear cache if needed
countriesService.clearCache();
```

### Phone number formats

The service defines specific formats for each country:
- `X` represents a digit
- Spaces and special characters are preserved

Examples:
- France: `+33 X XX XX XX XX`
- United States: `+1 XXX XXX XXXX`
- Cameroon: `+237 XXXXX XXXX`

### Error handling

If the REST Countries API is not available, the service automatically uses local fallback data including the most common African and European countries.

### Cache

- **Duration** : 24 hours
- **Key** : `all_countries`
- **Clear method** : `clearCache()`

### REST Countries API

Documentation: https://restcountries.com/

Fields used:
- `name.common` : Country name
- `name.nativeName` : Name in local language
- `cca2` : ISO 2-letter code
- `flags.svg/png` : Country flag
- `idd` : Dial code
