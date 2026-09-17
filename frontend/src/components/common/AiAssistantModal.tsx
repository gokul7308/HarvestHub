import React, { useState } from 'react';
import { askAiAssistant } from '@/services/aiService';
import { X, Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useListings } from '@/contexts/ListingContext';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { listings } = useListings();

  if (!isOpen) return null;

  const getSuggestions = () => {
    const role = user?.role || 'farmer';
    if (role === 'farmer') {
      return [
        "What crops have high demand?",
        "Should I sell my crops now?",
        "What is the current market trend?"
      ];
    } else if (role === 'merchant') {
      return [
        "Which crops should I buy this week?",
        "Which crop has the highest demand?",
        "Compare tomato and wheat demand.",
        "Which listings look attractive?"
      ];
    } else {
      return [
        "Give me a summary of today's marketplace activity.",
        "What crops are currently receiving the highest demand?",
        "Are there any unusual marketplace patterns?",
        "Summarize platform activity."
      ];
    }
  };

  const handleSendQuery = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const contextData = {
        role: user?.role,
        userName: user?.name,
        recentListings: listings.slice(0, 10).map(l => ({ name: l.name, price: l.price, location: l.location, quantity: l.quantity }))
      };
      
      const res = await askAiAssistant(textToSend, contextData);
      setMessages(prev => [...prev, { role: 'assistant', text: res.response || "No response received." }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "AI service is temporarily unavailable. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(query.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                HarvestHub AI Assistant
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider">
                  {user?.role || 'Guest'} Mode
                </span>
              </h3>
              <p className="text-xs text-white/80 font-medium">Powered by Google Gemini 1.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 my-auto py-8">
              <div className="w-16 h-16 bg-[#1B5E20]/10 text-[#1B5E20] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Hello, {user?.name || 'User'}!</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Ask me anything about market trends, pricing predictions, or procurement insights.</p>
              
              {/* Question Pills */}
              <div className="mt-6 flex flex-col gap-2 max-w-xs mx-auto">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Suggested Questions</p>
                {getSuggestions().map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuery(sug)}
                    className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#1B5E20] hover:text-[#1B5E20] text-slate-700 dark:text-slate-300 p-3 rounded-2xl font-medium transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span>{sug}</span>
                    <Sparkles size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1B5E20]" />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm font-medium ${
                msg.role === 'user' 
                  ? 'bg-[#1B5E20] text-white rounded-tr-none shadow-md' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl rounded-tl-none px-5 py-4 flex items-center gap-3 shadow-sm">
                <Loader2 size={16} className="animate-spin text-[#1B5E20]" />
                <span className="text-xs font-bold text-slate-500">Analyzing market data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask as ${user?.role || 'user'}...`}
              className="w-full pl-5 pr-14 py-3.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 rounded-2xl outline-none transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 p-2.5 bg-[#1B5E20] text-white rounded-xl hover:bg-[#2E7D32] disabled:opacity-40 disabled:hover:bg-[#1B5E20] transition-all shadow-md"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
