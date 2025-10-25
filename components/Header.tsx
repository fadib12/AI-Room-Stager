

import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full p-4 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-purple-400" />
          <h1 className="text-xl font-bold text-white">AI Room Stager</h1>
        </div>
      </div>
    </header>
  );
};