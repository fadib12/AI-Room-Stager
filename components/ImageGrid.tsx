
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-center mb-6">Your Designs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer group relative"
            onClick={() => onImageClick(image)}
          >
            <img
              src={`data:image/png;base64,${image.base64}`}
              alt="Generated room design"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white font-semibold">View Details</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
