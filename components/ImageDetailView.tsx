
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { CloseIcon } from './icons/CloseIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { Spinner } from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageDetailViewProps {
  image: GeneratedImage;
  originalImageSrc: string;
  onClose: () => void;
  onRegenerate: (vibe: string) => Promise<GeneratedImage | null>;
}

export const ImageDetailView: React.FC<ImageDetailViewProps> = ({ image, originalImageSrc, onClose, onRegenerate }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // This is a simplification. In a real app, you'd have the original vibe available.
    const vibe = "the same style";
    await onRegenerate(vibe);
    setIsRegenerating(false);
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.base64}`;
    link.download = `staged-room-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col relative">
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-xl font-bold">Design Preview</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <CloseIcon className="w-8 h-8" />
            </button>
        </header>
        
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
            <div className="w-full h-full aspect-video bg-black rounded-lg relative overflow-hidden">
                {isRegenerating ? (
                <div className="w-full h-full flex items-center justify-center">
                    <Spinner text="Creating a new variation..." />
                </div>
                ) : (
                <BeforeAfterSlider
                    beforeSrc={originalImageSrc}
                    afterSrc={`data:image/png;base64,${image.base64}`}
                />
                )}
            </div>
        </main>

        <footer className="flex flex-wrap gap-4 justify-center p-4 border-t border-slate-700 flex-shrink-0">
            <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
            >
                <RefreshIcon className="w-5 h-5"/> Regenerate
            </button>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors duration-200"
            >
                <DownloadIcon className="w-5 h-5"/> Download
            </button>
        </footer>
      </div>
    </div>
  );
};