

export interface Flight {
  from: string;
  to: string;
  airline: string;
  price: number;
  stops: number;
  duration: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Activity {
  time: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  title: string;
  days: ItineraryDay[];
}

// Fix: Removed 'export' from the AIStudio interface to resolve global type declaration conflicts.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
    interface Window {
      aistudio: AIStudio;
    }
}
