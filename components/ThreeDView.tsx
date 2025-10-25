

import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { CloseIcon } from './icons/CloseIcon';

// Add type declaration for the custom model-viewer element
declare global {
  namespace JSX {
    // FIX: Manually added standard HTML and SVG element types to IntrinsicElements.
    // The original declaration for 'model-viewer' alone was likely overriding React's default
    // global JSX types, causing widespread errors. This change merges the required
    // standard element types with the custom element definition.
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        ar?: boolean;
        'environment-image'?: string;
        'shadow-intensity'?: string;
        style?: React.CSSProperties;
      }, HTMLElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      circle: React.SVGProps<SVGCircleElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      // FIX: Added the 'footer' element to the global JSX types to resolve rendering errors in other components.
      footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      line: React.SVGProps<SVGLineElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      path: React.SVGProps<SVGPathElement>;
      polyline: React.SVGProps<SVGPolylineElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      svg: React.SVGProps<SVGSVGElement>;
      textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    }
  }
}

interface ThreeDViewProps {
  onClose: () => void;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate 3D model generation time
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col relative">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-center">Interactive 3D View</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white z-20">
              <CloseIcon className="w-8 h-8" />
            </button>
        </div>

        <div className="flex-grow flex items-center justify-center p-4 md:p-8">
          {isGenerating ? (
            <Spinner text="Generating 3D Scene..." />
          ) : (
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="A 3D model of an astronaut"
              camera-controls
              auto-rotate
              ar
              environment-image="neutral"
              shadow-intensity="1"
            />
          )}
        </div>
      </div>
    </div>
  );
};
