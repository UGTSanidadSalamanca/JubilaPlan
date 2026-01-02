
import React from 'react';
import { CalculationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

interface Props {
  result: CalculationResult | null;
}

const ResultsView: React.FC<Props> = ({ result }) => {
  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe de Simulación de Jubilación', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado por JubilaTech 2026', pageWidth - 70, 25);

    // Body
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Titular', 20, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${result.userName}`, 20, 65);
    doc.text(`Cálculo efectuado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 72);

    // Results Box
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(20, 80, pageWidth - 40, 65, 'F');
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.rect(20, 80, pageWidth - 40, 65, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultado Principal', 30, 92);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha Estimada de Jubilación: ${result.retirementDate}`, 30, 102);
    doc.text(`Edad al Jubilarse: ${result.targetAge.years} años y ${result.targetAge.months} meses`, 30, 109);
    doc.text(`Tiempo de espera: ${result.timeRemaining.years} años, ${result.timeRemaining.months} meses y ${result.timeRemaining.days} días`, 30, 116);
    
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // Green-600
    doc.text(`Pensión Mensual: ${result.bestOption === 'A' ? result.finalPensionA.toFixed(2) : result.finalPensionB.toFixed(2)} EUR`, 30, 135);

    // Comparison Table
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparativa de Sistemas', 20, 160);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // System A
    doc.text('Sistema A (Tradicional - 25 años)', 20, 170);
    doc.text(`Base Reguladora: ${result.baseReguladoraA.toFixed(2)} EUR`, 30, 177);
    doc.text(`Cuantía Final A: ${result.finalPensionA.toFixed(2)} EUR`, 30, 184);

    // System B
    doc.text('Sistema B (Extendido - 29 años)', 20, 195);
    doc.text(`Base Reguladora: ${result.baseReguladoraB.toFixed(2)} EUR`, 30, 202);
    doc.text(`Cuantía Final B: ${result.finalPensionB.toFixed(2)} EUR`, 30, 209);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Opción más beneficiosa: Sistema ${result.bestOption}`, 20, 220);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const disclaimer = 'Este documento es una simulación basada en los datos proporcionados por el usuario para el año 2026. No tiene valor legal vinculante ante la Seguridad Social.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(splitDisclaimer, 20, 275);

    doc.save(`Informe_Jubilacion_${result.userName.replace(/\s+/g, '_')}.pdf`);
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
        <i className="fa-solid fa-file-invoice-dollar text-6xl mb-4 text-slate-200"></i>
        <p className="text-xl font-medium">Introduce tus datos para ver el cálculo</p>
        <p className="text-sm">Obtendrás fecha exacta y comparativa de base reguladora.</p>
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Nueva Cabecera sin solapamientos */}
        <div className="bg-slate-50 border-b border-slate-100 p-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-calculator text-blue-600"></i>
                Resultado del Análisis
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`px-4 py-2 font-bold text-[10px] uppercase tracking-tighter sm:tracking-widest ${result.bestOption === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'} rounded-full border ${result.bestOption === 'A' ? 'border-blue-200' : 'border-emerald-200'} shadow-sm flex-1 sm:flex-none text-center`}>
                  Mejor Opción: Sistema {result.bestOption === 'A' ? 'A (Tradicional)' : 'B (Dual)'}
                </div>
                <button 
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-[11px] font-bold py-2 px-5 rounded-full transition-all shadow-lg active:scale-95"
                >
                  <i className="fa-solid fa-download"></i>
                  PDF
                </button>
              </div>
           </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Hero Stats con Contador de Tiempo Claro */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">Fecha Estimada de Jubilación</p>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">{result.retirementDate}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span>A los {result.targetAge.years} años {result.targetAge.months > 0 ? `y ${result.targetAge.months} meses` : ''}</span>
                </div>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">Tiempo Total Restante</p>
                <div className="flex flex-wrap items-baseline gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-black block">{result.timeRemaining.years}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">años</span>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black block">{result.timeRemaining.months}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">meses</span>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black block">{result.timeRemaining.days}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">días</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] mt-4 flex items-center gap-1">
                  <i className="fa-solid fa-circle-info text-blue-500"></i>
                  Cuenta atrás basada en el calendario laboral 2026.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-slate-400 text-[10px] font-medium">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-fingerprint"></i>
                TITULAR: {result.userName.toUpperCase()}
              </span>
              <span className="hidden sm:inline bg-white/10 px-2 py-0.5 rounded italic">Simulación Oficial JubilaTech</span>
            </div>
          </div>

          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Edad Legal Ordinaria</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{result.ordinaryAge.years} años {result.ordinaryAge.months > 0 ? `y ${result.ordinaryAge.months} m` : ''}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">Referencia oficial para una carrera de cotización completa según Ley 27/2011.</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-colors">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Pensión Mensual Bruta</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <i className="fa-solid fa-euro-sign"></i>
                  </div>
                  <p className="text-4xl font-black text-emerald-700">
                    {result.bestOption === 'A' ? result.finalPensionA.toFixed(2) : result.finalPensionB.toFixed(2)} €
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 mt-6 font-bold flex items-center gap-1 uppercase">
                <i className="fa-solid fa-check-double"></i>
                Importe optimizado con Sistema {result.bestOption}
              </p>
            </div>
          </div>

          {/* Gráfico Comparativo */}
          <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/30">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-chart-column text-blue-500"></i>
                Proyección Comparativa de Cuantías
              </h4>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="4 4" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value) => [`${value} €`, 'Importe']}
                  />
                  <Bar dataKey="valor" barSize={20} radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (result.bestOption === 'A' ? 0 : 1) ? '#10b981' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detalles por Sistema */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-all ${result.bestOption === 'A' ? 'border-blue-200 bg-blue-50/50 ring-4 ring-blue-500/5' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Cálculo A: Tradicional</h4>
                {result.bestOption === 'A' && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">MEJOR</span>}
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Base (25 años)</span>
                  <span className="text-sm font-black text-slate-700">{result.baseReguladoraA.toFixed(2)}€</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Ajuste Coeficiente</span>
                  <span className={`text-sm font-black ${result.reductionPercentage! > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {result.reductionPercentage! > 0 ? `-${(result.reductionPercentage! * 100).toFixed(1)}%` : '0.0%'}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className={`p-6 rounded-2xl border transition-all ${result.bestOption === 'B' ? 'border-emerald-200 bg-emerald-50/50 ring-4 ring-emerald-500/5' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Cálculo B: Dual 2026</h4>
                {result.bestOption === 'B' && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">MEJOR</span>}
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Base (29 años)</span>
                  <span className="text-sm font-black text-slate-700">{result.baseReguladoraB.toFixed(2)}€</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Mejoras Aplicadas</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">24 meses excluidos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
