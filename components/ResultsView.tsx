
import React from 'react';
import { CalculationResult } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

interface Props {
  result: CalculationResult | null;
}

const ResultsView: React.FC<Props> = ({ result }) => {
  const [simulatedMonths, setSimulatedMonths] = React.useState<number>(12);

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe de Simulación de Jubilación', 20, 25);
    doc.save(`Informe_Jubilacion_${result.userName.replace(/\s+/g, '_')}.pdf`);
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
        <i className="fa-solid fa-file-invoice-dollar text-6xl mb-4 text-slate-200"></i>
        <p className="text-xl font-medium">Introduce tus datos para ver el cálculo</p>
      </div>
    );
  }

  if (!result.eligible) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl flex items-center gap-6 shadow-sm">
        <div className="bg-red-100 text-red-600 p-4 rounded-full">
          <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <div>
          <h3 className="text-red-800 text-xl font-bold">Cálculo Bloqueado</h3>
          <p className="text-red-700">{result.blockReason}</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Cálculo A (25a)', valor: Math.round(result.finalPensionA) },
    { name: 'Cálculo B (29a)', valor: Math.round(result.finalPensionB) },
  ];

  const getSimulatedPension = (months: number) => {
    const baseReg = result.bestOption === 'A' ? result.baseReguladoraA : result.baseReguladoraB;
    const percScale = result.contributionPercentage / 100;
    const reduction = (months / 24) * 0.21; 
    return (baseReg * percScale * (1 - reduction)) + result.genderGapSupplement;
  };

  const simulatedPension = getSimulatedPension(simulatedMonths);
  const ordinaryPension = getSimulatedPension(0);
  const costOfDecision = ordinaryPension - simulatedPension;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-slate-50 border-b border-slate-100 p-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-calculator text-blue-600"></i>
                Análisis Proyectado 2026
              </h2>
              <button 
                onClick={downloadPDF}
                className="bg-slate-900 hover:bg-black text-white text-[11px] font-bold py-2 px-5 rounded-full transition-all"
              >
                Descargar Informe
              </button>
           </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Hero Stats */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">Fecha de Jubilación</p>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">{result.retirementDate}</h3>
                <p className="text-slate-400 text-sm">A los {result.targetAge.years} años y {result.targetAge.months} meses</p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 text-right">
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">Pensión Proyectada</p>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-5xl font-black">{result.bestOption === 'A' ? result.finalPensionA.toFixed(2) : result.finalPensionB.toFixed(2)}</span>
                  <span className="text-xl font-bold">€</span>
                </div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold uppercase">
                    {result.contributionPercentage.toFixed(1)}% Base Reguladora
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hoja de Ruta de Cotización Corregida */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fa-solid fa-road text-blue-500"></i>
              Proyección de Vida Laboral (Hoy → Jubilación)
            </h4>
            
            <div className="space-y-4">
              {/* Bloque 1: Situación Actual */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 shrink-0">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Trabajado a día de hoy</p>
                  <p className="text-lg font-bold text-slate-700">{result.currentContribution.years} años y {result.currentContribution.months} meses</p>
                </div>
              </div>

              {/* Bloque 2: Tiempo que resta (Simbolizado como suma) */}
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 ml-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-blue-500 uppercase">Tiempo restante (Suponiendo trabajo continuo)</p>
                  <p className="text-lg font-bold text-blue-700">+{result.timeRemaining.years} años y {result.timeRemaining.months} meses</p>
                  <p className="text-[9px] text-blue-400 italic">Estimado hasta el {result.retirementDate}</p>
                </div>
              </div>

              {/* Bloque 3: Total Final */}
              <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 ring-2 ring-emerald-500/10">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                  <i className="fa-solid fa-flag-checkered"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-wider">Cotización Total Proyectada al Jubilarse</p>
                  <p className="text-2xl font-black text-emerald-800">{result.finalContribution.years} años y {result.finalContribution.months} meses</p>
                  <div className="mt-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase">
                    Utilizado para el cálculo de cuantía
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
               <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-2">
                 <span>Progreso de carrera</span>
                 <span>{result.contributionPercentage.toFixed(1)}% de pensión</span>
               </div>
               <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                 <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (result.currentContribution.years / 36.5) * 100)}%` }}></div>
                 <div className="h-full bg-blue-300" style={{ width: `${Math.min(100 - (result.currentContribution.years / 36.5) * 100, (result.timeRemaining.years / 36.5) * 100)}%` }}></div>
               </div>
               <p className="text-[9px] text-slate-400 mt-2 text-center italic">
                 Has completado el {((result.currentContribution.years / result.finalContribution.years) * 100).toFixed(0)}% de tu carrera proyectada.
               </p>
            </div>
          </div>

          {/* Simulador Interactivo */}
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-blue-500"></i>
              Impacto de Anticipación Interactivo
            </h4>
            <div className="space-y-4">
              <input 
                type="range" min="0" max="24" value={simulatedMonths} 
                onChange={(e) => setSimulatedMonths(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Pensión a {simulatedMonths}m</p>
                  <p className="text-2xl font-black">{simulatedPension.toFixed(2)}€</p>
                </div>
                <div className="bg-white border border-red-100 p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-red-500 uppercase mb-1">Diferencia Mensual</p>
                  <p className="text-2xl font-black text-red-600">-{costOfDecision.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
