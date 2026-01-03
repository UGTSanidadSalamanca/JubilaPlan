
import { UserData, CalculationResult, RetirementModality } from '../types.ts';

const getIPCIndex = (monthsAgo: number): number => {
  if (monthsAgo <= 24) return 1.0;
  const yearsAgo = monthsAgo / 12;
  return 1 + ((yearsAgo - 2) * 0.021); // 2.1% IPC estimado anual
};

const internalCalculate = (data: UserData, overrideModality?: RetirementModality, overrideAnticipation?: number): any => {
  const { birthDate, totalYears, totalMonths, children, modality: originalModality, delayedYears = 0, anticipationMonths: originalAnticipation = 0, bases } = data;
  
  const modality = overrideModality || originalModality;
  const anticipationMonths = overrideAnticipation !== undefined ? overrideAnticipation : originalAnticipation;

  const currentBase = bases[0]?.base || 2400;
  const now = new Date();
  const bDate = new Date(birthDate);

  const dateAt65 = new Date(bDate);
  dateAt65.setFullYear(bDate.getFullYear() + 65);
  const monthsUntil65 = Math.max(0, (dateAt65.getFullYear() - now.getFullYear()) * 12 + (dateAt65.getMonth() - now.getMonth()));
  const totalWorkedMonthsNow = totalYears * 12 + totalMonths;
  const projectedMonthsAt65 = totalWorkedMonthsNow + monthsUntil65;

  const thresholdMonths = (38 * 12) + 6; 
  let ordYears = 67;
  let ordMonths = 0;

  if (projectedMonthsAt65 >= thresholdMonths) {
    ordYears = 65;
    ordMonths = 0;
  }

  const ordinaryAge = { years: ordYears, months: ordMonths };
  let targetAge = { ...ordinaryAge };

  let reductionPercentage = 0;
  let delayBonus = 0;
  
  if (modality === RetirementModality.ANTICIPATED_VOLUNTARY) {
    targetAge = subtractMonths(ordinaryAge, anticipationMonths);
    reductionPercentage = (anticipationMonths / 24) * 0.21;
  } else if (modality === RetirementModality.ANTICIPATED_INVOLUNTARY) {
    targetAge = subtractMonths(ordinaryAge, anticipationMonths);
    reductionPercentage = (anticipationMonths / 48) * 0.30;
  } else if (modality === RetirementModality.DELAYED) {
    targetAge.years += delayedYears;
    delayBonus = delayedYears * 0.04;
  }

  const rDate = new Date(bDate);
  rDate.setFullYear(bDate.getFullYear() + targetAge.years);
  rDate.setMonth(bDate.getMonth() + targetAge.months);

  const monthsUntilRetirement = Math.max(0, (rDate.getFullYear() - now.getFullYear()) * 12 + (rDate.getMonth() - now.getMonth()));
  const totalFinalMonths = totalWorkedMonthsNow + monthsUntilRetirement;

  const generateProjectedBases = (totalMonthsNeeded: number): number[] => {
    return Array.from({ length: totalMonthsNeeded }, (_, i) => {
      if (i < monthsUntilRetirement) return currentBase;
      const monthsInPast = i - monthsUntilRetirement;
      const nominalPastBase = currentBase / Math.pow(1.02, monthsInPast / 12);
      return nominalPastBase * getIPCIndex(monthsInPast);
    });
  };

  const basesA = generateProjectedBases(300);
  const baseReguladoraA = basesA.reduce((a, b) => a + b, 0) / 350;
  const basesB = generateProjectedBases(348);
  const sortedB = [...basesB].sort((a, b) => a - b);
  const sumBest324 = basesB.reduce((a, b) => a + b, 0) - sortedB.slice(0, 24).reduce((a, b) => a + b, 0);
  const baseReguladoraB = sumBest324 / 378;

  let contributionPercentage = 0;
  if (totalFinalMonths >= 180) {
    const monthsForFull = (36.5 * 12) - 180;
    const extraMonths = totalFinalMonths - 180;
    contributionPercentage = Math.min(100, 50 + (extraMonths / monthsForFull) * 50);
  }

  const scaleMultiplier = contributionPercentage / 100;
  const genderGapSupplement = children > 0 ? children * 33.20 : 0;

  let pensionA = (baseReguladoraA * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraA) + genderGapSupplement;
  let pensionB = (baseReguladoraB * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraB) + genderGapSupplement;

  const MAX_PENSION = 3175;
  const MIN_PENSION = 1050;
  pensionA = Math.min(MAX_PENSION, Math.max(MIN_PENSION, pensionA));
  pensionB = Math.min(MAX_PENSION, Math.max(MIN_PENSION, pensionB));

  return {
    ordinaryAge,
    targetAge,
    retirementDate: rDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    timeRemaining: calculateTimeRemaining(rDate),
    finalContribution: { years: Math.floor(totalFinalMonths / 12), months: totalFinalMonths % 12 },
    contributionPercentage,
    baseReguladoraA,
    baseReguladoraB,
    finalPensionA: pensionA,
    finalPensionB: pensionB,
    bestPension: Math.max(pensionA, pensionB),
    bestOption: pensionB > pensionA ? 'B' : 'A'
  };
};

export const calculateRetirement = (data: UserData): CalculationResult => {
  const mainResult = internalCalculate(data);
  let comparison;

  if (data.modality === RetirementModality.ANTICIPATED_VOLUNTARY || data.modality === RetirementModality.ANTICIPATED_INVOLUNTARY) {
    const ordinaryResult = internalCalculate(data, RetirementModality.ORDINARY, 0);
    comparison = {
      pension: ordinaryResult.bestPension,
      date: ordinaryResult.retirementDate,
      diffMonthly: ordinaryResult.bestPension - mainResult.bestPension
    };
  }

  return {
    userName: data.userName,
    eligible: (data.totalYears * 12 + data.totalMonths) >= 180,
    ordinaryAge: mainResult.ordinaryAge,
    targetAge: mainResult.targetAge,
    retirementDate: mainResult.retirementDate,
    timeRemaining: mainResult.timeRemaining,
    currentContribution: { years: data.totalYears, months: data.totalMonths },
    finalContribution: mainResult.finalContribution,
    contributionPercentage: mainResult.contributionPercentage,
    baseReguladoraA: mainResult.baseReguladoraA,
    baseReguladoraB: mainResult.baseReguladoraB,
    finalPensionA: mainResult.finalPensionA,
    finalPensionB: mainResult.finalPensionB,
    bestOption: mainResult.bestOption,
    genderGapSupplement: data.children > 0 ? data.children * 33.20 : 0,
    reductionPercentage: (mainResult as any).reductionPercentage,
    delayBonus: (mainResult as any).delayBonus,
    modality: data.modality,
    anticipationMonths: data.anticipationMonths,
    ordinaryComparison: comparison
  };
};

const calculateTimeRemaining = (targetDate: Date) => {
  const now = new Date();
  let years = targetDate.getFullYear() - now.getFullYear();
  let months = targetDate.getMonth() - now.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years: Math.max(0, years), months: Math.max(0, months), days: 0 };
};

const subtractMonths = (age: { years: number; months: number }, m: number) => {
  let total = age.years * 12 + age.months - m;
  return { years: Math.floor(total / 12), months: total % 12 };
};
