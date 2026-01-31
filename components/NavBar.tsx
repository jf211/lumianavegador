
import React, { useState } from 'react';

interface NavBarProps {
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onTabs: () => void;
  onMenu: () => void;
  currentUrl: string;
  setUrl: (url: string) => void;
  onGo: () => void;
  isBrowserOpen: boolean;
  language: 'pt-BR' | 'en-US';
}

const NavBar: React.FC<NavBarProps> = ({ 
  onBack, onForward, onRefresh, onHome, onTabs, onMenu, 
  currentUrl, setUrl, onGo, isBrowserOpen, language
}) => {
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'pt-BR' ? "Busca por voz não suportada neste navegador." : "Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUrl(transcript);
      setTimeout(() => onGo(), 500);
    };
    recognition.start();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 text-white z-50 flex flex-col pt-3 pb-8 px-4 border-t border-white/10 backdrop-blur-lg">
      
      {/* Search Input Area */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <input 
            type="text"
            value={currentUrl}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGo()}
            placeholder={language === 'pt-BR' ? 'Pesquisar ou digitar endereço' : 'Search or type URL'}
            className="w-full bg-white text-black px-6 py-3 pr-12 outline-none text-base rounded-full shadow-lg border-none focus:ring-4 ring-[#0078d7]/40 transition-all font-light"
          />
          <button 
            onClick={startVoiceSearch}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-all ${isListening ? 'text-red-500 scale-125 animate-pulse' : 'text-black/40 hover:text-black'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="flex justify-between items-center px-4">
        <button onClick={onBack} className="p-2 opacity-70 hover:opacity-100 active:scale-75 transition-all">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={onHome} 
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full active:scale-90 transition-all"
        >
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h11.233v11.233h-11.233zM12.767 0h11.233v11.233h-11.233zM0 12.767h11.233v11.233h-11.233zM12.767 12.767h11.233v11.233h-11.233z" />
          </svg>
        </button>

        <button onClick={onForward} className="p-2 opacity-70 hover:opacity-100 active:scale-75 transition-all">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button onClick={onTabs} className="p-2 opacity-70 hover:opacity-100 active:scale-75 transition-all">
          <div className="w-7 h-7 border-2 border-white/80 rounded-sm flex items-center justify-center text-[11px] font-bold">
            1
          </div>
        </button>

        <button onClick={onMenu} className="p-2 opacity-70 hover:opacity-100 active:scale-75 transition-all">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
