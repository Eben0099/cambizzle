import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../hooks/useDebounce';
import { useWeglotTranslate } from '../../hooks/useWeglotRetranslate';

// Composant pour traduire le nom du filtre
const TranslatedFilterName = ({ name }) => {
  const { translatedText } = useWeglotTranslate(name || '');
  return <>{translatedText || name}</>;
};

/**
 * Composant de filtre type Text avec debounce
 */
const FilterText = ({ filter, value, onChange }) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value || '');
  const { translatedText: translatedName } = useWeglotTranslate(filter.name || '');

  // Synchroniser la valeur locale avec la prop value
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Fonction debouncée pour appeler onChange
  const debouncedOnChange = useDebounce((newValue) => {
    onChange(filter.id, newValue);
  }, 500);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TranslatedFilterName name={filter.name} />
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={`${t('filters.enter')} ${translatedName || filter.name}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
        required={filter.is_required}
      />
    </div>
  );
};

export default FilterText;
