
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
  userName: string;
  birthDate: string;
  totalYears: number;
  totalMonths: number;
  bases: ContributionBase[];
  children: number;
  modality: RetirementModality;
  unemploymentDuration?: number;
  partialReduction?: number;
  delayedYears?: number;
  anticipationMonths?: number;
}

export interface CalculationResult {
  userName: string;
  eligible: boolean;
  blockReason?: string;
  ordinaryAge: { years: number; months: number };
  targetAge: { years: number; months: number };
  retirementDate: string;
  timeRemaining: { years: number; months: number; days: number };
  currentContribution: { years: number; months: number };
  finalContribution: { years: number; months: number };
  contributionPercentage: number; // Porcentaje de la base reguladora según años (50%-100%)
  baseReguladoraA: number;
  baseReguladoraB: number;
  finalPensionA: number;
  finalPensionB: number;
  bestOption: 'A' | 'B';
  genderGapSupplement: number;
  reductionPercentage?: number;
  delayBonus?: number;
  modality: RetirementModality;
  anticipationMonths?: number;
}
