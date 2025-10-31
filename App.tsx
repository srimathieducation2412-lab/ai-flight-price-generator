import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Flight, GroundingSource } from './types';
import { findFlights } from './services/geminiService';
import FlightCard from './components/FlightCard';
import { PlaneIcon, SearchIcon, LoadingSpinner, GmailIcon, WhatsAppIcon, ClearIcon, SunIcon, MoonIcon } from './components/icons';

type Theme = 'light' | 'dark';

// --- Helper Components (moved outside of App) ---

interface SearchFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchForm: React.FC<SearchFormProps> = ({ query, onQueryChange, onSubmit, isLoading, inputRef }) => (
  <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="e.g., flights from NYC to London"
        className="w-full pl-5 pr-12 py-4 bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-full text-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-14 bg-cyan-500 text-white rounded-full m-1 transform transition-transform duration-300 hover:scale-110 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
        disabled={isLoading}
        aria-label="Search flights"
      >
        {isLoading ? (
          <LoadingSpinner className="w-6 h-6 animate-spin" />
        ) : (
          <SearchIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  </form>
);


interface ShareResultsProps {
  onShare: (platform: 'gmail' | 'whatsapp') => void;
}

const ShareResults: React.FC<ShareResultsProps> = ({ onShare }) => (
    <div className="mt-12 text-center">
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-4">Share Results</h3>
        <div className="flex justify-center items-center gap-4">
            <button
                onClick={() => onShare('gmail')}
                className="flex items-center gap-2 px-6 py-3 bg-red-600/90 hover:bg-red-500/90 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
                <GmailIcon className="w-6 h-6" />
                <span>Share via Gmail</span>
            </button>
            <button
                onClick={() => onShare('whatsapp')}
                className="flex items-center gap-2 px-6 py-3 bg-green-600/90 hover:bg-green-500/90 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
                <WhatsAppIcon className="w-6 h-6" />
                <span>Share on WhatsApp</span>
            </button>
        </div>
    </div>
);

interface ResultsProps {
    error: string | null;
    flights: Flight[];
    sources: GroundingSource[];
    onShare: (platform: 'gmail' | 'whatsapp') => void;
}

const Results: React.FC<ResultsProps> = ({ error, flights, sources, onShare }) => (
  <div className="w-full max-w-4xl mx-auto mt-12">
    {error && (
      <div className="text-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
        {error}
      </div>
    )}
    {flights.length > 0 && (
      <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {flights.map((flight, index) => (
                  <FlightCard key={index} flight={flight} />
              ))}
          </div>
          <ShareResults onShare={onShare} />
      </>
    )}
    {sources.length > 0 && (
      <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-3 text-center">Data Sources</h3>
          <ul className="text-center text-sm space-y-2">
              {sources.map((source, index) => (
                  <li key={index}>
                      <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-200 transition-colors duration-200 underline">
                          {source.title}
                      </a>
                  </li>
              ))}
          </ul>
      </div>
    )}
  </div>
);

const WelcomeScreen: React.FC = () => (
  <div className="text-center">
    <PlaneIcon className="w-24 h-24 mx-auto text-cyan-500 dark:text-cyan-400 mb-4 animate-pulse" />
    <h2 className="text-3xl font-bold mb-2">AI Flight Finder</h2>
    <p className="text-slate-500 dark:text-slate-400">Enter your route above to find the best flights with AI.</p>
  </div>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSearch = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFlights([]);
    setSources([]);

    try {
      const result = await findFlights(query);
      setFlights(result.flights);
      setSources(result.sources);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setFlights([]);
    setSources([]);
    setError(null);
    searchInputRef.current?.focus();
  }, []);

  const generateShareText = (flightResults: Flight[]): string => {
    let text = `Here are the flight options I found for "${query}":\n\n`;
    flightResults.forEach((flight, index) => {
      text += `✈️ Flight ${index + 1}:\n`;
      text += `  - Airline: ${flight.airline}\n`;
      text += `  - Route: ${flight.from} to ${flight.to}\n`;
      text += `  - Price: ₹${flight.price}\n`;
      text += `  - Duration: ${flight.duration}\n`;
      text += `  - Stops: ${flight.stops}\n\n`;
    });
    return text;
  };

  const handleShare = (platform: 'gmail' | 'whatsapp') => {
    if (flights.length === 0) return;

    const shareText = generateShareText(flights);
    if (platform === 'gmail') {
      const subject = `Flight options for: ${query}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
      window.open(gmailUrl, '_blank');
    } else if (platform === 'whatsapp') {
      const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-8 transition-colors duration-300">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 dark:opacity-10" 
        style={{backgroundImage: `url('https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`}}
      ></div>
       <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>
      <div className="relative z-10 container mx-auto flex flex-col items-center">
        <header className="text-center my-10 sm:my-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Find Your <span className="text-cyan-500 dark:text-cyan-400">Next Flight</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Leveraging search capabilities to bring you real-time flight options and pricing.
          </p>
        </header>
        
        <div className="w-full max-w-3xl flex items-start gap-2">
            <div className="flex-grow">
                <SearchForm 
                  query={query}
                  onQueryChange={setQuery}
                  onSubmit={handleSearch}
                  isLoading={isLoading}
                  inputRef={searchInputRef}
                />
            </div>
            {(flights.length > 0 || error) && !isLoading && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="mt-1 flex-shrink-0 flex items-center justify-center w-14 h-14 bg-slate-300/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-full transition-all duration-300 hover:bg-red-500/80 hover:text-white transform hover:scale-110 hover:rotate-90"
                    disabled={isLoading}
                    aria-label="Clear search and results"
                >
                   <ClearIcon className="w-6 h-6" />
                </button>
            )}
        </div>

        <main className="w-full mt-10">
          {!isLoading && flights.length === 0 && !error && <WelcomeScreen />}
          <Results 
            error={error}
            flights={flights}
            sources={sources}
            onShare={handleShare}
          />
        </main>
      </div>
    </div>
  );
};

export default App;