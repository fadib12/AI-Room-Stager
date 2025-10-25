
import React, { useState } from 'react';

interface VibeSelectorProps {
  onGenerate: (vibe: string) => void;
  disabled: boolean;
}

const PRESET_VIBES = [
  'Cozy Scandinavian Living Room',
  'Vibrant Boho Patio',
  'Minimalist Modern Office',
  'Industrial Loft Kitchen',
  'Modern Zen Garden',
  'Rustic Farmhouse Dining',
];

export const VibeSelector: React.FC<VibeSelectorProps> = ({ onGenerate, disabled }) => {
  const [vibe, setVibe] = useState('');

  const handleGenerateClick = () => {
    if (vibe.trim()) {
      onGenerate(vibe.trim());
    }
  };
  
  const handlePresetClick = (preset: string) => {
    setVibe(preset);
    onGenerate(preset);
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="e.g., Modern Zen Garden"
          className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={disabled}
        />
        <button
          onClick={handleGenerateClick}
          disabled={disabled || !vibe.trim()}
          className="bg-purple-600 text-white font-bold py-3 px-6 rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          Generate
        </button>
      </div>
       <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-400 mr-2">Or try a preset:</p>
          {PRESET_VIBES.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full hover:bg-slate-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
    </div>
  );
};