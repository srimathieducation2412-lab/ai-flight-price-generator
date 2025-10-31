import React, { useState, useEffect, useRef } from 'react';
import { KeyIcon, ClearIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  isDismissible?: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, isDismissible = true }) => {
  const [key, setKey] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        handleSave();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDismissible && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 animate-fade-in-scale"
      >
        {isDismissible && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close API Key modal"
          >
            <ClearIcon className="w-6 h-6" />
          </button>
        )}
        <div className="p-8 text-center">
          <KeyIcon className="w-12 h-12 mx-auto text-cyan-500 dark:text-cyan-400 mb-4" />
          <h2 id="api-key-title" className="text-2xl font-bold mb-2">Configure Gemini API Key</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            To use this application, please enter your API key. Your key is stored only in your browser for this session.
          </p>
          <input
            ref={inputRef}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your API key"
            className="w-full px-4 py-3 bg-white/70 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg text-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Get an API Key from Google AI Studio
          </a>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="mt-6 w-full px-4 py-3 bg-cyan-500 text-white font-semibold rounded-lg transition-colors duration-300 hover:bg-cyan-600 disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
