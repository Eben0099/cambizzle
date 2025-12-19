import { useState } from 'react';
import { User } from 'lucide-react';
import { getPhotoUrl } from '../../utils/helpers';

/**
 * Avatar component with fallback to initials
 * @param {string} src - Image URL
 * @param {string} firstName - User's first name (for initials)
 * @param {string} lastName - User's last name (for initials)
 * @param {string} alt - Alt text for image
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} className - Additional CSS classes
 */
const Avatar = ({
  src,
  firstName = '',
  lastName = '',
  alt = '',
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get initials from first and last name
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const hasValidSrc = src && !imageError;
  const photoUrl = src ? getPhotoUrl(src) : null;

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full
        flex items-center justify-center
        overflow-hidden
        bg-gradient-to-br from-[#D6BA69] to-[#c4a855]
        ${className}
      `.trim()}
    >
      {hasValidSrc ? (
        <>
          {/* Show initials while image is loading */}
          {!imageLoaded && (
            <span className="text-black font-semibold absolute">
              {getInitials()}
            </span>
          )}
          <img
            src={photoUrl}
            alt={alt || `${firstName} ${lastName}`}
            className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        </>
      ) : (
        <span className="text-black font-semibold">
          {getInitials() !== '?' ? getInitials() : <User className="w-1/2 h-1/2 text-black" />}
        </span>
      )}
    </div>
  );
};

export default Avatar;
