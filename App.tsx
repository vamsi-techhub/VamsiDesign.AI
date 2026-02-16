import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import InteriorDesigner from './components/InteriorDesigner';
import RoomAnimator from './components/RoomAnimator';
import AnalysisChart from './components/AnalysisChart';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import { AppMode, DesignState } from './types';
import { analyzeRoom } from './services/geminiService';

const App = () => {
  const [state, setState] = useState<DesignState>({
    originalImage: null,
    generatedHistory: [],
    isAnalyzing: false,
    isGenerating: false,
    analysisData: null,
    credits: 5
  });

  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [activeTab, setActiveTab] = useState<'design' | 'video'>('design');

  const handleImageUpload = async (base64: string) => {
    setState(prev => ({ ...prev, originalImage: base64, isAnalyzing: true }));
    setMode(AppMode.DESIGNER);
    
    try {
      const analysis = await analyzeRoom(base64);
      setState(prev => ({ ...prev, analysisData: analysis, isAnalyzing: false }));
    } catch (e) {
      console.error("Analysis failed", e);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleDesignResult = (url: string) => {
    setState(prev => ({
      ...prev,
      generatedHistory: [{ type: 'image', url, prompt: 'Redesign', timestamp: Date.now() }, ...prev.generatedHistory]
    }));
  };

  const handleVideoResult = (url: string) => {
    setState(prev => ({
      ...prev,
      generatedHistory: [{ type: 'video', url, prompt: 'Animation', timestamp: Date.now() }, ...prev.generatedHistory]
    }));
  };

  const deductCredit = () => {
    setState(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
  };

  // Sticky header logic
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-lumina-500/30">
      
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-900/95 backdrop-blur-md border-slate-700 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setMode(AppMode.DASHBOARD); setState(s => ({...s, originalImage: null})); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lumina-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-lumina-500/20">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Vamsi<span className="text-lumina-400">Design</span>.AI</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Credits</span>
                <span className="text-lumina-400 font-bold">{state.credits}</span>
             </div>
             <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors">
                <span className="sr-only">User Profile</span>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-12 max-w-7xl mx-auto px-6">
        
        {/* Landing/Dashboard Mode */}
        {!state.originalImage && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lumina-500/10 border border-lumina-500/20 text-lumina-300 text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lumina-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lumina-500"></span>
                </span>
                Production-Ready AI Interior Architect
             </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-tight">
              Transform any room with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lumina-400 to-indigo-400">Professional AI Design</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              Upload a photo. Choose your style. Get photorealistic renovations, detailed analysis, and cinematic tours in seconds.
            </p>
            
            <div className="w-full max-w-xl shadow-2xl shadow-indigo-500/10 rounded-2xl">
              <ImageUploader onImageSelected={handleImageUpload} />
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-5xl mt-16">
               <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-lumina-500/30 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Interior Architect</h3>
                  <p className="text-slate-400 leading-relaxed">Select from 10+ premium styles including Bohemian, Industrial, and Luxury. Customize furniture and lighting instantly.</p>
               </div>
               <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-lumina-500/30 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-lumina-500/10 flex items-center justify-center mb-6 text-lumina-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Veo Cinematic Tours</h3>
                  <p className="text-slate-400 leading-relaxed">Generate 1080p virtual video tours of your redesigned space using Google's Veo model.</p>
               </div>
               <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-lumina-500/30 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Professional Analysis</h3>
                  <p className="text-slate-400 leading-relaxed">Get detailed breakdowns of style, color palette, furniture detection, and improvement suggestions.</p>
               </div>
            </div>
          </div>
        )}

        {/* Workspace Mode */}
        {state.originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* Left Column: Canvas & Controls */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Main Canvas Area */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-2xl aspect-video group ring-1 ring-white/10">
                 
                 {/* Content Display Logic */}
                 {state.generatedHistory.length > 0 ? (
                    state.generatedHistory[0].type === 'video' ? (
                       <video 
                         src={state.generatedHistory[0].url} 
                         controls 
                         autoPlay 
                         loop 
                         className="w-full h-full object-contain" 
                       />
                    ) : (
                       // Use Before/After Slider for images
                       <BeforeAfterSlider 
                         originalUrl={state.originalImage} 
                         generatedUrl={state.generatedHistory[0].url} 
                       />
                    )
                 ) : (
                    <img 
                      src={state.originalImage} 
                      alt="Original" 
                      className="w-full h-full object-contain" 
                    />
                 )}

                 {/* Download Button (Only if result exists) */}
                 {state.generatedHistory.length > 0 && (
                   <div className="absolute top-4 right-4 z-10">
                      <a 
                        href={state.generatedHistory[0].url} 
                        download={`vamsi-design-${Date.now()}.${state.generatedHistory[0].type === 'video' ? 'mp4' : 'jpg'}`}
                        className="bg-black/60 hover:bg-lumina-600 text-white p-2 rounded-lg backdrop-blur-md border border-white/10 transition-colors flex items-center gap-2"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </a>
                   </div>
                 )}
              </div>

              {/* Tools Tab Switcher */}
              <div className="flex border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('design')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'design' ? 'text-lumina-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Interior Architect
                  {activeTab === 'design' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lumina-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'video' ? 'text-lumina-400' : 'text-slate-400 hover:text-white'}`}
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Cinematic Video
                  {activeTab === 'video' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lumina-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>}
                </button>
              </div>

              {/* Tool Component Render */}
              <div className="min-h-[200px] animate-fade-in">
                {activeTab === 'design' ? (
                  <InteriorDesigner 
                    originalImage={state.originalImage} 
                    onResult={handleDesignResult} 
                    deductCredit={deductCredit}
                  />
                ) : (
                  <RoomAnimator originalImage={state.originalImage} onResult={handleVideoResult} />
                )}
              </div>

            </div>

            {/* Right Column: Analysis & History */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Analysis Card */}
               {state.isAnalyzing ? (
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-slate-700 rounded"></div>
                        <div className="h-16 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-32 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                 </div>
               ) : (
                 <AnalysisChart analysis={state.analysisData} />
               )}

               {/* History Grid */}
               {state.generatedHistory.length > 0 && (
                 <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                        Project History
                        <span className="text-xs text-slate-500 font-normal">{state.generatedHistory.length} versions</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div 
                         onClick={() => {
                             // Logic to clear preview or show original is handled by slider, 
                             // but we can have an 'Original' thumbnail here for consistency
                         }}
                         className="aspect-square rounded-lg overflow-hidden border border-slate-600 opacity-60 hover:opacity-100 cursor-pointer relative"
                       >
                          <img src={state.originalImage} className="w-full h-full object-cover" alt="Original" />
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-[10px] text-white text-center">Original</div>
                       </div>
                       {state.generatedHistory.map((item, idx) => (
                         <div 
                           key={item.timestamp} 
                           className="aspect-square rounded-lg overflow-hidden border border-slate-600 relative group cursor-pointer hover:border-lumina-500 transition-colors"
                           onClick={() => {
                              // Re-order history to show clicked item first
                              const newHistory = [...state.generatedHistory];
                              const clicked = newHistory.splice(idx, 1)[0];
                              newHistory.unshift(clicked);
                              setState(s => ({...s, generatedHistory: newHistory}));
                           }}
                         >
                            {item.type === 'video' ? (
                               <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                               </div>
                            ) : (
                               <img src={item.url} className="w-full h-full object-cover" alt="Version" />
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
               )}

            </div>

          </div>
        )}

      </main>

    </div>
  );
};

export default App;