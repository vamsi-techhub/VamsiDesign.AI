import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  originalUrl: string;
  generatedUrl: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ originalUrl, generatedUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const position = ((clientX - containerRect.left) / containerRect.width) * 100;

    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full select-none overflow-hidden rounded-xl border border-slate-700 bg-black"
      ref={containerRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img 
        src={generatedUrl} 
        alt="After Design" 
        className="absolute inset-0 w-full h-full object-contain" 
        draggable={false}
      />

      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={originalUrl} 
          alt="Before Design" 
          className="absolute inset-0 w-full h-full object-contain max-w-none" 
          style={{ width: containerRef.current?.clientWidth || '100%' }} // Ensure scaling matches
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200">
           <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
           </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 bg-lumina-500/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
        AFTER
      </div>
    </div>
  );
};

export default BeforeAfterSlider;