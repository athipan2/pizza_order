import { X, ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDriveUrl } from '../utils/imageUtils';

function ImageModal({ isOpen, image, title, onClose, highRes = false }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ใช้รูปความละเอียดสูงตามเงื่อนไข
  const displayImage = highRes ? formatDriveUrl(image, 'full') : image;

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, image]);

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
          className="w-full max-h-[60vh] overflow-hidden flex items-center justify-center rounded-[2rem] sm:rounded-[3rem] border-4 sm:border-8 border-white shadow-2xl bg-white/5 relative min-h-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <Loader2 size={48} className="animate-spin text-primary-400" />
              <p className="text-sm font-bold uppercase tracking-widest animate-pulse">กำลังโหลดรูปภาพความละเอียดสูง...</p>
            </div>
          )}

          <img
            src={displayImage}
            alt={title}
            className={`max-w-full max-h-[60vh] object-contain transition-all duration-300 cursor-zoom-in ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onDoubleClick={handleReset}
          />
        </div>

        {/* Large Close Button Below Image */}
        <div className="mt-6 w-full flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-5 bg-white text-primary-950 font-black text-xl rounded-2xl shadow-2xl hover:scale-105 active:scale-90 transition-all flex items-center justify-center gap-3 group border-b-8 border-gray-200"
          >
            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            ปิดรูปภาพนี้
          </button>

          {title && (
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg text-white">{title}</h3>
              <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
                 <span className="w-8 h-px bg-white/40"></span>
                 <p className="text-sm font-bold uppercase tracking-widest text-white">Double Click to Reset</p>
                 <span className="w-8 h-px bg-white/40"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
