import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
      );
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    };
  });
}

export default function ImageUploader({ onUpload, aspect = 1, label = "Upload Image", className = "" }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setUploading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], 'upload.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onUpload(data.url);
      setShowModal(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <>
      <div className={className}>
        <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-maroon-50 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400 rounded-xl border-2 border-dashed border-maroon-200 dark:border-charcoal-700 hover:border-maroon-400 dark:hover:border-gold-500 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl w-[90vw] max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-maroon-100 dark:border-charcoal-800">
              <h3 className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">
                {t('imageUploader.cropAdjust')}
              </h3>
              <button onClick={handleClose} className="text-maroon-400 hover:text-maroon-600 dark:hover:text-cream-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full h-72 bg-maroon-50 dark:bg-charcoal-800">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="px-5 py-4 space-y-4">
              {/* Zoom */}
              <div className="flex items-center space-x-3">
                <ZoomOut className="w-4 h-4 text-maroon-400 dark:text-charcoal-600" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-maroon-200 dark:bg-charcoal-700 rounded-full appearance-none cursor-pointer accent-maroon-600 dark:accent-gold-500"
                />
                <ZoomIn className="w-4 h-4 text-maroon-400 dark:text-charcoal-600" />
              </div>

              {/* Rotation */}
              <div className="flex items-center space-x-3">
                <RotateCw className="w-4 h-4 text-maroon-400 dark:text-charcoal-600" />
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-maroon-200 dark:bg-charcoal-700 rounded-full appearance-none cursor-pointer accent-maroon-600 dark:accent-gold-500"
                />
                <span className="text-xs text-maroon-400 dark:text-charcoal-600 w-8 text-right">{rotation}°</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 text-maroon-500 dark:text-charcoal-400 hover:text-maroon-700 dark:hover:text-cream-100 text-sm font-medium transition-colors"
                >
                  {t('imageUploader.cancel')}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-6 py-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 rounded-full font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{uploading ? t('imageUploader.uploading') : t('imageUploader.upload')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
