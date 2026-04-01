export enum ViewState {
  HOME = 'HOME',
  DIAGNOSE = 'DIAGNOSE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export interface CarDetails {
  make: string;
  model: string;
  year: string;
  mileage: string;
  symptoms: string;
}

export interface MechanicLocation {
  name: string;
  address: string;
  rating?: number;
  openNow?: boolean;
}

export interface AnalysisResult {
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  possibleCauses: string[];
  estimatedCost: string;
  diySteps: string[];
  recommendation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
