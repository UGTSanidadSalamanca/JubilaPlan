
import React from 'react';
import { UserData, CalculationResult } from './types.ts';
import { calculateRetirement } from './services/retirementLogic.ts';
import RetirementForm from './components/RetirementForm.tsx';
import ResultsView from './components/ResultsView.tsx';

const App: React.FC = () => {
  const [result, setResult] = React.useState<CalculationResult | null>(null);
  const [lastData, setLastData] = React.useState<UserData | null>(null);

  const handleCalculate = (data: UserData) => {
    const calc = calculateRetirement(data);
    setResult(calc);
    setLastData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-vault"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600 leading-none">
                JubilaTech 2026
              </h1>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">UGT Sanidad Salamanca</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <span className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Simulador Dual</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Legislación</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Ayuda Sindical</a>
          </nav>
          <div className="flex items-center gap-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Logo_UGT.svg/1200px-Logo_UGT.svg.png" alt="UGT" className="h-8 grayscale opacity-50" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            Tu Pensión, <span className="text-indigo-600 underline decoration-indigo-200">Transparente.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
            Calculadora inteligente de <b>UGT Sanidad Salamanca</b> adaptada a la normativa 2026. Analiza el impacto de tu jubilación con precisión profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <RetirementForm onCalculate={handleCalculate} />
          </div>
          <div className="lg:col-span-3">
            <ResultsView result={result} originalData={lastData} />
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-16 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Información Importante y Aviso Legal</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Esta calculadora es una herramienta de simulación elaborada por <span className="text-slate-900 font-bold">UGT Sanidad Salamanca</span>. 
                Los resultados obtenidos tienen un valor únicamente orientativo basado en la estimación de las bases de cotización aportadas por el usuario. 
                Esta herramienta <span className="text-slate-900 font-bold">no tiene validez jurídica ni vinculación administrativa</span>. 
                Dada la complejidad de la normativa de la Seguridad Social, se recomienda siempre consultar la legislación vigente o acudir directamente a las oficinas de la Seguridad Social o a los servicios jurídicos del sindicato para obtener cálculos oficiales.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">UGT Sanidad Salamanca</h5>
            <p className="leading-relaxed">Herramienta desarrollada para la defensa de los derechos de los trabajadores de la sanidad, facilitando la planificación de su futuro laboral con rigor y transparencia.</p>
          </div>
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">Enlaces Legales</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Normativa 2026</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Web Seguridad Social</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portal UGT Sanidad</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">Soporte Sindical</h5>
            <p>Si necesitas una consulta personalizada, contacta con tu delegado sindical.</p>
            <p className="mt-2 font-bold text-indigo-400">Salamanca, España</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-[10px] font-bold uppercase tracking-widest">
          © 2026 UGT Sanidad Salamanca | Calculadora de uso informativo no vinculante.
        </div>
      </footer>
    </div>
  );
};

export default App;
