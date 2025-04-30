import { useState, useRef, useEffect } from 'react';
import { Diff } from 'lucide-react';

interface SplitScreenPreviewProps {
  originalImage: string;
  previewImage: string;
  alt?: string;
}

const SplitScreenPreview = ({ 
  originalImage, 
  previewImage, 
  alt = 'Image preview' 
}: SplitScreenPreviewProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain to 10-90% to prevent slider from going off-screen
    const clampedPosition = Math.max(10, Math.min(90, newPosition));
    setSliderPosition(clampedPosition);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPosition = ((touch.clientX - containerRect.left) / containerRect.width) * 100;
    
    const clampedPosition = Math.max(10, Math.min(90, newPosition));
    setSliderPosition(clampedPosition);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="relative max-w-full max-h-full"
      ref={containerRef}
    >
      <div className="relative w-full overflow-hidden" style={{ height: '400px' }}>
        {/* Before Image (Background) */}
        <img 
          src={originalImage}
          alt={`Original ${alt}`}
          className="w-full h-full object-contain"
        />
        
        {/* After Image (Foreground with clip) */}
        <div 
          className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-4 border-white"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={previewImage} 
            alt={`Edited ${alt}`}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Slider Control */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize transform -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Diff className="text-primary" size={16} />
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-primary bg-opacity-90 text-white px-2 py-1 rounded text-sm">
          Preview
        </div>
      </div>
    </div>
  );
};

export default SplitScreenPreview;
