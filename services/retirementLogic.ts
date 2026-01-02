
import { UserData, CalculationResult, RetirementModality, ContributionBase } from '../types.ts';

export const calculateRetirement = (data: UserData): CalculationResult => {
  const { userName, birthDate, totalYears, totalMonths, bases, children, modality, delayedYears, anticipationMonths = 0 } = data;
  const bDate = new Date(birthDate);
  const now = new Date();
  
  // 1. Situación Actual (Foto fija hoy)
  const totalWorkedMonthsAtStart = totalYears * 12 + totalMonths;
  
  if (totalWorkedMonthsAtStart < 15 * 12) {
    return createBlockedResult(userName, "No se cumplen los 15 años mínimos de cotización requeridos por ley.");
  }

  // 2. Proyección de Edad Ordinaria
  // Estimamos si el usuario llegará a los 38a 3m de cotización al cumplir los 65
  const dateAt65 = new Date(bDate);
  dateAt65.setFullYear(bDate.getFullYear() + 65);
  const monthsUntil65 = Math.max(0, (dateAt65.getFullYear() - now.getFullYear()) * 12 + (dateAt65.getMonth() - now.getMonth()));
  const projectedMonthsAt65 = totalWorkedMonthsAtStart + monthsUntil65;

  let ordYears = 66;
  let ordMonths = 10;
  if (projectedMonthsAt65 >= (38 * 12 + 3)) {
    ordYears = 65;
    ordMonths = 0;
  }

  const ordinaryAge = { years: ordYears, months: ordMonths };
  let targetAge = { ...ordinaryAge };

  // 3. Aplicación de Modalidad y Adelantos/Retrasos
  let reductionPercentage = 0;
  let delayBonus = 0;
  let actualAnticipation = 0;

  if (modality === RetirementModality.ANTICIPATED_VOLUNTARY) {
    actualAnticipation = Math.min(anticipationMonths, 24);
    targetAge = subtractMonths(ordinaryAge, actualAnticipation);
    reductionPercentage = (actualAnticipation / 24) * 0.21; 
  } else if (modality === RetirementModality.ANTICIPATED_INVOLUNTARY) {
    actualAnticipation = Math.min(anticipationMonths, 48);
    targetAge = subtractMonths(ordinaryAge, actualAnticipation);
    reductionPercentage = (actualAnticipation / 48) * 0.30;
  } else if (modality === RetirementModality.DELAYED) {
    if (delayedYears && delayedYears > 0) {
      targetAge.years += delayedYears;
      delayBonus = delayedYears * 0.04;
    }
  }

  // 4. Determinación de Fecha Final y Tiempo Restante
  const rDate = new Date(bDate);
  rDate.setFullYear(bDate.getFullYear() + targetAge.years);
  rDate.setMonth(bDate.getMonth() + targetAge.months);
  const retirementDate = rDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  let remYears = rDate.getFullYear() - now.getFullYear();
  let remMonths = rDate.getMonth() - now.getMonth();
  let remDays = rDate.getDate() - now.getDate();

  if (remDays < 0) {
    remMonths -= 1;
    const lastDayOfMonth = new Date(rDate.getFullYear(), rDate.getMonth(), 0).getDate();
    remDays += lastDayOfMonth;
  }
  if (remMonths < 0) {
    remYears -= 1;
    remMonths += 12;
  }

  const timeRemaining = {
    years: Math.max(0, remYears),
    months: Math.max(0, remMonths),
    days: Math.max(0, remDays)
  };

  // 5. CÁLCULO DE COTIZACIÓN FINAL PROYECTADA
  const monthsToAdd = (rDate.getFullYear() - now.getFullYear()) * 12 + (rDate.getMonth() - now.getMonth());
  const totalFinalMonths = totalWorkedMonthsAtStart + Math.max(0, monthsToAdd);
  
  const finalContribution = {
    years: Math.floor(totalFinalMonths / 12),
    months: totalFinalMonths % 12
  };

  // 6. ESCALA DE PORCENTAJE SOBRE BASE REGULADORA
  let contributionPercentage = 0;
  if (totalFinalMonths >= 180) {
    contributionPercentage = 50;
    const additionalMonths = totalFinalMonths - 180;
    const monthsNeededForFull = 438 - 180; 
    const percentageIncrement = (additionalMonths / monthsNeededForFull) * 50;
    contributionPercentage = Math.min(100, 50 + percentageIncrement);
  }

  // 7. Base Reguladora (Sistema Dual A vs B)
  const calcA_Bases = bases.slice(0, 25).reduce((acc, b) => acc + (b.base * 12), 0);
  const baseReguladoraA = calcA_Bases / 350;

  const last29Years = [...bases].slice(0, 29);
  const sortedByAmount = [...last29Years].sort((a, b) => a.base - b.base);
  const filteredBasesB = last29Years.filter(b => b.year !== sortedByAmount[0]?.year && b.year !== sortedByAmount[1]?.year);
  const calcB_Sum = filteredBasesB.reduce((acc, b) => acc + (b.base * 12), 0);
  const baseReguladoraB = calcB_Sum / 352.33;

  const genderGapSupplement = children > 0 ? children * 38 : 0;
  const scaleMultiplier = contributionPercentage / 100;

  let finalPensionA = (baseReguladoraA * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraA) + genderGapSupplement;
  let finalPensionB = (baseReguladoraB * scaleMultiplier) * (1 - reductionPercentage) + (delayBonus * baseReguladoraB) + genderGapSupplement;

  return {
    userName,
    eligible: true,
    ordinaryAge,
    targetAge,
    retirementDate,
    timeRemaining,
    currentContribution: { years: totalYears, months: totalMonths },
    finalContribution,
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
    anticipationMonths: actualAnticipation
  };
};

const subtractMonths = (age: { years: number; months: number }, monthsToSubtract: number) => {
  let totalMonths = age.years * 12 + age.months - monthsToSubtract;
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  };
};

const createBlockedResult = (userName: string, reason: string): CalculationResult => ({
  userName,
  eligible: false,
  blockReason: reason,
  ordinaryAge: { years: 0, months: 0 },
  targetAge: { years: 0, months: 0 },
  retirementDate: '',
  timeRemaining: { years: 0, months: 0, days: 0 },
  currentContribution: { years: 0, months: 0 },
  finalContribution: { years: 0, months: 0 },
  contributionPercentage: 0,
  baseReguladoraA: 0,
  baseReguladoraB: 0,
  finalPensionA: 0,
  finalPensionB: 0,
  bestOption: 'A',
  genderGapSupplement: 0,
  modality: RetirementModality.ORDINARY
});
