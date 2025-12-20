import React from 'react';
import { useWeglotTranslate, useWeglotTranslateArray } from '../../hooks/useWeglotRetranslate';

// Composant pour traduire le nom du filtre
const TranslatedFilterName = ({ name }) => {
  const { translatedText } = useWeglotTranslate(name || '');
  return <>{translatedText || name}</>;
};

// Composant pour traduire une option
const TranslatedOption = ({ text }) => {
  const { translatedText } = useWeglotTranslate(text || '');
  return <>{translatedText || text}</>;
};

/**
 * Composant de filtre type Checkbox (sélection multiple)
 */
const FilterCheckbox = ({ filter, value = [], onChange }) => {
  const handleCheckboxChange = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(filter.id, newValues);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedFilterName name={filter.name} />
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filter.options?.map((option) => (
          <label key={option.id} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              value={option.value}
              checked={Array.isArray(value) && value.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="w-4 h-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              <TranslatedOption text={option.value} />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterCheckbox;
