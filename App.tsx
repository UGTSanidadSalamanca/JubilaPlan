
import React from 'react';
import { UserData, CalculationResult } from './types.ts';
import { calculateRetirement } from './services/retirementLogic.ts';
import RetirementForm from './components/RetirementForm.tsx';
import ResultsView from './components/ResultsView.tsx';

const UGT_LOGO_URL = "https://scontent-mad2-1.xx.fbcdn.net/v/t39.30808-6/484583121_1041730604663532_8021505965400259448_n.jpg?_nc_cat=108&cb2=99be929b-bd9a46d7&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=EIh0PGLg6PEQ7kNvwETx6wd&_nc_oc=AdlF6-0M239zk5jBH8peONssl7G7ej5ekZc9HhTEh9cV97vz1LC21qYnLKqR2GxIedw&_nc_zt=23&_nc_ht=scontent-mad2-1.xx&_nc_gid=wEsrwymv9XFwb9iBY3a7pA&oh=00_Afpm0-qPPzRA9zXQEkDhM7guQmD4mOq82lnSvI8FhXcycg&oe=695E8DDB";

const App: React.FC = () => {
  const [result, setResult] = React.useState<CalculationResult | null>(null);
  const [lastData, setLastData] = React.useState<UserData | null>(null);

  const handleCalculate = (data: UserData) => {
    const calc = calculateRetirement(data);
    setResult(calc);
    setLastData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center bg-white p-1 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
              <img 
                src={UGT_LOGO_URL} 
                alt="UGT Sanidad Salamanca" 
                className="h-14 w-auto object-contain transition-transform hover:scale-105 duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Logo_UGT.svg/1024px-Logo_UGT.svg.png";
                }}
              />
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 leading-none">
                JubilaTech 2026
              </h1>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                UGT Sanidad Salamanca
              </span>
            </div>
          </div>
          <nav className="hidden lg:flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="text-red-600 border-b-2 border-red-600 pb-1 cursor-default">Simulador Dual</span>
            <a href="https://www.seg-social.es" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Sede Electrónica</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex-grow">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-[0.9]">
              Tu retiro, calculado con <br/>
              <span className="text-red-600">Rigor Sindical.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Herramienta avanzada de <b>UGT Sanidad Salamanca</b> para el cálculo proyectado bajo el nuevo sistema dual 2026.
            </p>
          </div>
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

      {/* Footer Minimalista */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-800 pb-8 mb-8">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <img src={UGT_LOGO_URL} alt="UGT" className="h-10 rounded shadow-md grayscale" />
                <span className="text-white font-black uppercase tracking-widest text-xs">UGT Sanidad Salamanca</span>
              </div>
              <p className="text-xs leading-relaxed">
                Este simulador es una herramienta informativa. Los resultados son estimaciones técnicas sin validez jurídica ni administrativa. Recomendamos contrastar siempre con los servicios jurídicos de UGT o la Seguridad Social.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h5 className="text-white font-black mb-4 uppercase tracking-widest text-[10px]">Salamanca</h5>
                <p className="text-xs">Servicios Jurídicos</p>
                <p className="text-xs text-red-500 font-bold">Especialistas en Sanidad</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <span>© 2026 UGT Sanidad Salamanca</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto Afiliados</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
