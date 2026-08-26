import React, { useState } from 'react';
import { askAiAssistant } from '@/services/aiService';
import { X, Bot, Send, Loader2 } from 'lucide-react';
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Build a minimal context so we don't send massive payloads
      const contextData = {
        role: user?.role,
        recentListings: listings.slice(0, 10).map(l => ({ name: l.name, price: l.price, location: l.location }))
      };
      
      const res = await askAiAssistant(userMessage, contextData);
      setMessages(prev => [...prev, { role: 'assistant', text: res.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process that request at the moment. Please ensure AI API keys are configured correctly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold">HarvestHub AI Assistant</h3>
              <p className="text-xs text-white/80">Powered by Google Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
              <Bot size={40} className="mx-auto mb-2 opacity-50" />
              <p>Hello, {user?.name || 'User'}! Ask me anything about the marketplace, crop trends, or pricing recommendations.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user' 
                  ? 'bg-[#1B5E20] text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#1B5E20]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#1B5E20]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#1B5E20]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
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
              placeholder="Ask about crop prices, market trends..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] rounded-full outline-none transition-all dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 p-2 bg-[#1B5E20] text-white rounded-full hover:bg-[#2E7D32] disabled:opacity-50 disabled:hover:bg-[#1B5E20] transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
