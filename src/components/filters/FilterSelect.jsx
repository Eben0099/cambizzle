import React from 'react';
import { useWeglotTranslate, useWeglotTranslateArray } from '../../hooks/useWeglotRetranslate';

// Composant pour traduire le nom du filtre
const TranslatedFilterName = ({ name }) => {
  const { translatedText } = useWeglotTranslate(name || '');
  return <>{translatedText || name}</>;
};

/**
 * Composant de filtre type Select (dropdown)
 */
const FilterSelect = ({ filter, value, onChange }) => {
  // Traduire les options
  const { translatedItems: translatedOptions } = useWeglotTranslateArray(
    filter.options?.map(opt => ({ ...opt, displayValue: opt.value })) || [],
    'displayValue'
  );

  const optionsToDisplay = translatedOptions.length > 0 ? translatedOptions : filter.options || [];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedFilterName name={filter.name} />
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(filter.id, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] bg-white cursor-pointer"
        required={filter.is_required}
      >
        <option value=""></option>
        {optionsToDisplay.map((option, index) => (
          <option key={option.id || `option-${index}`} value={option.original_displayValue || option.value}>
            {option.displayValue || option.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;
