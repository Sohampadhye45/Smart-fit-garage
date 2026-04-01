import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ChatMessage } from '../types';
import { findNearbyMechanics, streamChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Actually we don't have this library in list, so we'll do simple rendering or just text.
// Wait, prompt says "Use popular and existing libraries". I will avoid extra deps if possible to keep it simple, or use simple pre/whitespace.
// Let's use simple whitespace rendering for chat.

import { 
  Wrench, 
  MapPin, 
  IndianRupee, 
  AlertOctagon, 
  CheckCircle, 
  MessageSquare,
  ArrowRight,
  Send,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  carName: string; // "2018 Toyota Camry"
}

const ResultsView: React.FC<Props> = ({ result, onReset, carName }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'mechanic' | 'chat'>('details');
  const [mechanics, setMechanics] = useState<{text: string, chunks: any[] | undefined} | null>(null);
  const [findingMechanics, setFindingMechanics] = useState(false);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Severity color mapping
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const handleFindMechanics = async () => {
    setActiveTab('mechanic');
    if (mechanics) return; // already loaded

    setFindingMechanics(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setFindingMechanics(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const data = await findNearbyMechanics(
          position.coords.latitude, 
          position.coords.longitude, 
          result.title,
          carName
        );
        setMechanics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setFindingMechanics(false);
      }
    }, () => {
      alert("Unable to retrieve your location");
      setFindingMechanics(false);
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isChatting) return;

    const newMsg: ChatMessage = { role: 'user', text: inputMsg, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newMsg]);
    setInputMsg('');
    setIsChatting(true);

    try {
      // Build context from analysis result if it's the first message
      let historyToSend = [...chatHistory];
      if (chatHistory.length === 0) {
        // Seed with context
        historyToSend = [
          { role: 'user', text: `I have a ${carName}. Issue: ${result.title}. Diagnosis: ${result.summary}.`, timestamp: Date.now() },
          { role: 'model', text: "Understood. I am ready to help you further with this issue.", timestamp: Date.now() }
        ];
      }

      const stream = streamChatResponse(historyToSend, newMsg.text);
      let fullResponse = "";
      
      // Add placeholder for model response
      setChatHistory(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullResponse;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{result.title}</h2>
            <p className="text-slate-400">{carName}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-wide ${getSeverityColor(result.severity)}`}>
            {result.severity} Severity
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'details' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Analysis Details
          </button>
          <button 
            onClick={handleFindMechanics}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'mechanic' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Find Mechanic
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'chat' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Ask AI Mechanic
          </button>
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          
          {/* TAB: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Summary</h3>
                <p className="text-slate-600 leading-relaxed">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-orange-500" />
                    Possible Causes
                  </h4>
                  <ul className="space-y-2">
                    {result.possibleCauses.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    Estimated Cost
                  </h4>
                  <p className="text-2xl font-bold text-slate-700">{result.estimatedCost}</p>
                  <p className="text-xs text-slate-500 mt-1">Estimates include parts & labor. Varies by location.</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  Recommended Action: {result.recommendation}
                </h4>
                <div className="space-y-3">
                  {result.diySteps.map((step, i) => (
                     <div key={i} className="flex gap-4">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                         {i + 1}
                       </div>
                       <p className="text-slate-600 pt-1">{step}</p>
                     </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MECHANIC */}
          {activeTab === 'mechanic' && (
            <div className="space-y-6 animate-fadeIn">
              {findingMechanics ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                  <p>Searching for specialists nearby...</p>
                </div>
              ) : mechanics ? (
                <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                     <MapPin className="w-5 h-5 text-red-500" />
                     Top Recommendations Near You
                   </h3>
                   <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-200">
                     {/* Rendering text with line breaks */}
                     {mechanics.text.split('\n').map((line, i) => (
                       <p key={i} className="mb-2">{line}</p>
                     ))}
                   </div>
                   {/* Maps Grounding Links */}
                   {mechanics.chunks && mechanics.chunks.length > 0 && (
                     <div className="mt-6 space-y-3">
                       <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Source Links</h4>
                        {mechanics.chunks.map((chunk, idx) => {
                          const mapData = chunk.maps || chunk.web;
                          if (!mapData?.uri) return null;
                          return (
                            <a 
                              key={idx}
                              href={mapData.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition flex items-center justify-between group"
                            >
                              <div>
                                <div className="font-medium text-slate-800 group-hover:text-blue-600">{mapData.title || 'View on Google Maps'}</div>
                                <div className="text-xs text-slate-500 truncate max-w-md">{mapData.uri}</div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </a>
                          );
                        })}
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>Click "Find Mechanic" to locate help.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[500px] animate-fadeIn">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatHistory.length === 0 && (
                   <div className="text-center text-slate-400 py-10">
                     <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p>Ask follow-up questions about the repair, costs, or parts.</p>
                   </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'}
                    `}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-200 pt-4">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!inputMsg.trim() || isChatting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3 rounded-xl transition"
                >
                  {isChatting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Start New Diagnosis
        </button>
      </div>
    </div>
  );
};

export default ResultsView;