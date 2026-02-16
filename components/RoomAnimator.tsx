import React, { useState, useEffect } from 'react';
import { generateRoomVideo } from '../services/geminiService';

interface RoomAnimatorProps {
  originalImage: string;
  onResult: (url: string) => void;
}

const RoomAnimator: React.FC<RoomAnimatorProps> = ({ originalImage, onResult }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const has = await window.aistudio.hasSelectedApiKey();
      setHasKey(has);
    } else {
      // If we are not in an environment with the global shim (e.g. outside IDX), 
      // we assume the env var is enough or handle differently. 
      // For this output, we follow the instruction to use the window method.
      // If the method is missing, we assume true for dev purposes or false if strict.
      // Let's assume true if the object is missing to avoid blocking UI in non-IDX envs 
      // where process.env might be directly set.
      setHasKey(!!process.env.API_KEY);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
      setHasKey(true);
    }
  };

  const handleAnimate = async () => {
    setLoading(true);
    setError(null);
    setStatus('Initializing Veo engine...');
    
    try {
      // Just before call, if we were in a "selecting key" flow, we ensure the service picks it up.
      // The service creates a new client instance each time.
      setStatus('Generating video frames (this may take a minute)...');
      const url = await generateRoomVideo(originalImage, prompt);
      onResult(url);
    } catch (e: any) {
      if (e.message && e.message.includes('Requested entity was not found')) {
         setError("API Key session expired or invalid. Please select your key again.");
         setHasKey(false);
      } else {
         setError("Video generation failed. Ensure your quota allows Veo generation.");
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  if (!hasKey) {
    return (
      <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Access Required</h3>
          <p className="text-slate-400 mb-6">
            Veo video generation requires a paid API key from a Google Cloud Project with billing enabled.
          </p>
          <button
            onClick={handleSelectKey}
            className="bg-lumina-600 hover:bg-lumina-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Select Paid API Key
          </button>
          <div className="mt-4">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sm text-lumina-400 hover:underline">
               Read Billing Documentation
             </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-slate-300">
            Camera Movement & Effects
            </label>
            <span className="text-xs text-lumina-400 font-mono">Model: veo-3.1-fast</span>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Cinematic slow pan to the right, ambient lighting..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lumina-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAnimate()}
          />
          <button
            onClick={handleAnimate}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
              ${loading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
          >
             {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            <span>Animate</span>
          </button>
        </div>

        {loading && (
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-lumina-500 h-2.5 rounded-full animate-pulse w-full"></div>
                <p className="text-xs text-center mt-2 text-lumina-300 animate-pulse">{status}</p>
            </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAnimator;