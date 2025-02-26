import { useEffect, useRef } from 'react';

interface RotatingArrowProps {
  videoTime: number;
  duration: number;
}

export default function RotatingArrow({ videoTime, duration }: RotatingArrowProps) {
  const rotation = (videoTime / duration) * 360;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-64 h-64 bg-black/50 rounded-full">
        <svg 
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear'
          }}
          viewBox="0 0 24 24"
        >
          <path 
            fill="white" 
            stroke="white"
            strokeWidth="2"
            d="M12 3L20 11H15V21H9V11H4L12 3Z"
          />
        </svg>
      </div>
    </div>
  );
}
