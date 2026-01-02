
import React from 'react';
import { CalculationResult, RetirementModality, UserData } from '../types.ts';
import { calculateRetirement } from '../services/retirementLogic.ts';
import { jsPDF } from 'jspdf';

interface Props {
  result: CalculationResult | null;
  originalData: UserData | null;
}

const ResultsView: React.FC<Props> = ({ result, originalData }) => {
  if (!result || !originalData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-chart-line text-4xl opacity-20"></i>
        </div>
        <h4 className="text-xl font-black text-slate-400 tracking-tight">Análisis en espera</h4>
        <p className="text-sm text-slate-300 text-center max-w-xs mt-2 font-medium">Introduce tus datos para generar la proyección dual.</p>
      </div>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(30, 41, 59); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME JUBILATECH 2026', margin, 25);
    doc.setFontSize(10);
    doc.text('Simulación Avanzada de Pensión de Jubilación', margin, 32);

    // Datos Personales
    y = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('DATOS DEL TITULAR', margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${result.userName}`, margin, y);
    doc.text(`Fecha Nacimiento: ${new Date(originalData.birthDate).toLocaleDateString()}`, 110, y);
    y += 7;
    doc.text(`Cotización Actual: ${result.currentContribution.years} años y ${result.currentContribution.months} meses`, margin, y);
    doc.text(`Hijos (Brecha Género): ${originalData.children}`, 110, y);

    // ESCENARIO ACTUAL (EL ELEGIDO)
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(margin, y, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`ESCENARIO SELECCIONADO: ${result.modality.replace('_', ' ')}`, margin + 5, y + 5.5);

    y += 15;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle del Retiro', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`Fecha de Jubilación: ${result.retirementDate}`, margin, y);
    doc.text(`Edad Efectiva: ${result.targetAge.years} años y ${result.targetAge.months} meses`, 110, y);
    y += 7;
    doc.text(`Cotización Final Proyectada: ${result.finalContribution.years} años y ${result.finalContribution.months} meses`, margin, y);
    doc.text(`% sobre Base Reguladora: ${result.contributionPercentage.toFixed(2)}%`, 110, y);

    if (result.reductionPercentage && result.reductionPercentage > 0) {
      y += 7;
      doc.setTextColor(194, 65, 12); // orange-700
      doc.text(`Penalización por Adelanto (Rebaja): -${(result.reductionPercentage * 100).toFixed(1)}%`, margin, y);
      doc.setTextColor(30, 41, 59);
    }

    // CUANTÍA (SISTEMA DUAL)
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Cálculo de la Pensión (Sistema Dual)', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`Modelo A (Tradicional 25 años): ${result.finalPensionA.toLocaleString()} euros`, margin, y);
    y += 7;
    doc.text(`Modelo B (Extensión 29 años): ${result.finalPensionB.toLocaleString()} euros`, margin, y);
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const bestP = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;
    doc.text(`PENSIÓN ESTIMADA: ${bestP.toLocaleString()} € / mes`, margin, y);

    // COMPARATIVA SI NO ES ORDINARIA
    if (result.modality !== RetirementModality.ORDINARY) {
      const ordData = { ...originalData, modality: RetirementModality.ORDINARY, anticipationMonths: 0, delayedYears: 0 };
      const ordResult = calculateRetirement(ordData);
      const bestOrdP = ordResult.bestOption === 'A' ? ordResult.finalPensionA : ordResult.finalPensionB;
      const monthlyLoss = bestOrdP - bestP;

      y += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPARATIVA CON JUBILACIÓN ORDINARIA', margin, y);
      doc.line(margin, y + 2, 190, y + 2);
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Si esperas a la Edad Ordinaria (${ordResult.targetAge.years} años), cobrarías:`, margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${bestOrdP.toLocaleString()} € / mes`, 150, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Diferencia por anticipar ${result.anticipationMonths} meses:`, margin, y);
      doc.setTextColor(194, 65, 12);
      doc.text(`- ${monthlyLoss.toFixed(2)} € / mes`, 150, y);
      doc.setTextColor(30, 41, 59);
    }

    // Footer del PDF
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Este documento es una simulación basada en la normativa proyectada para 2026. JubilaTech S.L.', margin, 280);

    doc.save(`Informe_Jubilacion_${result.userName.replace(' ', '_')}.pdf`);
  };

  const bestPension = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;
  const difference = Math.abs(result.finalPensionA - result.finalPensionB);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* HEADER RESULTADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Estimación Mensual (14 Pagas)
              </span>
            </div>
            <h2 className="text-7xl font-black text-slate-900 flex items-baseline gap-2">
              {bestPension.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-3xl font-bold text-slate-300">€</span>
            </h2>
            {result.reductionPercentage && result.reductionPercentage > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                <i className="fa-solid fa-arrow-trend-down"></i>
                <span className="text-xs font-black uppercase">Rebaja por adelanto: -{(result.reductionPercentage * 100).toFixed(2)}%</span>
              </div>
            )}
            {result.delayBonus && result.delayBonus > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                <i className="fa-solid fa-arrow-trend-up"></i>
                <span className="text-xs font-black uppercase">Bonificación demora: +{(result.delayBonus * 100).toFixed(2)}%</span>
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Fecha de Jubilación</p>
              <p className="text-2xl font-black text-indigo-600 leading-none mb-2 text-right">{result.retirementDate}</p>
              <p className="text-xs font-bold text-slate-500 text-right">Edad: {result.targetAge.years} años y {result.targetAge.months} m</p>
            </div>
            <button 
              onClick={generatePDF}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <i className="fa-solid fa-file-pdf text-red-400"></i>
              Descargar Informe Completo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COMPARATIVA DUAL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <i className="fa-solid fa-calculator text-indigo-400"></i>
             Comparativa Sistema Dual
          </h4>
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'A' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/50 opacity-60'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-indigo-300 block">Modelo A (25 años)</span>
                {result.bestOption === 'A' && <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>}
              </div>
              <p className="text-2xl font-black">{result.finalPensionA.toFixed(2)}€</p>
            </div>
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'B' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/50 opacity-60'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-indigo-300 block">Modelo B (29 años - 24m peores)</span>
                {result.bestOption === 'B' && <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>}
              </div>
              <p className="text-2xl font-black">{result.finalPensionB.toFixed(2)}€</p>
            </div>
          </div>
          {difference > 0.01 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Diferencia mensual: </span>
              <span className="text-indigo-400 font-black">+{difference.toFixed(2)}€</span>
            </div>
          )}
        </div>

        {/* TIEMPO Y COTIZACIÓN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Proyección de Carrera</h4>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tiempo Restante</p>
              <p className="text-3xl font-black text-slate-800 leading-none">
                {result.timeRemaining.years}<small className="text-xs text-slate-400">a</small> {result.timeRemaining.months}<small className="text-xs text-slate-400">m</small>
              </p>
              <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Hasta jubilación efectiva</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cotización Final Proyectada</p>
              <p className="text-3xl font-black text-indigo-600 leading-none">
                {result.finalContribution.years}<small className="text-xs text-indigo-300">a</small> {result.finalContribution.months}<small className="text-xs text-indigo-300">m</small>
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Cumplirás el {(result.contributionPercentage).toFixed(0)}% del derecho</p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLEMENTOS */}
      {(result.genderGapSupplement > 0 || result.reductionPercentage! > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {result.genderGapSupplement > 0 && (
             <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <i className="fa-solid fa-hands-holding-child"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase">Brecha de Género</p>
                  <p className="text-lg font-black text-indigo-900">+{result.genderGapSupplement.toFixed(2)}€ <small className="text-xs font-bold text-indigo-500">incluidos</small></p>
                </div>
             </div>
           )}
           {result.reductionPercentage! > 0 && (
             <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white">
                  <i className="fa-solid fa-scissors"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase">Reducción Aplicada</p>
                  <p className="text-lg font-black text-orange-900">-{(result.reductionPercentage! * 100).toFixed(2)}% <small className="text-xs font-bold text-orange-500">sobre BR</small></p>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ResultsView;
