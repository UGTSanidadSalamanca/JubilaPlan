
import React from 'react';
import { CalculationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  result: CalculationResult | null;
}

const ResultsView: React.FC<Props> = ({ result }) => {
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
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        <div className={`absolute top-0 right-0 p-4 font-bold text-xs uppercase tracking-widest ${result.bestOption === 'A' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-bl-xl shadow-sm`}>
          Mejor Opción: Sistema {result.bestOption === 'A' ? 'Tradicional' : 'Extendido'}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
          <i className="fa-solid fa-calendar-check text-blue-600"></i>
          Tu Plan de Jubilación
        </h2>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl mb-8 shadow-inner">
          <p className="text-blue-300 text-sm font-bold uppercase tracking-wider mb-2">Fecha Estimada de Jubilación</p>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <h3 className="text-4xl md:text-5xl font-black text-white">{result.retirementDate}</h3>
            <span className="text-slate-400 mb-2 font-medium">
              (a los {result.targetAge.years} años {result.targetAge.months > 0 ? `y ${result.targetAge.months} m` : ''})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Edad Ordinaria Legal</p>
            <p className="text-2xl font-bold text-slate-800">{result.ordinaryAge.years} años {result.ordinaryAge.months > 0 ? `y ${result.ordinaryAge.months} m` : ''}</p>
            <p className="text-[10px] text-slate-400 mt-2">Basado en tu carrera de cotización para 2026.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <p className="text-xs font-bold text-green-500 uppercase mb-1">Pensión Mensual Estimada</p>
            <p className="text-4xl font-black text-green-600">
              {result.bestOption === 'A' ? result.finalPensionA.toFixed(2) : result.finalPensionB.toFixed(2)} €
            </p>
            <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">Incluye complementos aplicables</p>
          </div>
        </div>

        <div className="mb-8 p-6 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-blue-500"></i>
            Comparativa de Sistemas (Pensión Bruta)
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="valor" barSize={30} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === (result.bestOption === 'A' ? 0 : 1) ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-5 rounded-xl border ${result.bestOption === 'A' ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
            <h4 className="font-bold text-slate-700 mb-2 flex justify-between items-center">
              Sistema A (25 años)
              {result.bestOption === 'A' && <i className="fa-solid fa-circle-check text-blue-500"></i>}
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex justify-between"><span>Base Reguladora:</span> <span className="font-bold">{result.baseReguladoraA.toFixed(2)}€</span></li>
              <li className="flex justify-between"><span>Coef. Reductor:</span> <span className="text-red-500">-{ (result.reductionPercentage! * 100).toFixed(2) }%</span></li>
              <li className="flex justify-between"><span>Bono Demora:</span> <span className="text-green-600">+{ (result.delayBonus! * 100).toFixed(2) }%</span></li>
            </ul>
          </div>
          <div className={`p-5 rounded-xl border ${result.bestOption === 'B' ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
            <h4 className="font-bold text-slate-700 mb-2 flex justify-between items-center">
              Sistema B (29 años)
              {result.bestOption === 'B' && <i className="fa-solid fa-circle-check text-green-500"></i>}
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex justify-between"><span>Base Reguladora:</span> <span className="font-bold">{result.baseReguladoraB.toFixed(2)}€</span></li>
              <li className="flex justify-between"><span>(Descartados:</span> <span className="italic">24 meses más bajos)</span></li>
              <li className="flex justify-between"><span>Complemento Hijos:</span> <span className="text-green-600">+{result.genderGapSupplement.toFixed(2)}€</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 text-9xl text-white/10 group-hover:rotate-12 transition-transform duration-500">
           <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-full">
            <i className="fa-solid fa-lightbulb text-xl"></i>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Información Clave</h4>
            <p className="text-sm text-blue-100 leading-relaxed">
              Basándonos en la fecha de nacimiento ({new Date(result.retirementDate).getFullYear() - result.targetAge.years}), tu jubilación ordinaria para el 2026 se estima el <span className="font-bold underline">{result.retirementDate}</span>. 
              {result.reductionPercentage! > 0 ? ' Al haber elegido una modalidad anticipada, se aplican coeficientes que reducen la cuantía mensual.' : ' Has optado por la modalidad ordinaria/demorada, lo que maximiza tu base reguladora.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
