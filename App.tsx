
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
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
              JubilaTech 2026
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <span className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Simulador Dual</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Legislación</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Ayuda</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://picsum.photos/seed/user/100" alt="Avatar" />
            </div>
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
            Calculadora inteligente adaptada a la normativa 2026. Analiza el impacto de la jubilación anticipada y elige el sistema de cálculo más beneficioso para ti.
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
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">JubilaTech S.L.</h5>
            <p className="leading-relaxed">Software de precisión para la planificación de la vida laboral basado en los algoritmos oficiales de la Seguridad Social española (Reforma 2026).</p>
          </div>
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">Enlaces Legales</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">BOE: Ley de Reforma de Pensiones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sede Electrónica Seguridad Social</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Garantía de Privacidad</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black mb-4 uppercase tracking-widest text-xs">Contacto</h5>
            <p>Soporte técnico especializado para profesionales.</p>
            <p className="mt-2 font-bold text-indigo-400">info@jubilatech.es</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-[10px] font-bold uppercase tracking-widest">
          © 2026 JubilaTech S.L. | Cálculos proyectados no vinculantes.
        </div>
      </footer>
    </div>
  );
};

export default App;
