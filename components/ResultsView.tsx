
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
        <h4 className="text-xl font-black text-slate-400 tracking-tight uppercase tracking-[0.2em]">Esperando Datos</h4>
        <p className="text-sm text-slate-300 text-center max-w-xs mt-2 font-medium">Completa el formulario de UGT para visualizar tu proyección.</p>
      </div>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header Color Sidebar
    doc.setFillColor(220, 38, 38); // Red-600 (UGT)
    doc.rect(0, 0, 10, 297, 'F');

    // Branding
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE JUBILACIÓN 2026', margin, 25);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('SIMULACIÓN ELABORADA POR UGT SANIDAD SALAMANCA', margin, 32);

    // Datos Personales
    y = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL EXPEDIENTE', margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Titular: ${result.userName}`, margin, y);
    doc.text(`Fecha Nacimiento: ${new Date(originalData.birthDate).toLocaleDateString()}`, 110, y);
    y += 7;
    doc.text(`Cotización Base: ${result.currentContribution.years} años y ${result.currentContribution.months} meses`, margin, y);
    doc.text(`Hijos: ${originalData.children}`, 110, y);

    // RESULTADO PRINCIPAL
    y += 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, 170, 40, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, 170, 40, 'S');
    
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PENSIÓN MENSUAL ESTIMADA (14 PAGAS)', margin + 10, y);
    y += 15;
    doc.setFontSize(30);
    const bestP = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;
    doc.text(`${bestP.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, margin + 10, y);

    // DATOS DE JUBILACIÓN
    y += 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Proyección de Retiro', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Jubilación: ${result.retirementDate}`, margin, y);
    doc.text(`Modalidad: ${result.modality}`, 110, y);
    y += 7;
    doc.text(`Edad al Jubilarse: ${result.targetAge.years} años`, margin, y);
    doc.text(`Cotización Final: ${result.finalContribution.years} años y ${result.finalContribution.months} meses`, 110, y);

    // AVISO LEGAL CRÍTICO EN PDF
    y = 240;
    doc.setFillColor(254, 242, 242);
    doc.rect(margin, y, 170, 35, 'F');
    doc.setDrawColor(252, 165, 165);
    doc.rect(margin, y, 170, 35, 'S');
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('AVISO LEGAL IMPORTANTE:', margin + 5, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(69, 10, 10);
    const splitText = doc.splitTextToSize(
      "Este documento es una simulación elaborada por UGT Sanidad Salamanca. Los cálculos tienen valor ÚNICAMENTE BASADOS EN LA ESTIMACIÓN DE LA BASE y NO TIENEN VALIDEZ JURÍDICA NI VINCULACIÓN ADMINISTRATIVA. Se recomienda encarecidamente visitar la normativa legal existente o acudir a la Seguridad Social para cálculos oficiales.",
      160
    );
    doc.text(splitText, margin + 5, y);

    doc.save(`Simulacion_UGT_${result.userName.replace(/\s+/g, '_')}.pdf`);
  };

  const bestPension = result.bestOption === 'A' ? result.finalPensionA : result.finalPensionB;
  const difference = Math.abs(result.finalPensionA - result.finalPensionB);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* HEADER RESULTADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700 opacity-40"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Cálculo Sindical UGT
              </span>
            </div>
            <h2 className="text-7xl font-black text-slate-900 flex items-baseline gap-2 leading-none">
              {bestPension.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-3xl font-bold text-slate-300">€</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest italic">
              * Estimación sujeta a revisión jurídica y legislativa.
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-6 w-full md:w-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Jubilación</p>
              <p className="text-2xl font-black text-red-600 mb-1">{result.retirementDate}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{result.targetAge.years} años y {result.targetAge.months} meses</p>
            </div>
            <button 
              onClick={generatePDF}
              className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl active:scale-95 group"
            >
              <i className="fa-solid fa-file-pdf text-red-400 group-hover:text-white transition-colors"></i>
              Generar Informe Proyectado
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COMPARATIVA DUAL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/10 rounded-tl-full"></div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
             <i className="fa-solid fa-layer-group text-red-500"></i>
             Análisis Dual Comparativo
          </h4>
          <div className="space-y-4 relative z-10">
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'A' ? 'border-red-500 bg-red-500/10 shadow-lg' : 'border-slate-800 bg-slate-800/50 opacity-40'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Modelo A (25 años)</span>
                {result.bestOption === 'A' && <i className="fa-solid fa-check-circle text-red-500 text-xs"></i>}
              </div>
              <p className="text-3xl font-black">{result.finalPensionA.toFixed(2)}€</p>
            </div>
            <div className={`p-5 rounded-2xl border-2 transition-all ${result.bestOption === 'B' ? 'border-red-500 bg-red-500/10 shadow-lg' : 'border-slate-800 bg-slate-800/50 opacity-40'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Modelo B (Extensión 29a)</span>
                {result.bestOption === 'B' && <i className="fa-solid fa-check-circle text-red-500 text-xs"></i>}
              </div>
              <p className="text-3xl font-black">{result.finalPensionB.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        {/* TIEMPO Y COTIZACIÓN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Hitos del Expediente</h4>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espera Restante</p>
                <p className="text-2xl font-black text-slate-800">
                  {result.timeRemaining.years}a <span className="text-slate-300 font-bold">{result.timeRemaining.months}m</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Derecho Proyectado</p>
                <p className="text-2xl font-black text-red-600">
                  {result.contributionPercentage.toFixed(0)}% <span className="text-slate-300 font-bold">de la B.R.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER AVISO */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
         <i className="fa-solid fa-circle-info text-amber-500 mt-1"></i>
         <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest">
           Los resultados son estimaciones técnicas de UGT. Sin validez administrativa. Siempre coteje con la Seguridad Social.
         </p>
      </div>
    </div>
  );
};

export default ResultsView;
