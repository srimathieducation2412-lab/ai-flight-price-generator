import React from 'react';
import { Flight } from '../types';
import { PlaneIcon, SparklesIcon } from './icons';

interface FlightCardProps {
  flight: Flight;
  onGenerateItinerary: (destination: string) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onGenerateItinerary }) => {
  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:border-cyan-500 dark:hover:border-cyan-400">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-cyan-600 dark:text-cyan-300">{flight.airline}</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wider">
            ₹{flight.price}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">From</p>
            <p className="text-2xl font-mono">{flight.from}</p>
          </div>
          <div className="flex-1 px-4 flex items-center justify-center">
              <div className="w-full h-px bg-slate-300 dark:bg-slate-600 relative">
                  <PlaneIcon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-1 rounded-full"/>
              </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">To</p>
            <p className="text-2xl font-mono">{flight.to}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <span>
            Duration: <span className="font-semibold text-slate-900 dark:text-white">{flight.duration}</span>
          </span>
          <span>
            Stops: <span className="font-semibold text-slate-900 dark:text-white">{flight.stops}</span>
          </span>
        </div>
      </div>
      <button 
        onClick={() => onGenerateItinerary(flight.to)}
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200 font-semibold rounded-lg border border-cyan-500/30 transition-all duration-300 transform hover:scale-105"
      >
        <SparklesIcon className="w-5 h-5"/>
        Generate Itinerary
      </button>
    </div>
  );
};

export default FlightCard;
