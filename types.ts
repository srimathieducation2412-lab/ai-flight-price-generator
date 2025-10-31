
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

// Fix: Moved the AIStudio interface inside the `declare global` block to resolve global type declaration conflicts.
declare global {
    interface AIStudio {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    }
    interface Window {
      // Fix: Made the 'aistudio' property optional to resolve a global type declaration conflict.
      aistudio?: AIStudio;
    }
}
