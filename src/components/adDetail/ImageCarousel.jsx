import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Expand, Loader2 } from 'lucide-react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadedImagesRef = useRef(new Set());
  const prevImagesRef = useRef(null);

  // Reset state only when images array content actually changes (new ad)
  useEffect(() => {
    const imagesKey = images.join('|');
    if (prevImagesRef.current !== imagesKey) {
      prevImagesRef.current = imagesKey;
      setCurrentIndex(0);
      setIsLoading(true);
      loadedImagesRef.current = new Set();
    }
  }, [images]);

  const handleImageLoad = () => {
    loadedImagesRef.current.add(currentIndex);
    setIsLoading(false);
  };

  // Change image - skip loading state if already cached
  const changeImage = (newIndex) => {
    if (!loadedImagesRef.current.has(newIndex)) {
      setIsLoading(true);
    }
    setCurrentIndex(newIndex);
  };

  // Track preloaded images
  const handlePreloadComplete = (index) => {
    loadedImagesRef.current.add(index);
  };

  const nextImage = () => {
    changeImage((currentIndex + 1) % images.length);
  };

  const prevImage = () => {
    changeImage((currentIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    changeImage(index);
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
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[5]">
              <Loader2 className="w-8 h-8 text-[#d6ba69] animate-spin" />
            </div>
          )}
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
          />

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
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${index === currentIndex
                    ? 'border-[#d6ba69] opacity-100'
                    : 'border-gray-200 opacity-60 hover:opacity-80'
                  }`}
                aria-label={`Select image ${index + 1}`}
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

        {/* Preload images - positioned off-screen to force loading */}
        <div className="absolute -left-[9999px] w-0 h-0 overflow-hidden" aria-hidden="true">
          {images.map((image, index) => (
            <img
              key={`preload-${index}`}
              src={image}
              alt=""
              loading="eager"
              onLoad={() => handlePreloadComplete(index)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-full flex items-center justify-center">
            {/* Loading spinner for fullscreen */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="w-12 h-12 text-[#d6ba69] animate-spin" />
              </div>
            )}
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black/60 text-[#D6BA69] hover:text-[#C5A952] p-2 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close fullscreen"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
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
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;