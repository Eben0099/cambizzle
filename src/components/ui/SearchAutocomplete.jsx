import React, { useState, useCallback } from 'react';
import Autosuggest from 'react-autosuggest';
import { Search } from 'lucide-react';
import { adsService } from '../../services/adsService';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SearchAutocomplete = ({
  value,
  onChange,
  onSearch,
  placeholder,
  className = ''
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const getSuggestions = async (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if (inputLength === 0) {
      return [];
    }

    try {
      // Use the existing service to get ads matching the search term
      // We limit to 5 results for the autocomplete dropdown
      const response = await adsService.getAdsFromAPI(1, 5, inputValue);

      // Extract titles and remove duplicates
      const uniqueTitles = [...new Set(
        response.ads.map(ad => ad.title)
      )];

      return uniqueTitles.map(title => ({ name: title }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const onSuggestionsFetchRequested = useCallback(async ({ value }) => {
    const results = await getSuggestions(value);
    setSuggestions(results);
  }, []);

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800">
      {suggestion.name}
    </div>
  );

  const onSuggestionSelected = (event, { suggestion }) => {
    // When a suggestion is selected, trigger the search immediately
    onChange(suggestion.name);
    // Optional: trigger search here if desired
    // onSearch(suggestion.name); 
  };

  const inputProps = {
    placeholder: placeholder === undefined ? t('common.search') : placeholder,
    value,
    onChange: (event, { newValue }) => {
      onChange(newValue);
    },
    className: `w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] border-gray-300 ${className}`,
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        onSearch && onSearch();
      }
    }
  };

  const theme = {
    container: 'relative group w-full',
    suggestionsContainer: 'absolute z-50 w-full mt-1 max-h-60 overflow-y-auto',
    suggestionsContainerOpen: 'bg-white shadow-lg rounded-b-lg border border-gray-200',
    suggestionsList: 'list-none m-0 p-0',
    suggestion: 'text-sm'
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
      inputProps={inputProps}
      theme={theme}
    />
  );
};

export default SearchAutocomplete;
