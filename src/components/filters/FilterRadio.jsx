import React from 'react';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';

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
 * Composant de filtre type Radio
 */
const FilterRadio = ({ filter, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedFilterName name={filter.name} />
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <div className="space-y-2">
        {filter.options?.map((option) => (
          <label key={option.id} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={`filter-${filter.id}`}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="w-4 h-4 text-[#D6BA69] focus:ring-[#D6BA69] border-gray-300"
              required={filter.is_required}
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

export default FilterRadio;
