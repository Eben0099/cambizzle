import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Modal from './Modal';

const ImageCarousel = ({ images = [], className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Reset zoom and position when modal opens/closes or image changes
    if (isZoomModalOpen) {
      setZoomLevel(1);
      setRotation(0);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [isZoomModalOpen, currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const openZoomModal = () => {
    setIsZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
            onClick={openZoomModal}
          />
          
          {/* Zoom Icon Overlay */}
          <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5" />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  index === currentIndex
                    ? 'border-[#D6BA69] ring-2 ring-[#D6BA69]/20'
                    : 'border-gray-200 hover:border-[#D6BA69]'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={closeZoomModal}
        size="full"
        className="bg-black/95"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeZoomModal}
            className="absolute top-4 right-4 z-50 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Controls */}
          <div className="absolute top-4 left-4 z-50 flex space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotate}
              className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 z-50 bg-black/50 text-white px-3 py-2 rounded-full text-sm">
            {Math.round(zoomLevel * 100)}%
          </div>

          {/* Navigation in Modal */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Image Counter in Modal */}
              <div className="absolute bottom-4 right-4 z-50 bg-black/50 text-white px-3 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Zoomable Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className={`max-w-none transition-transform duration-200 ${
                zoomLevel > 1 ? 'cursor-move' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                maxHeight: zoomLevel === 1 ? '90vh' : 'none',
                maxWidth: zoomLevel === 1 ? '90vw' : 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={zoomLevel === 1 ? handleZoomIn : undefined}
              draggable={false}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm text-center">
            {zoomLevel === 1 ? 'Click to zoom' : 'Drag to move • Scroll to zoom'}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImageCarousel;
