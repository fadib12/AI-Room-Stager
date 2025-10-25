

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { VibeSelector } from './components/VibeSelector';
import { ImageGrid } from './components/ImageGrid';
import { ImageDetailView } from './components/ImageDetailView';
import { Spinner } from './components/Spinner';
import { generateStagedImages } from './services/geminiService';
import { GeneratedImage } from './types';
import { fileToGenerativePart } from './utils/fileUtils';

type AppState = 'initial' | 'generating' | 'results' | 'error';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [appState, setAppState] = useState<AppState>('initial');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setOriginalImage(file);
    setOriginalImagePreview(URL.createObjectURL(file));
    setAppState('initial');
    setGeneratedImages([]);
    setError(null);
  };

  const handleGenerate = async (vibe: string) => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }
    setAppState('generating');
    setError(null);
    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const prompt = `Virtually stage this empty room to have a "${vibe}" style.`;
      const images = await generateStagedImages(prompt, imagePart);
      setGeneratedImages(images.map(base64 => ({ id: crypto.randomUUID(), base64 })));
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please try again.');
      setAppState('error');
    }
  };

  const handleSelectImage = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseDetailView = () => {
    setSelectedImage(null);
  };

  const handleRegenerateOne = useCallback(async (vibe: string) => {
    if (!originalImage || !selectedImage) return null;

    try {
        const imagePart = await fileToGenerativePart(originalImage);
        const prompt = `Virtually stage this empty room to have a "${vibe}" style. Generate a different variation.`;
        const newImages = await generateStagedImages(prompt, imagePart, 1);
        if (newImages.length > 0) {
            const newImage: GeneratedImage = { id: selectedImage.id, base64: newImages[0] };
            setGeneratedImages(prev => prev.map(img => img.id === newImage.id ? newImage : img));
            setSelectedImage(newImage);
            return newImage;
        }
    } catch (err) {
        console.error("Regeneration failed", err);
        alert("Failed to regenerate the image. Please try again.");
    }
    return null;
  }, [originalImage, selectedImage]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center">
      <Header />
      <main className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Design Your Dream Room
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Upload a photo of your empty room, describe your style, and let AI bring it to life.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <ImageUploader onImageUpload={handleImageUpload} previewUrl={originalImagePreview} />
          {originalImage && <VibeSelector onGenerate={handleGenerate} disabled={appState === 'generating'} />}
        </div>
        
        <div className="w-full max-w-4xl mx-auto">
            {appState === 'generating' && <Spinner text="Generating your designs... This might take a moment." />}
            {appState === 'error' && <p className="text-center text-red-400 mt-8">{error}</p>}
            {appState === 'results' && generatedImages.length > 0 && (
            <ImageGrid images={generatedImages} onImageClick={handleSelectImage} />
            )}
        </div>

        {selectedImage && originalImagePreview && (
          <ImageDetailView
            image={selectedImage}
            originalImageSrc={originalImagePreview}
            onClose={handleCloseDetailView}
            onRegenerate={handleRegenerateOne}
          />
        )}
      </main>
    </div>
  );
};

export default App;