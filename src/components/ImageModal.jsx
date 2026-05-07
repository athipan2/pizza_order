import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState } from 'react';

function ImageModal({ isOpen, image, title, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !image) return null;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Header/Controls */}
        <div className="absolute top-[-50px] right-0 flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="ซูมออก"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="ซูมเข้า"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="หมุนรูป"
          >
            <RotateCw size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors ml-2"
            title="ปิด"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="w-full h-full overflow-hidden flex items-center justify-center rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt={title}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-out'
            }}
            onDoubleClick={handleReset}
          />
        </div>

        {/* Caption */}
        {title && (
          <div className="mt-4 text-white text-center">
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-gray-400">ดับเบิลคลิกที่รูปเพื่อรีเซ็ตขนาด</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;
