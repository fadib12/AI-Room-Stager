
import React, { useState } from 'react';
import { getExpertResponse } from '../services/geminiService';
import { Spinner } from './Spinner';
import { CloseIcon } from './icons/CloseIcon';

interface ExpertChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpertChat: React.FC<ExpertChatProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse('');
    setError('');
    try {
      const expertResponse = await getExpertResponse(prompt);
      setResponse(expertResponse);
    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white z-20">
          <CloseIcon className="w-8 h-8" />
        </button>
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-center">Ask an AI Design Expert</h3>
          <p className="text-sm text-slate-400 text-center">Powered by GPT-4o for complex questions.</p>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {isLoading && <Spinner text="Thinking..." />}
          {error && <p className="text-red-400">{error}</p>}
          {response && (
             <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />
          )}
        </div>

        <div className="p-6 border-t border-slate-700">
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a complex design question, e.g., 'What are the core principles of Bauhaus design and how can I apply them to a small apartment?'"
              className="flex-grow bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed self-stretch"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
