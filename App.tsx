import React, { useState } from 'react';
import { ViewState, CarDetails, AnalysisResult } from './types';
import { diagnoseCarIssue } from './services/geminiService';
import DiagnosisForm from './components/DiagnosisForm';
import ResultsView from './components/ResultsView';
import { Wrench, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [carName, setCarName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDiagnosisSubmit = async (details: CarDetails, image: string | null) => {
    setIsLoading(true);
    setCarName(`${details.year} ${details.make} ${details.model}`);
    
    // We can show loading state here if desired or just pass loading prop to form
    // Let's transition to a loading text if it takes long, but standard boolean is fine for Form
    
    try {
      // In a real app, maybe we validate image size here.
      const result = await diagnoseCarIssue(details, image || undefined);
      setAnalysis(result);
      setView(ViewState.RESULTS);
    } catch (error) {
      alert("Something went wrong with the AI analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setCarName("");
    setView(ViewState.HOME);
  };

  // Render content based on view state
  const renderContent = () => {
    switch (view) {
      case ViewState.HOME:
        return (
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                AI-Powered Mechanic
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Vehicle trouble? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Fix it faster.
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Upload a photo or describe the sound. Our advanced AI diagnoses issues instantly, estimates costs, and helps you fix it or find a pro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setView(ViewState.DIAGNOSE)}
                  className="px-12 py-6 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
                >
                  <Wrench className="w-6 h-6" />
                  Start Diagnosis
                </button>
              </div>

              <div className="flex gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900">24/7</div>
                  <div className="text-slate-500 text-sm">Availability</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">Instant</div>
                  <div className="text-slate-500 text-sm">Analysis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">100%</div>
                  <div className="text-slate-500 text-sm">Free to Try</div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[500px] hidden md:block">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
              
              <div className="relative w-full h-full">
                {/* Main Car Image */}
                <div className="absolute top-0 right-0 w-5/6 h-4/6 transform rotate-3 hover:rotate-0 transition-all duration-700 ease-out z-10 hover:z-30">
                  <img 
                    src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80" 
                    alt="Sports Car"
                    className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                     <div className="p-2 bg-green-100 rounded-lg">
                       <CheckCircle className="w-6 h-6 text-green-600" />
                     </div>
                     <div>
                       <div className="font-bold text-slate-900 text-sm">Vehicle Health</div>
                       <div className="text-xs text-green-600 font-bold">100% Optimized</div>
                     </div>
                  </div>
                </div>

                {/* Bike Image */}
                <div className="absolute bottom-10 left-0 w-4/6 h-3/6 transform -rotate-3 hover:rotate-0 transition-all duration-700 ease-out z-20 hover:z-30">
                   <img 
                    src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80" 
                    alt="Sports Bike"
                    className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case ViewState.DIAGNOSE:
        return (
          <div className="max-w-3xl mx-auto px-6 py-12">
            <button 
              onClick={() => setView(ViewState.HOME)}
              className="text-slate-500 mb-6 hover:text-slate-800 flex items-center gap-2"
            >
              &larr; Back to Home
            </button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Describe the Issue</h2>
              <p className="text-slate-600 mt-2">The more details you provide, the more accurate the AI diagnosis.</p>
            </div>
            <DiagnosisForm onSubmit={handleDiagnosisSubmit} isLoading={isLoading} />
          </div>
        );

      case ViewState.RESULTS:
        return (
           <div className="px-6 py-12 bg-slate-50 min-h-screen">
             {analysis && <ResultsView result={analysis} onReset={handleReset} carName={carName} />}
           </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Wrench className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SmartFit <span className="text-orange-600">Garage</span></span>
          </div>
        </div>
      </nav>

      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      {view === ViewState.HOME && (
        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                 <Wrench className="w-5 h-5" />
                 <span className="font-bold text-lg">SmartFit Garage</span>
              </div>
              <p className="text-sm">Empowering drivers with instant, reliable automotive knowledge.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Diagnosis</a></li>
                <li><a href="#" className="hover:text-white">Mechanic Finder</a></li>
                <li><a href="#" className="hover:text-white">Cost Estimator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li className="flex items-center gap-2 mt-4">
                    <ShieldCheck className="w-4 h-4" /> Secure & Private
                </li>
              </ul>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}