
import { UserData, CalculationResult, RetirementModality } from '../types.ts';

const getIPCIndex = (monthsAgo: number): number => {
  if (monthsAgo <= 24) return 1.0;
  const yearsAgo = monthsAgo / 12;
  return 1 + ((yearsAgo - 2) * 0.021); // 2.1% IPC estimado anual
};

export const calculateRetirement = (data: UserData): CalculationResult => {
  const { birthDate, totalYears, totalMonths, children, modality, delayedYears = 0, anticipationMonths = 0, bases } = data;
  
  const currentBase = bases[0]?.base || 2400;
  const now = new Date();
  const bDate = new Date(birthDate);

  // 1. DETERMINAR EDAD ORDINARIA PROYECTADA
  // Calculamos cuántos meses faltan para que el usuario cumpla 65 años
  const dateAt65 = new Date(bDate);
  dateAt65.setFullYear(bDate.getFullYear() + 65);
  
  const monthsUntil65 = Math.max(0, (dateAt65.getFullYear() - now.getFullYear()) * 12 + (dateAt65.getMonth() - now.getMonth()));
  const totalWorkedMonthsNow = totalYears * 12 + totalMonths;
  
  // Cotización que tendrá el usuario cuando cumpla 65 años si sigue trabajando
  const projectedMonthsAt65 = totalWorkedMonthsNow + monthsUntil65;

  // Normativa: En 2027+ (que aplica a nacimientos en 1967), se piden 38a 6m para los 65.
  // Si no, la edad es 67 años.
  const thresholdMonths = (38 * 12) + 6; 
  
  let ordYears = 67;
  let ordMonths = 0;

  if (projectedMonthsAt65 >= thresholdMonths) {
    ordYears = 65;
    ordMonths = 0;
  } else {
    // Escala transitoria si es antes de 2027 (pero para 1967 ya es 2032/2034)
    ordYears = 67;
    ordMonths = 0;
  }

  const ordinaryAge = { years: ordYears, months: ordMonths };
  let targetAge = { ...ordinaryAge };

  // 2. APLICAR MODALIDAD (Sobre la edad ordinaria recalculada)
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

  // 3. FECHA DE JUBILACIÓN REAL
  const rDate = new Date(bDate);
  rDate.setFullYear(bDate.getFullYear() + targetAge.years);
  rDate.setMonth(bDate.getMonth() + targetAge.months);

  // 4. TIEMPO RESTANTE Y COTIZACIÓN FINAL
  const monthsUntilRetirement = Math.max(0, (rDate.getFullYear() - now.getFullYear()) * 12 + (rDate.getMonth() - now.getMonth()));
  const totalFinalMonths = totalWorkedMonthsNow + monthsUntilRetirement;

  // 5. PROYECCIÓN DE BASES (29 AÑOS HACIA ATRÁS DESDE LA JUBILACIÓN)
  const generateProjectedBases = (totalMonthsNeeded: number): number[] => {
    return Array.from({ length: totalMonthsNeeded }, (_, i) => {
      if (i < monthsUntilRetirement) {
        return currentBase;
      } else {
        const monthsInPast = i - monthsUntilRetirement;
        const nominalPastBase = currentBase / Math.pow(1.02, monthsInPast / 12);
        return nominalPastBase * getIPCIndex(monthsInPast);
      }
    });
  };

  const basesA = generateProjectedBases(300);
  const baseReguladoraA = basesA.reduce((a, b) => a + b, 0) / 350;

  const basesB = generateProjectedBases(348);
  const sortedB = [...basesB].sort((a, b) => a - b);
  const sumBest324 = basesB.reduce((a, b) => a + b, 0) - sortedB.slice(0, 24).reduce((a, b) => a + b, 0);
  const baseReguladoraB = sumBest324 / 378;

  // 6. PORCENTAJE POR AÑOS (36.5 años = 100%)
  let contributionPercentage = 0;
  if (totalFinalMonths >= 180) {
    const monthsForFull = (36.5 * 12) - 180;
    const extraMonths = totalFinalMonths - 180;
    contributionPercentage = Math.min(100, 50 + (extraMonths / monthsForFull) * 50);
  }

  const scaleMultiplier = contributionPercentage / 100;
  const genderGapSupplement = children > 0 ? children * 33.20 : 0;

  let finalPensionA = (baseReguladoraA * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraA) + genderGapSupplement;
  let finalPensionB = (baseReguladoraB * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraB) + genderGapSupplement;

  const MAX_PENSION = 3175;
  const MIN_PENSION = 1050;
  finalPensionA = Math.min(MAX_PENSION, Math.max(MIN_PENSION, finalPensionA));
  finalPensionB = Math.min(MAX_PENSION, Math.max(MIN_PENSION, finalPensionB));

  return {
    userName: data.userName,
    eligible: totalWorkedMonthsNow >= 180,
    ordinaryAge,
    targetAge,
    retirementDate: rDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    timeRemaining: calculateTimeRemaining(rDate),
    currentContribution: { years: totalYears, months: totalMonths },
    finalContribution: { years: Math.floor(totalFinalMonths / 12), months: totalFinalMonths % 12 },
    contributionPercentage,
    baseReguladoraA,
    baseReguladoraB,
    finalPensionA,
    finalPensionB,
    bestOption: finalPensionB > finalPensionA ? 'B' : 'A',
    genderGapSupplement,
    reductionPercentage,
    delayBonus,
    modality,
    anticipationMonths
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
