import React from 'react';

const Loader = ({ className = '', text = 'Loading...' }) => (
  <div
    className={`flex flex-col items-center justify-center min-h-screen ${className}`}
    aria-label="Loading content"
  >
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 border-4 border-t-[#D6BA69] border-r-[#D6BA69] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      {/* Inner pulsing circle */}
      <div className="absolute inset-2 bg-[#D6BA69]/20 rounded-full animate-pulse"></div>
      {/* Center dot */}
      <div className="absolute inset-4 bg-[#D6BA69] rounded-full"></div>
    </div>
    {text && (
      <span className="mt-4 text-gray-600 text-base font-semibold tracking-tight">
        {text}
      </span>
    )}
  <style>{`
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.3;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.5;
        }
        100% {
          transform: scale(1);
          opacity: 0.3;
        }
      }

      .animate-spin {
        animation: spin 1.2s linear infinite;
      }

      .animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default Loader;