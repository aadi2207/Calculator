export type CalculatorMode = 
  | 'standard' 
  | 'scientific' 
  | 'programmer' 
  | 'converter' 
  | 'financial' 
  | 'graphing';

export type ThemeId = 
  | 'studio-dark' 
  | 'clean-light' 
  | 'amber-phosphor' 
  | 'nordic-slate';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  previewBg: string;
  previewAccent: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: CalculatorMode;
  expression: string;
  result: string;
  meta?: string;
}

export type ProgrammerWordSize = 'QWORD' | 'DWORD' | 'WORD' | 'BYTE';
export type ProgrammerRadix = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export interface BitboardBit {
  index: number;
  value: 0 | 1;
}

export type ConversionCategory = 
  | 'length' 
  | 'mass' 
  | 'temperature' 
  | 'storage' 
  | 'speed' 
  | 'area' 
  | 'volume' 
  | 'time' 
  | 'currency';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  rateToBase: number; // For non-linear like temperature, custom conversion
  formula?: string;
}

export interface LoanMilestone {
  year: number;
  beginningBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
  milestones: LoanMilestone[];
}

export interface CompoundYearPoint {
  year: number;
  balance: number;
  totalContributed: number;
  totalInterest: number;
}

export interface CompoundCalculationResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearlyData: CompoundYearPoint[];
}
