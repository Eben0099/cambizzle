import React from 'react';

/**
 * Composant de filtre type Select (dropdown)
 */
const FilterSelect = ({ filter, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {filter.name}
        {filter.is_required ? <span className="text-red-500 ml-1">*</span> : ''}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(filter.id, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] bg-white"
        required={filter.is_required}
      >
        <option value=""></option>
        {filter.options?.map((option, index) => (
          <option key={option.id || `option-${index}`} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;
