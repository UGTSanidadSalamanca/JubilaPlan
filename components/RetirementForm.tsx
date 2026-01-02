
import React from 'react';
import { UserData, RetirementModality, ContributionBase } from '../types.ts';

interface Props {
  onCalculate: (data: UserData) => void;
}

const RetirementForm: React.FC<Props> = ({ onCalculate }) => {
  const initialBases: ContributionBase[] = [
    { year: 2026, base: 2311.36 },
    { year: 2025, base: 1988.98 },
    { year: 2024, base: 2132.47 },
    { year: 2023, base: 1700.00 },
    { year: 2022, base: 1662.96 },
    { year: 2021, base: 1574.43 },
    { year: 2020, base: 1560.36 },
    { year: 2019, base: 1510.41 },
    { year: 2018, base: 1473.34 },
    { year: 2017, base: 1542.46 },
    { year: 2016, base: 1830.50 },
    { year: 2015, base: 1940.00 },
    { year: 2014, base: 1899.97 },
    { year: 2013, base: 1813.20 },
    { year: 2012, base: 1687.09 },
    { year: 2011, base: 1854.93 },
    { year: 2010, base: 1810.34 },
    { year: 2009, base: 1752.31 },
    { year: 2008, base: 1851.87 },
    { year: 2007, base: 1677.11 },
    { year: 2006, base: 1778.75 },
    { year: 2005, base: 1454.50 },
    ...Array.from({ length: 7 }, (_, i) => ({ year: 2004 - i, base: 1300 - (i * 20) }))
  ];

  const [formData, setFormData] = React.useState<UserData>({
    userName: 'José Rodríguez Gómez',
    birthDate: '1970-09-10',
    totalYears: 32,
    totalMonths: 8,
    bases: initialBases,
    children: 0,
    modality: RetirementModality.ORDINARY,
    unemploymentDuration: 0,
    delayedYears: 0,
    anticipationMonths: 12
  });

  React.useEffect(() => {
    onCalculate(formData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'modality' || name === 'birthDate' || name === 'userName' ? value : Number(value)
    }));
  };

  const handleBaseChange = (index: number, value: number) => {
    const newBases = [...formData.bases];
    newBases[index].base = value;
    setFormData(prev => ({ ...prev, bases: newBases }));
  };

  const setAnticipation = (months: number) => {
    setFormData(prev => ({ ...prev, anticipationMonths: months }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const isAnticipated = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY || formData.modality === RetirementModality.ANTICIPATED_INVOLUNTARY;
  const maxAnticipation = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY ? 24 : 48;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800">Datos Personales</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <i className="fa-solid fa-user"></i>
          </span>
          <input 
            type="text" name="userName" value={formData.userName} onChange={handleChange}
            placeholder="Introduce tu nombre"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
          <input 
            type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hijos (Brecha de Género)</label>
          <input 
            type="number" name="children" value={formData.children} onChange={handleChange} min="0"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Situación de Cotización Actual</h3>
        <p className="text-xs text-slate-400 mb-4">Indica los años y meses que tienes acumulados en tu vida laboral a día de hoy.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Años Cotizados Hoy</label>
            <input 
              type="number" name="totalYears" value={formData.totalYears} onChange={handleChange} min="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meses Adicionales Hoy</label>
            <input 
              type="number" name="totalMonths" value={formData.totalMonths} onChange={handleChange} min="0" max="11"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad Deseada</label>
        <select 
          name="modality" value={formData.modality} onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value={RetirementModality.ORDINARY}>Ordinaria</option>
          <option value={RetirementModality.ANTICIPATED_VOLUNTARY}>Anticipada Voluntaria</option>
          <option value={RetirementModality.ANTICIPATED_INVOLUNTARY}>Anticipada Involuntaria</option>
          <option value={RetirementModality.DELAYED}>Demorada (+4% anual)</option>
        </select>
      </div>

      {isAnticipated && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-blue-700">
              Anticipación: <span className="bg-blue-600 text-white px-2 py-0.5 rounded ml-1">{formData.anticipationMonths} meses</span>
            </label>
            <div className="flex gap-2">
              <button 
                type="button" onClick={() => setAnticipation(12)}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${formData.anticipationMonths === 12 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
              >
                12m
              </button>
              <button 
                type="button" onClick={() => setAnticipation(24)}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${formData.anticipationMonths === 24 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
              >
                24m
              </button>
            </div>
          </div>
          <input 
            type="range" name="anticipationMonths" value={formData.anticipationMonths} 
            onChange={handleChange} min="1" max={maxAnticipation} step="1"
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-blue-600"></i>
          Historial de Bases (Últimos 29 años)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-lg">
          {formData.bases.map((b, idx) => (
            <div key={b.year} className="bg-slate-50 p-2 rounded-md border border-transparent hover:border-blue-200 transition-colors">
              <span className="text-[9px] uppercase font-black text-slate-400">{b.year}</span>
              <input 
                type="number" value={b.base} 
                onChange={(e) => handleBaseChange(idx, Number(e.target.value))}
                className="w-full bg-transparent text-sm font-bold outline-none border-b border-transparent focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <i className="fa-solid fa-calculator"></i>
        CALCULAR JUBILACIÓN 2026
      </button>
    </form>
  );
};

export default RetirementForm;
