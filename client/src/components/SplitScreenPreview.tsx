import { useRef, useState, useEffect } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setPosition(Math.max(0, Math.min(100, newPosition)));
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && containerRef.current && e.touches[0]) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
      setPosition(Math.max(0, Math.min(100, newPosition)));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden w-full h-full max-h-[600px] select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* Original Image (Left Side) */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ overflow: 'hidden' }}
      >
        <img 
          src={originalImage}
          alt={`Original ${alt}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Processed Image (Right Side) */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ 
          clipPath: `inset(0 0 0 ${position}%)`,
          overflow: 'hidden'
        }}
      >
        <img 
          src={previewImage}
          alt={`Processed ${alt}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Divider */}
      <div 
        className="absolute top-0 bg-white h-full w-1 cursor-ew-resize shadow-lg"
        style={{ 
          left: `${position}%`,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center cursor-ew-resize">
          <div className="flex items-center space-x-[2px]">
            <div className="w-[2px] h-3 bg-gray-400"></div>
            <div className="w-[2px] h-3 bg-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded">
        Original
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded">
        Processed
      </div>
    </div>
  );
};

export default SplitScreenPreview;