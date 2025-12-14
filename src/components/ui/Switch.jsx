import React from "react";

/**
 * Simple Switch component (toggle)
 * Props:
 * - checked: boolean
 * - onChange: function
 * - disabled: boolean (optional)
 */
export const Switch = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#D6BA69]' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
    />
  </button>
);

export default Switch;
