
import { UserData, CalculationResult, RetirementModality, ContributionBase } from '../types';

export const calculateRetirement = (data: UserData): CalculationResult => {
  const { birthDate, totalYears, totalMonths, bases, children, modality, delayedYears, anticipationMonths = 0 } = data;
  const totalWorkedMonths = totalYears * 12 + totalMonths;
  
  // 1. Minimum Requirements (Carencia)
  const minRequiredMonths = 15 * 12;
  if (totalWorkedMonths < minRequiredMonths) {
    return createBlockedResult("No se cumplen los 15 años mínimos de cotización.");
  }

  // 2. Ordinary Age Calculation (2026)
  let ordYears = 66;
  let ordMonths = 10;
  
  if (totalWorkedMonths >= (38 * 12 + 3)) {
    ordYears = 65;
    ordMonths = 0;
  }

  const ordinaryAge = { years: ordYears, months: ordMonths };
  let targetAge = { ...ordinaryAge };

  // 3. Modality Checks and Reduction Coefficients
  let reductionPercentage = 0;
  let delayBonus = 0;

  if (modality === RetirementModality.ANTICIPATED_VOLUNTARY) {
    if (totalWorkedMonths < 35 * 12) {
      return createBlockedResult("La jubilación anticipada voluntaria requiere 35 años cotizados.");
    }
    const months = Math.min(anticipationMonths, 24);
    targetAge = subtractMonths(ordinaryAge, months);
    
    // Simplified scaling coefficient based on Social Security 2024-2026 logic
    // Usually between 2.81% and 21%
    reductionPercentage = (months / 24) * 0.21;
  } else if (modality === RetirementModality.ANTICIPATED_INVOLUNTARY) {
    if (totalWorkedMonths < 33 * 12) {
      return createBlockedResult("La jubilación anticipada involuntaria requiere 33 años cotizados.");
    }
    if ((data.unemploymentDuration || 0) < 6) {
      return createBlockedResult("Requiere estar inscrito como demandante de empleo al menos 6 meses.");
    }
    const months = Math.min(anticipationMonths, 48);
    targetAge = subtractMonths(ordinaryAge, months);
    
    // Scale 0.5% to 30%
    reductionPercentage = (months / 48) * 0.30;
  } else if (modality === RetirementModality.DELAYED) {
    if (delayedYears && delayedYears > 0) {
      targetAge.years += delayedYears;
      // 4% per year. From 2nd year, +2% every 6 months
      delayBonus = delayedYears * 0.04;
    }
  }

  // 4. Calculate Retirement Date
  const bDate = new Date(birthDate);
  const rDate = new Date(bDate);
  rDate.setFullYear(bDate.getFullYear() + targetAge.years);
  rDate.setMonth(bDate.getMonth() + targetAge.months);
  const retirementDate = rDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // 5. Base Reguladora Calculation (System Dual)
  const calcA_Bases = bases.slice(0, 25).reduce((acc, b) => acc + (b.base * 12), 0);
  const baseReguladoraA = calcA_Bases / 350;

  const last29Years = [...bases].slice(0, 29);
  const sortedByAmount = [...last29Years].sort((a, b) => a.base - b.base);
  const filteredBasesB = last29Years.filter(b => b.year !== sortedByAmount[0]?.year && b.year !== sortedByAmount[1]?.year);
  const calcB_Sum = filteredBasesB.reduce((acc, b) => acc + (b.base * 12), 0);
  const baseReguladoraB = calcB_Sum / 352.33;

  const genderGapSupplement = children > 0 ? children * 38 : 0;

  let finalPensionA = baseReguladoraA * (1 - reductionPercentage) + delayBonus * baseReguladoraA + genderGapSupplement;
  let finalPensionB = baseReguladoraB * (1 - reductionPercentage) + delayBonus * baseReguladoraB + genderGapSupplement;

  return {
    eligible: true,
    ordinaryAge,
    targetAge,
    retirementDate,
    baseReguladoraA,
    baseReguladoraB,
    finalPensionA,
    finalPensionB,
    bestOption: finalPensionB > finalPensionA ? 'B' : 'A',
    genderGapSupplement,
    reductionPercentage,
    delayBonus
  };
};

const subtractMonths = (age: { years: number; months: number }, monthsToSubtract: number) => {
  let totalMonths = age.years * 12 + age.months - monthsToSubtract;
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  };
};

const createBlockedResult = (reason: string): CalculationResult => ({
  eligible: false,
  blockReason: reason,
  ordinaryAge: { years: 0, months: 0 },
  targetAge: { years: 0, months: 0 },
  retirementDate: '',
  baseReguladoraA: 0,
  baseReguladoraB: 0,
  finalPensionA: 0,
  finalPensionB: 0,
  bestOption: 'A',
  genderGapSupplement: 0
});
