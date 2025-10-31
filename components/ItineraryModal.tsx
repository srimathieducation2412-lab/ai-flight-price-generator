import React, { useEffect, useRef } from 'react';
import { Itinerary } from '../types';
import { LoadingSpinner, SparklesIcon, ClearIcon } from './icons';

interface ItineraryModalProps {
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({ itinerary, isLoading, error, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isVisible = isLoading || itinerary || error;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isVisible) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const ModalContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <LoadingSpinner className="w-16 h-16 text-cyan-500 dark:text-cyan-400 animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generating Itinerary...</h2>
            <p className="text-slate-500 dark:text-slate-400">Our AI is planning your adventure!</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                <p className="text-slate-500 dark:text-slate-400 bg-red-900/50 border border-red-700 rounded-md p-4">{error}</p>
                <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors duration-300"
                >
                    Close
                </button>
            </div>
        );
    }
    
    if (itinerary) {
        return (
            <>
                <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700 text-center">
                    <SparklesIcon className="w-12 h-12 mx-auto text-cyan-500 dark:text-cyan-400 mb-3" />
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" id="itinerary-title">{itinerary.title}</h2>
                </div>
                <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-8">
                        {itinerary.days.map(day => (
                            <div key={day.day} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300 font-bold text-xl">
                                        {day.day}
                                    </div>
                                    <div className="flex-grow w-px bg-slate-300 dark:bg-slate-600"></div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{day.title}</h3>
                                    <ul className="space-y-4">
                                    {day.activities.map((activity, index) => (
                                        <li key={index} className="pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.time}</p>
                                            <p className="text-slate-600 dark:text-slate-400">{activity.description}</p>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )
    }
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="itinerary-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close itinerary"
        >
          <ClearIcon className="w-6 h-6"/>
        </button>
        <ModalContent/>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ItineraryModal;
