
import React from 'react';

interface SpinnerProps {
    text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8">
      <div className="w-12 h-12 border-4 border-slate-600 border-t-purple-400 rounded-full animate-spin"></div>
      {text && <p className="text-slate-400">{text}</p>}
    </div>
  );
};
