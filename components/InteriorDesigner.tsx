import React, { useState } from 'react';
import { generateRedesign } from '../services/geminiService';
import { DesignOptions } from '../types';

interface InteriorDesignerProps {
  originalImage: string;
  onResult: (url: string) => void;
  deductCredit: () => void;
}

const InteriorDesigner: React.FC<InteriorDesignerProps> = ({ originalImage, onResult, deductCredit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DesignOptions>({
    roomType: 'Living Room',
    style: 'Modern Minimalist',
    budget: 'Medium',
    colorPreference: '',
    additionalPrompt: ''
  });

  const styles = [
    "Modern Minimalist", "Scandanavian", "Industrial", "Bohemian", 
    "Mid-Century Modern", "Luxury Art Deco", "Coastal", "Rustic Farmhouse", "Cyberpunk"
  ];

  const roomTypes = [
    "Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Outdoor Patio", "Commercial Space"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateRedesign(originalImage, options);
      onResult(result);
      deductCredit();
    } catch (e) {
      setError("Failed to generate redesign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Room Type */}
          <div>
            <label className="block text-xs uppercase text-slate-400 font-semibold mb-2">Room Type</label>
            <select
              value={options.roomType}
              onChange={(e) => setOptions({...options, roomType: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lumina-500"
            >
              {roomTypes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs uppercase text-slate-400 font-semibold mb-2">Budget Tier</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-600">
              {['Low', 'Medium', 'Luxury'].map((b) => (
                <button
                  key={b}
                  onClick={() => setOptions({...options, budget: b as any})}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                    options.budget === b ? 'bg-lumina-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block text-xs uppercase text-slate-400 font-semibold mb-2">Design Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setOptions({...options, style: s})}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${
                  options.style === s 
                  ? 'bg-lumina-500/20 border-lumina-500 text-lumina-300' 
                  : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4 mb-6">
           <div>
             <label className="block text-xs uppercase text-slate-400 font-semibold mb-2">Additional Instructions</label>
             <textarea
               value={options.additionalPrompt}
               onChange={(e) => setOptions({...options, additionalPrompt: e.target.value})}
               placeholder="e.g. Keep the wooden floor, add more plants, change wall color to sage green..."
               className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lumina-500 h-24 resize-none"
             />
           </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
              ${loading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-lumina-600 to-indigo-600 hover:from-lumina-500 hover:to-indigo-500 text-white shadow-lg shadow-lumina-500/20'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Designing your space...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Generate Transformation (1 Credit)</span>
              </>
            )}
          </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteriorDesigner;