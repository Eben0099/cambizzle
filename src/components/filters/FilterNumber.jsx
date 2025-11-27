import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Composant de filtre type Number avec debounce
 */
const FilterNumber = ({ filter, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || '');

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
        {filter.name}
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        placeholder={`Enter ${filter.name}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
        required={filter.is_required}
        min="0"
      />
    </div>
  );
};

export default FilterNumber;
