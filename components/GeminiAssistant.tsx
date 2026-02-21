
import React, { useState, useEffect, useRef } from 'react';
import { getMovieAdvice } from '../services/geminiService';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMsg = message;
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await getMovieAdvice(userMsg);
    setHistory(prev => [...prev, { role: 'ai', text: aiResponse || 'No response' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-800/50 p-4 border-b border-zinc-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-sm tracking-tight">CineNYC AI Concierge</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-700 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && (
              <div className="text-zinc-500 text-center mt-10">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Ask me for recommendations or about NYC theaters!</p>
              </div>
            )}
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 flex gap-2">
            <input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 active:scale-95"
        >
          <div className="absolute -top-12 right-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need advice?
          </div>
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
