import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
}

const ACCEPTED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (file && ACCEPTED_MIMETYPES.includes(file.type)) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4 cursor-pointer transition-colors duration-200
        ${isDragActive ? 'border-purple-400 bg-slate-700/50' : 'border-slate-600 hover:border-purple-500 bg-slate-800'}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_MIMETYPES.join(',')}
        onChange={handleChange}
        multiple={false}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Room preview" className="max-w-full max-h-full object-contain rounded-md" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400 pointer-events-none">
          <UploadIcon className="w-10 h-10" />
          <p className="font-semibold">
            {isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}
          </p>
          <p className="text-sm">PNG, JPG, WEBP accepted</p>
        </div>
      )}
    </div>
  );
};