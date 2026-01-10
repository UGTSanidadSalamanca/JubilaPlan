
import React from 'react';
import { CalculationResult, RetirementModality, UserData } from '../types.ts';
import { UGT_LOGO_URL, UGT_FALLBACK_LOGO } from '../constants.ts';
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
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cálculo en tiempo real</h4>
        <p className="text-xs text-slate-300 text-center max-w-xs mt-2 font-medium">Modifica los datos del formulario para ver tu proyección.</p>
      </div>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Decoración lateral roja
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 10, 297, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE JUBILACIÓN 2026', margin, 25);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('UGT SANIDAD SALAMANCA - SIMULACIÓN ESTIMADA', margin, 32);

    y = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DEL EXPEDIENTE', margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Titular: ${result.userName}`, margin, y);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 110, y);
    y += 7;
    doc.text(`Años cotizados: ${result.currentContribution.years}a ${result.currentContribution.months}m`, margin, y);
    doc.text(`Modalidad: ${result.modality}`, 110, y);

    y += 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, 170, 40, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, 170, 40, 'S');
    
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('PENSIÓN MENSUAL ESTIMADA (14 PAGAS)', margin + 10, y);
    y += 15;
    doc.setFontSize(30);
    const bestP = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;
    doc.text(`${bestP.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, margin + 10, y);

    if (result.ordinaryComparison) {
      y += 30;
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text('COMPARATIVA CON JUBILACIÓN ORDINARIA:', margin, y);
      y += 8;
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pensión Ordinaria: ${result.ordinaryComparison.pension.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, margin, y);
      doc.text(`Diferencia mensual: -${result.ordinaryComparison.diffMonthly.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, margin, y + 7);
      doc.text(`Fecha Ordinaria: ${result.ordinaryComparison.date}`, margin, y + 14);
    }

    y = 270;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Documento informativo elaborado por UGT Sanidad Salamanca.', margin, y);

    doc.save(`Simulacion_UGT_${result.userName.replace(/\s+/g, '_')}.pdf`);
  };

  const bestPension = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* RESULTADO PRINCIPAL */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700 opacity-40"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Pensión Proyectada</span>
            <h2 className="text-6xl font-black text-slate-900 flex items-baseline gap-2 leading-none">
              {bestPension.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-3xl font-bold text-slate-300">€</span>
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
               <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Modalidad elegida</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-2 w-full md:w-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu fecha de salida</p>
              <p className="text-2xl font-black text-red-600 mb-1">{result.retirementDate}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{result.targetAge.years} años y {result.targetAge.months} meses</p>
            </div>
            
            <button 
              onClick={generatePDF}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-red-700 transition-all shadow-xl active:scale-95 group"
            >
              <i className="fa-solid fa-file-pdf text-red-400 group-hover:text-white transition-colors"></i>
              Descargar Informe Completo (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* COMPARATIVA CON ORDINARIA (SI ES ANTICIPADA) */}
      {result.ordinaryComparison && (
        <div className="bg-white border-2 border-red-100 rounded-[2.5rem] p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <i className="fa-solid fa-scale-unbalanced-flip text-red-100 text-6xl opacity-50"></i>
          </div>
          <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-3">
             <i className="fa-solid fa-triangle-exclamation"></i>
             ¿Qué pierdes al anticipar?
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Pensión Ordinaria</span>
               <p className="text-2xl font-black text-slate-800">
                {result.ordinaryComparison.pension.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
               </p>
               <p className="text-[9px] font-medium text-slate-500 mt-1 italic">Si esperas al {result.ordinaryComparison.date}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
               <span className="text-[9px] font-bold text-red-400 uppercase block mb-1">Pérdida Mensual</span>
               <p className="text-2xl font-black text-red-600">
                -{result.ordinaryComparison.diffMonthly.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
               </p>
               <p className="text-[9px] font-black text-red-400 uppercase mt-1">Impacto vitalicio</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Diferencia de tiempo</span>
               <p className="text-xl font-black text-slate-800">
                +{result.anticipationMonths} meses
               </p>
               <p className="text-[9px] font-medium text-slate-500 uppercase">de descanso adicional</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COMPARATIVA DUAL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/10 rounded-tl-full"></div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <i className="fa-solid fa-layer-group text-red-500"></i>
             Comparativa de Cálculo Dual
          </h4>
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'A' ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-800/50 opacity-40'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Modelo A (Últimos 25a)</span>
                {result.bestOption === 'A' && <i className="fa-solid fa-check-circle text-red-500 text-xs"></i>}
              </div>
              <p className="text-2xl font-black">{result.finalPensionA.toFixed(2)}€</p>
            </div>
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'B' ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-800/50 opacity-40'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Modelo B (27 de 29a)</span>
                {result.bestOption === 'B' && <i className="fa-solid fa-check-circle text-red-500 text-xs"></i>}
              </div>
              <p className="text-2xl font-black">{result.finalPensionB.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        {/* HITOS */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Derechos Adquiridos</h4>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Tiempo restante</p>
                <p className="text-xl font-black text-slate-800">
                  {result.timeRemaining.years}a <span className="text-slate-400 font-bold">{result.timeRemaining.months}m</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Escala de Cotización</p>
                <p className="text-xl font-black text-red-600">
                  {result.contributionPercentage.toFixed(0)}% <span className="text-slate-400 font-bold text-sm">Base Reg.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center px-8">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
           <i className="fa-solid fa-circle-info text-slate-300 text-xs"></i>
           Cálculo proyectado basado en la normativa vigente para 2026.
         </p>
      </div>
    </div>
  );
};

export default ResultsView;
