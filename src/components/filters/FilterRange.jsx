import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Composant de filtre type Range (min et max) avec debounce
 */
const FilterRange = ({ filter, value = {}, onChange }) => {
  const [localValue, setLocalValue] = useState(value || {});

  // Synchroniser la valeur locale avec la prop value
  useEffect(() => {
    setLocalValue(value || {});
  }, [value]);

  // Fonction debouncée pour appeler onChange
  const debouncedOnChange = useDebounce((newValue) => {
    onChange(filter.id, newValue);
  }, 500);

  const handleChange = (type, newValue) => {
    const updatedValue = {
      ...localValue,
      [type]: newValue
    };
    setLocalValue(updatedValue);
    debouncedOnChange(updatedValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {filter.name}
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="number"
            value={localValue?.min || ''}
            onChange={(e) => handleChange('min', e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            min="0"
          />
        </div>
        <div>
          <input
            type="number"
            value={localValue?.max || ''}
            onChange={(e) => handleChange('max', e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterRange;
