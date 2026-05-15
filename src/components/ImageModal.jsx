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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-950/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-full flex flex-col items-center animate-in zoom-in-90 duration-500">
        {/* Header/Controls */}
        <div className="absolute top-[-60px] right-0 flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
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
          className="w-full h-full overflow-hidden flex items-center justify-center rounded-[3rem] border-8 border-white shadow-2xl bg-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt={title}
            className="max-w-full max-h-[70vh] object-contain transition-transform duration-300 cursor-zoom-in"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
            }}
            onDoubleClick={handleReset}
          />
        </div>

        {/* Caption */}
        {title && (
          <div className="mt-6 text-white text-center animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black tracking-tight drop-shadow-lg">{title}</h3>
            <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
               <span className="w-8 h-px bg-white/40"></span>
               <p className="text-sm font-bold uppercase tracking-widest">Double Click to Reset</p>
               <span className="w-8 h-px bg-white/40"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;
