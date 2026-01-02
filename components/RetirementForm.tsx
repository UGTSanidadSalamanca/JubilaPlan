
import React from 'react';
import { UserData, RetirementModality, ContributionBase } from '../types.ts';

const UGT_LOGO_URL = "https://drive.google.com/uc?export=view&id=1z6Rd1Tj_s1LUuLYfuKrQK7W4AdEqmT2w";

interface Props {
  onCalculate: (data: UserData) => void;
}

const RetirementForm: React.FC<Props> = ({ onCalculate }) => {
  const [currentBase, setCurrentBase] = React.useState<number>(2081);
  const [formData, setFormData] = React.useState<UserData>({
    userName: 'Tu Nombre Aquí',
    birthDate: '1967-09-10',
    totalYears: 34,
    totalMonths: 5,
    bases: [], 
    children: 0,
    modality: RetirementModality.ORDINARY,
    delayedYears: 0,
    anticipationMonths: 0
  });

  // Disparar cálculo automático en cada cambio
  React.useEffect(() => {
    const simulatedBases: ContributionBase[] = [{ year: 2026, base: currentBase }];
    onCalculate({ ...formData, bases: simulatedBases });
  }, [formData, currentBase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: (name === 'userName' || name === 'birthDate' || name === 'modality') ? value : Number(value) };
      
      // Resetear anticipación si se cambia de modalidad
      if (name === 'modality') {
        newState.anticipationMonths = 0;
        newState.delayedYears = 0;
      }
      return newState;
    });
  };

  const isAnticipated = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY || formData.modality === RetirementModality.ANTICIPATED_INVOLUNTARY;
  const maxAnt = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY ? 24 : 48;

  // Cálculo rápido del porcentaje para el feedback visual en el form
  const getPreviewReduction = () => {
    if (formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY) {
      return (formData.anticipationMonths! / 24) * 21;
    }
    if (formData.modality === RetirementModality.ANTICIPATED_INVOLUNTARY) {
      return (formData.anticipationMonths! / 48) * 30;
    }
    return 0;
  };

  const previewReduction = getPreviewReduction();

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
      {/* Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[5rem] -mr-16 -mt-16 z-0 opacity-50"></div>
      
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-red-200">
            <i className="fa-solid fa-user-gear"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Tu Perfil</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UGT Sanidad Salamanca</p>
          </div>
        </div>
        <img src={UGT_LOGO_URL} alt="UGT Logo" className="h-10 w-auto opacity-100" />
      </div>

      <div className="space-y-6 relative z-10">
        {/* Identidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nombre Completo</label>
            <input type="text" name="userName" value={formData.userName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-bold text-slate-700 bg-slate-50/50" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Fecha Nacimiento</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-bold text-slate-700 bg-slate-50/50" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Número de Hijos</label>
            <input type="number" name="children" value={formData.children} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-bold text-slate-700 bg-slate-50/50" />
          </div>
        </div>

        {/* Economía */}
        <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl border border-slate-800">
          <label className="text-[10px] font-black text-red-400 uppercase mb-4 block text-center tracking-[0.2em]">Situación de Cotización</label>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block tracking-wider">Años hoy</label>
              <input type="number" name="totalYears" value={formData.totalYears} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 text-center font-black text-xl text-red-400 outline-none focus:border-red-500" />
            </div>
            <div className="text-center">
              <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block tracking-wider">Meses hoy</label>
              <input type="number" name="totalMonths" value={formData.totalMonths} onChange={handleChange} max="11" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 text-center font-black text-xl text-red-400 outline-none focus:border-red-500" />
            </div>
          </div>
          <div className="relative pt-4 border-t border-slate-800">
             <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block text-center tracking-widest">Base Mensual Actual (€)</label>
             <input 
              type="number" value={currentBase} onChange={(e) => setCurrentBase(Number(e.target.value))}
              className="w-full bg-transparent text-3xl font-black text-center outline-none focus:text-red-400 transition-colors"
             />
             <p className="text-[9px] text-slate-400 mt-2 text-center italic font-medium px-4">
                Usa tu base actual de nómina. UGT la proyectará para el cálculo dual.
             </p>
          </div>
        </div>

        {/* Modalidad */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Acceso a la Pensión</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: RetirementModality.ORDINARY, label: 'Jubilación Ordinaria', icon: 'fa-calendar-check' },
              { id: RetirementModality.ANTICIPATED_VOLUNTARY, label: 'Anticipada Voluntaria', icon: 'fa-user-clock' },
              { id: RetirementModality.ANTICIPATED_INVOLUNTARY, label: 'Anticipada Forzosa', icon: 'fa-briefcase-slash' },
              { id: RetirementModality.DELAYED, label: 'Jubilación Demorada', icon: 'fa-arrow-up-right-dots' }
            ].map(mod => (
              <button 
                key={mod.id} type="button" 
                onClick={() => setFormData(prev => ({ ...prev, modality: mod.id, anticipationMonths: 0, delayedYears: 0 }))}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.modality === mod.id ? 'border-red-600 bg-red-50/50 text-red-900 shadow-sm font-black' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
              >
                <i className={`fa-solid ${mod.icon} text-lg ${formData.modality === mod.id ? 'text-red-600' : 'text-slate-300'}`}></i>
                <span className="text-sm">{mod.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ajustes de modalidad */}
        {isAnticipated && (
          <div className="p-6 bg-red-600 rounded-3xl text-white animate-in zoom-in-95 shadow-xl shadow-red-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Meses de Adelanto</span>
                <span className="text-3xl font-black leading-none">{formData.anticipationMonths}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest block mb-1 text-red-200">Impacto Vitalicio</span>
                <span className="text-2xl font-black text-white">-{previewReduction.toFixed(1)}%</span>
              </div>
            </div>
            <input 
              type="range" name="anticipationMonths" value={formData.anticipationMonths} 
              onChange={handleChange} min="1" max={maxAnt} step="1"
              className="w-full h-2 bg-red-400 rounded-lg appearance-none cursor-pointer accent-white mb-2"
            />
            <div className="flex justify-between text-[9px] font-bold text-red-100 uppercase tracking-widest">
              <span>Mínimo</span>
              <span>Máximo ({maxAnt}m)</span>
            </div>
          </div>
        )}

        {formData.modality === RetirementModality.DELAYED && (
          <div className="p-6 bg-emerald-600 rounded-3xl text-white animate-in zoom-in-95">
             <label className="text-[10px] font-black uppercase tracking-widest mb-4 block text-center">Bonificación por Demora</label>
             <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map(y => (
                 <button 
                  key={y} type="button" onClick={() => setFormData(prev => ({ ...prev, delayedYears: y }))}
                  className={`flex-1 py-3 rounded-xl font-black text-lg transition-all ${formData.delayedYears === y ? 'bg-white text-emerald-700 shadow-xl scale-105' : 'bg-emerald-500/50 text-emerald-100 hover:bg-emerald-500'}`}
                 >
                   +{y}a
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetirementForm;
