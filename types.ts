
export enum RetirementModality {
  ORDINARY = 'ORDINARY',
  ANTICIPATED_VOLUNTARY = 'ANTICIPATED_VOLUNTARY',
  ANTICIPATED_INVOLUNTARY = 'ANTICIPATED_INVOLUNTARY',
  PARTIAL = 'PARTIAL',
  DELAYED = 'DELAYED'
}

export interface ContributionBase {
  year: number;
  base: number;
}

export interface UserData {
  birthDate: string;
  totalYears: number;
  totalMonths: number;
  bases: ContributionBase[];
  children: number;
  modality: RetirementModality;
  unemploymentDuration?: number; // Months registered for involuntary
  partialReduction?: number; // 25 to 75
  delayedYears?: number;
  anticipationMonths?: number; // Chosen months to advance
}

export interface CalculationResult {
  eligible: boolean;
  blockReason?: string;
  ordinaryAge: { years: number; months: number };
  targetAge: { years: number; months: number };
  retirementDate: string;
  baseReguladoraA: number; // 25 years
  baseReguladoraB: number; // 29 years - 2 worst
  finalPensionA: number;
  finalPensionB: number;
  bestOption: 'A' | 'B';
  genderGapSupplement: number;
  reductionPercentage?: number;
  delayBonus?: number;
  isPartialCompatible?: boolean;
}
