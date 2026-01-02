
import React from 'react';
import { UserData, CalculationResult } from './types.ts';
import { calculateRetirement } from './services/retirementLogic.ts';
import RetirementForm from './components/RetirementForm.tsx';
import ResultsView from './components/ResultsView.tsx';

// Enlace directo convertido desde Google Drive para visualización correcta
const UGT_LOGO_URL = "https://drive.google.com/uc?export=view&id=1z6Rd1Tj_s1LUuLYfuKrQK7W4AdEqmT2w";

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
            <img src={UGT_LOGO_URL} alt="UGT Sanidad Salamanca" className="h-14 w-auto object-contain" />
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
            <a href="https://www.seg-social.es" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Seguridad Social</a>
            <a href="#" className="hover:text-red-600 transition-colors">Contacto Sindical</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex-grow">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-[0.9]">
              Planifica tu futuro con <br/>
              <span className="text-red-600">Rigor Sindical.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Herramienta avanzada elaborada por <b>UGT Sanidad Salamanca</b> para el cálculo proyectado de la jubilación bajo el nuevo sistema dual de 2026.
            </p>
          </div>
          <div className="hidden md:block">
             <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-100 animate-pulse">
                Normativa 2026 Actualizada
             </div>
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

        {/* Legal Disclaimer Section */}
        <div className="mt-16 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="bg-red-600 md:w-20 flex items-center justify-center p-6 text-white">
              <i className="fa-solid fa-scale-balanced text-3xl"></i>
            </div>
            <div className="p-8">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                Aviso Legal y de Responsabilidad
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">
                Esta calculadora es una herramienta elaborada por <span className="text-slate-900 font-bold">UGT Sanidad Salamanca</span>. 
                Los cálculos y resultados mostrados tienen un valor <span className="text-slate-900 font-bold">únicamente informativo y basado en la estimación</span> de la base de cotización proporcionada. 
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mr-2"></i>
                  Esta simulación <span className="text-red-700 underline decoration-red-200">no tiene validez jurídica ni vinculación administrativa</span>. 
                  Los parámetros de la Seguridad Social pueden variar según la situación individual y cambios legislativos de última hora. 
                  Es <span className="text-slate-900 font-bold">altamente recomendable visitar la normativa legal existente</span>, consultar la Sede Electrónica de la Seguridad Social o acudir a los servicios de asesoría jurídica de UGT para un análisis definitivo de su expediente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm border-b border-slate-800 pb-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={UGT_LOGO_URL} alt="UGT" className="h-12 brightness-0 invert opacity-90" />
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg leading-none">UGT Sanidad</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Salamanca</span>
                </div>
              </div>
              <p className="max-w-md leading-relaxed text-slate-400">
                Comprometidos con la transparencia y la defensa de los derechos de los profesionales de la salud. Esta herramienta es parte de nuestro servicio de apoyo al afiliado y trabajador.
              </p>
            </div>
            <div>
              <h5 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Recursos Legales</h5>
              <ul className="space-y-4 font-medium">
                <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-chevron-right text-[8px]"></i> Estatuto Marco</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-chevron-right text-[8px]"></i> BOE - Reforma Pensiones</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-chevron-right text-[8px]"></i> Cita Previa INSS</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Sede Salamanca</h5>
              <p className="font-bold text-white mb-2">UGT Salamanca</p>
              <p className="leading-relaxed mb-4">Servicios Jurídicos y Delegados de Sanidad.</p>
              <div className="text-red-500 font-black text-xs uppercase tracking-tighter">
                Contacto Sindical en Salamanca
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <span>© 2026 UGT Sanidad Salamanca - Herramienta de Simulación Sindical</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Uso de Datos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
