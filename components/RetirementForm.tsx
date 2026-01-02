
import React from 'react';
import { UserData, RetirementModality, ContributionBase } from '../types';

interface Props {
  onCalculate: (data: UserData) => void;
}

const RetirementForm: React.FC<Props> = ({ onCalculate }) => {
  const [formData, setFormData] = React.useState<UserData>({
    birthDate: '1961-05-15',
    totalYears: 38,
    totalMonths: 5,
    bases: Array.from({ length: 29 }, (_, i) => ({ year: 2025 - i, base: 2200 - (i * 20) })),
    children: 2,
    modality: RetirementModality.ORDINARY,
    unemploymentDuration: 0,
    delayedYears: 0,
    anticipationMonths: 12
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'modality' || name === 'birthDate' ? value : Number(value)
    }));
  };

  const handleBaseChange = (index: number, value: number) => {
    const newBases = [...formData.bases];
    newBases[index].base = value;
    setFormData(prev => ({ ...prev, bases: newBases }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const isAnticipated = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY || formData.modality === RetirementModality.ANTICIPATED_INVOLUNTARY;
  const maxAnticipation = formData.modality === RetirementModality.ANTICIPATED_VOLUNTARY ? 24 : 48;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Años Cotizados</label>
          <input 
            type="number" name="totalYears" value={formData.totalYears} onChange={handleChange} min="0"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meses Adicionales</label>
          <input 
            type="number" name="totalMonths" value={formData.totalMonths} onChange={handleChange} min="0" max="11"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad de Jubilación</label>
        <select 
          name="modality" value={formData.modality} onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value={RetirementModality.ORDINARY}>Ordinaria</option>
          <option value={RetirementModality.ANTICIPATED_VOLUNTARY}>Anticipada Voluntaria (Max 24m)</option>
          <option value={RetirementModality.ANTICIPATED_INVOLUNTARY}>Anticipada Involuntaria (Max 48m)</option>
          <option value={RetirementModality.DELAYED}>Demorada (+4% anual)</option>
        </select>
      </div>

      {isAnticipated && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-700 mb-2 flex justify-between">
            <span>Meses de Anticipación</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">{formData.anticipationMonths} meses</span>
          </label>
          <input 
            type="range" name="anticipationMonths" value={formData.anticipationMonths} 
            onChange={handleChange} min="1" max={maxAnticipation} step="1"
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[10px] text-blue-400 mt-2 italic">* El adelanto conlleva coeficientes reductores en la cuantía final.</p>
        </div>
      )}

      {formData.modality === RetirementModality.ANTICIPATED_INVOLUNTARY && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meses como demandante de empleo</label>
          <input 
            type="number" name="unemploymentDuration" value={formData.unemploymentDuration} onChange={handleChange} min="0"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      )}

      {formData.modality === RetirementModality.DELAYED && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Años de Demora</label>
          <input 
            type="number" name="delayedYears" value={formData.delayedYears} onChange={handleChange} min="1" max="10"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      )}

      <div className="pt-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-blue-600"></i>
          Historial de Bases (Últimos 29 años)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-lg">
          {formData.bases.map((b, idx) => (
            <div key={b.year} className="bg-slate-50 p-2 rounded-md">
              <span className="text-[10px] uppercase font-bold text-slate-400">{b.year}</span>
              <input 
                type="number" 
                value={b.base} 
                onChange={(e) => handleBaseChange(idx, Number(e.target.value))}
                className="w-full bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-calculator"></i>
        Calcular Jubilación 2026
      </button>
    </form>
  );
};

export default RetirementForm;
