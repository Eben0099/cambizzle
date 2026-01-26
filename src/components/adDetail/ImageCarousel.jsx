import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set([0]));
  const prevImagesRef = useRef(null);

  // Reset state only when images array content actually changes (new ad)
  useEffect(() => {
    const imagesKey = images.join('|');
    if (prevImagesRef.current !== imagesKey) {
      prevImagesRef.current = imagesKey;
      setCurrentIndex(0);
      setLoadedImages(new Set([0]));
    }
  }, [images]);

  // Mark image as loaded
  const handleImageLoad = (index) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  // Navigation functions - instant, no loading state
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);

  // Handle swipe gestures
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        {/* Main image container */}
        <div
          className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* All images stacked - only current one visible */}
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]'
              }`}
            >
              {/* Placeholder background */}
              <div className="absolute inset-0 bg-gray-200" />

              {/* Actual image */}
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                  loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(index)}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 sm:p-2 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 sm:p-2 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer z-10"
            aria-label="View in fullscreen"
          >
            <Expand className="w-5 h-5" />
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  index === currentIndex
                    ? 'border-[#d6ba69] opacity-100 scale-105'
                    : 'border-gray-200 opacity-60 hover:opacity-90 hover:border-gray-300'
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-black/60 text-white hover:text-[#D6BA69] p-2 rounded-full transition-colors cursor-pointer z-30"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter in fullscreen */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-30">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Main fullscreen image container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* All images stacked */}
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
                  index === currentIndex ? 'opacity-100 z-[2]' : 'opacity-0 z-[1] pointer-events-none'
                }`}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading={index <= currentIndex + 1 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows in fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-[#D6BA69] hover:text-[#C5A952] p-1.5 sm:p-3 rounded-full transition-colors cursor-pointer z-20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-[#D6BA69] hover:text-[#C5A952] p-1.5 sm:p-3 rounded-full transition-colors cursor-pointer z-20"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          {/* Thumbnail strip in fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/60 p-2 rounded-lg z-30 max-w-[90vw] overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    index === currentIndex
                      ? 'border-[#D6BA69] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
