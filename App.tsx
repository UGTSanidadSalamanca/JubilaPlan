
import React from 'react';
import { UserData, CalculationResult } from './types';
import { calculateRetirement } from './services/retirementLogic';
import RetirementForm from './components/RetirementForm';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [result, setResult] = React.useState<CalculationResult | null>(null);

  const handleCalculate = (data: UserData) => {
    const calc = calculateRetirement(data);
    setResult(calc);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200">
              <i className="fa-solid fa-vault"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              JubilaTech 2026
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Seguridad Social</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Normativa</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Ayuda</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://picsum.photos/seed/user/100" alt="Avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Planifica tu Jubilación del Futuro
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Calculadora inteligente adaptada a la nueva reforma de 2026. Analiza el sistema dual, modalidades anticipadas y el complemento de brecha de género.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <RetirementForm onCalculate={handleCalculate} />
          </div>
          <div className="lg:col-span-3">
            <ResultsView result={result} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider">Sobre JubilaTech</h5>
            <p>Expertos en legislación laboral y Seguridad Social. Herramientas diseñadas para facilitar la transición a la jubilación.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider">Normativa 2026</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Sistema Dual de Cómputo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Edad Legal 2026</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carencia Genérica y Específica</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider">Contacto</h5>
            <p>Calle Falsa 123, Madrid, España</p>
            <p>Soporte técnico 24/7</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          © 2026 JubilaTech S.L. Todos los derechos reservados. No constituye asesoramiento legal vinculante.
        </div>
      </footer>
    </div>
  );
};

export default App;
