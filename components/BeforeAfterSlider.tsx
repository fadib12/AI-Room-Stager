
import React, { useState } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeSrc, afterSrc }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-full select-none">
      <img
        src={beforeSrc}
        alt="Before"
        className="absolute w-full h-full object-contain"
      />
      <div
        className="absolute w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterSrc}
          alt="After"
          className="w-full h-full object-contain"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full h-9 w-9 flex items-center justify-center shadow-lg">
           <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0"
      />
    </div>
  );
};
