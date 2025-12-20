import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, Move } from 'lucide-react';
import { validateImageFile } from '../../utils/helpers';
import Button from './Button';

const ImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  className = ''
}) => {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(`${t('imageUpload.errors')}:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      
      // Convert files to URLs for preview
      const newImages = filesToAdd.map(file => ({
        file,
        url: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      }));

      onImagesChange([...images, ...newImages]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-[#D6BA69] bg-[#D6BA69]/10' 
              : 'border-gray-300 hover:border-[#D6BA69]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('imageUpload.addYourPhotos')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('imageUpload.dragAndDrop')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {t('imageUpload.imagesCount', { count: images.length, max: maxImages })}
          </p>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto"
          >
            {t('imageUpload.selectFiles')}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t('imageUpload.adPhotos', { count: images.length })}
            </h4>
            {images.length > 1 && (
              <p className="text-sm text-gray-500">
                {t('imageUpload.dragToReorder')}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  index === 0 
                    ? 'border-[#D6BA69] ring-2 ring-[#D6BA69]/20' 
                    : 'border-gray-200 hover:border-[#D6BA69]'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  {/* Main Photo Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-[#D6BA69] text-black px-2 py-1 rounded text-xs font-medium">
                      {t('imageUpload.mainPhoto')}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                      title={t('imageUpload.delete')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Drag Handle */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-move">
                        <Move className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Position indicator */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Add More Button */}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#D6BA69] hover:text-[#D6BA69] transition-colors cursor-pointer"
              >
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">{t('imageUpload.add')}</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Tips */}
      {images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {t('imageUpload.tipsTitle')}
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t('imageUpload.tip1')}</li>
            <li>• {t('imageUpload.tip2')}</li>
            <li>• {t('imageUpload.tip3')}</li>
            <li>• {t('imageUpload.tip4')}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
