import React, { useState, useRef, useEffect } from 'react';
import { getLegalAdvice } from '../services/geminiService';
import { Button3D } from './UIComponents';

export const LegalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    const aiResponse = await getLegalAdvice(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="
          mb-4 w-80 md:w-96 h-96 
          glass-panel 
          rounded-xl 
          flex flex-col 
          overflow-hidden 
          animate-[fadeIn_0.3s_ease-out]
          border border-legal-gold/30
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-legal-900 to-legal-800 p-3 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-legal-gold animate-pulse"></div>
              <h3 className="text-legal-gold font-serif text-sm">LexAI - Asistente</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0f1c]/50">
            {messages.length === 0 && (
              <p className="text-xs text-slate-500 text-center mt-10 italic">
                Bienvenido. Pregúntame sobre leyes, definiciones o redacción de documentos.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-lg p-2.5 text-sm shadow-md
                  ${m.role === 'user' 
                    ? 'bg-legal-700 text-white rounded-br-none' 
                    : 'bg-legal-900 border border-legal-gold/20 text-slate-200 rounded-bl-none'}
                `}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-legal-900 border border-legal-gold/20 px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-legal-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-legal-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-legal-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-legal-900 border-t border-white/5">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-black/30 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-legal-gold outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-legal-gold text-legal-900 px-3 py-1.5 rounded text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="
          group
          w-14 h-14 
          rounded-full 
          bg-gradient-to-br from-legal-gold to-yellow-600 
          shadow-[0_0_20px_rgba(202,164,59,0.4)]
          flex items-center justify-center
          transition-all
          hover:scale-110
          active:scale-95
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-legal-900">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </button>
    </div>
  );
};