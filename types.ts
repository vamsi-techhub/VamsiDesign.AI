export interface RoomAnalysis {
  roomType: string;
  style: string;
  colors: { name: string; hex: string; percentage: number }[];
  furniture: string[];
  lighting: string;
  suggestions: string[];
}

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  DESIGNER = 'DESIGNER',
  ANIMATOR = 'ANIMATOR',
  ANALYSIS = 'ANALYSIS'
}

export interface DesignState {
  originalImage: string | null; // Base64
  generatedHistory: GeneratedMedia[];
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisData: RoomAnalysis | null;
  credits: number;
}

export interface DesignOptions {
  roomType: string;
  style: string;
  budget: 'Low' | 'Medium' | 'Luxury';
  colorPreference: string;
  additionalPrompt: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}