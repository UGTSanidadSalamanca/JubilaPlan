
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
    // Coeficiente reductor aproximado según meses (máx 21% a 24 meses)
    const reduction = (months / 24) * 0.21; 
    return (baseReg * percScale * (1 - reduction)) + result.genderGapSupplement;
  };

  const simulatedPension = getSimulatedPension(simulatedMonths);
  const ordinaryPension = getSimulatedPension(0);
  const costOfDecision = ordinaryPension - simulatedPension;
  const currentSimulatedReductionPerc = (simulatedMonths / 24) * 21;

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

          {/* Hoja de Ruta de Cotización */}
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

              {/* Bloque 2: Tiempo que resta */}
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
          </div>

          {/* Simulador Interactivo con Visualización de Rebaja */}
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-sliders text-blue-500"></i>
                Simulador de Impacto por Anticipación
              </h4>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${simulatedMonths > 0 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                {simulatedMonths > 0 ? `Rebaja: -${currentSimulatedReductionPerc.toFixed(2)}%` : 'Sin recortes'}
              </span>
            </div>

            <div className="space-y-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400">0 meses</div>
                  <div className="text-sm font-black text-slate-700">{simulatedMonths} meses antes</div>
                  <div className="text-[10px] font-bold text-slate-400">24 meses</div>
                </div>
                <input 
                  type="range" min="0" max="24" value={simulatedMonths} 
                  onChange={(e) => setSimulatedMonths(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
                />
                
                {/* Visualizador de Porcentaje de Rebaja */}
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex mb-6">
                   <div 
                    className="h-full bg-red-500 transition-all duration-300 ease-out" 
                    style={{ width: `${(currentSimulatedReductionPerc / 21) * 100}%` }}
                   ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-5 rounded-2xl text-center shadow-xl">
                  <p className="text-[9px] font-bold text-blue-400 uppercase mb-1 tracking-widest">Pensión Estimada</p>
                  <p className="text-3xl font-black">{simulatedPension.toFixed(2)}€</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Con adelanto de {simulatedMonths}m</p>
                </div>
                <div className="bg-white border-2 border-red-100 p-5 rounded-2xl text-center shadow-sm">
                  <p className="text-[9px] font-bold text-red-500 uppercase mb-1 tracking-widest">Pérdida de Poder</p>
                  <p className="text-3xl font-black text-red-600">-{costOfDecision.toFixed(2)}€</p>
                  <p className="text-[10px] text-red-400 mt-1 font-bold">-{currentSimulatedReductionPerc.toFixed(1)}% mensual</p>
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
