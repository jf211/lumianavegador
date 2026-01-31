
import React, { useState, useEffect, useRef } from 'react';
import { TileSize, LiveTileData, SearchEngine } from './types';
import { INITIAL_TILES, METRO_COLORS } from './constants';
import { fetchLiveNews, fetchFullNewsFeed, fetchSiteSummary, performWebSearch, NewsArticle } from './services/geminiService';
import Tile from './components/Tile';
import NavBar from './components/NavBar';

const App: React.FC = () => {
  const [tiles, setTiles] = useState<LiveTileData[]>(() => {
    const saved = localStorage.getItem('lumia_tiles_v3');
    return saved ? JSON.parse(saved) : INITIAL_TILES;
  });
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'home' | 'browser' | 'news' | 'search'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveNews, setLiveNews] = useState<string[]>(["Lumia: Experience the future", "Personalize your start screen", "Safe, fast, and secure"]);
  const [fullNews, setFullNews] = useState<NewsArticle[]>([]);
  const [searchResults, setSearchResults] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [bgImage, setBgImage] = useState<string>('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80');
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('lumia_profile_img'));
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>('en-US');
  const [preferredEngine, setPreferredEngine] = useState<SearchEngine>(() => (localStorage.getItem('lumia_engine') as SearchEngine) || 'lumia');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background & News Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const loadContent = async () => {
      const news = await fetchLiveNews();
      if (news.length > 0) setLiveNews(news);
      
      const full = await fetchFullNewsFeed();
      setFullNews(full);

      try {
        const response = await fetch('https://picsum.photos/1080/1920');
        setBgImage(response.url);
      } catch (e) {
        console.log("Using default background");
      }
    };
    
    loadContent();
    const browserLang = navigator.language;
    if (browserLang.includes('pt')) setLanguage('pt-BR');

    return () => clearInterval(timer);
  }, []);

  // Persist Config
  useEffect(() => {
    localStorage.setItem('lumia_tiles_v3', JSON.stringify(tiles));
  }, [tiles]);

  useEffect(() => {
    localStorage.setItem('lumia_engine', preferredEngine);
  }, [preferredEngine]);

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem('lumia_profile_img', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTileClick = (url: string, id: string) => {
    if (id === 'news') {
      setViewState('news');
      return;
    }
    if (url) {
      setActiveUrl(url);
      setCurrentUrl(url);
      setViewState('browser');
    }
  };

  const handleLongPress = (id: string) => {
    setSelectedTileId(id);
  };

  const resizeTile = (id: string, newSize: TileSize) => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, size: newSize } : t));
    setSelectedTileId(null);
  };

  const removeTile = (id: string) => {
    setTiles(prev => prev.filter(t => t.id !== id));
    setSelectedTileId(null);
  };

  const addToFavorites = async () => {
    if (!activeUrl) return;
    try {
      const urlObj = new URL(activeUrl);
      const summary = await fetchSiteSummary(activeUrl);
      const newTile: LiveTileData = {
        id: Date.now().toString(),
        title: urlObj.hostname.replace('www.', ''),
        url: activeUrl,
        color: METRO_COLORS[Math.floor(Math.random() * METRO_COLORS.length)],
        size: TileSize.MEDIUM,
        content: summary,
        icon: urlObj.hostname.charAt(0).toUpperCase()
      };
      setTiles(prev => [...prev, newTile]);
      setIsMenuOpen(false);
    } catch (e) {
      alert(language === 'pt-BR' ? 'URL Inválida' : 'Invalid URL');
    }
  };

  const clearBrowserData = () => {
    if (confirm(language === 'pt-BR' ? 'Apagar histórico e cache?' : 'Clear all browser data?')) {
      setActiveUrl(null);
      setCurrentUrl('');
      setViewState('home');
      setIsMenuOpen(false);
    }
  };

  const navigateToUrl = async () => {
    let url = currentUrl.trim();
    if (!url) return;

    const isUrl = url.includes('.') || url.startsWith('http');
    
    if (!isUrl) {
      // It's a search query
      if (preferredEngine === 'lumia') {
        setViewState('search');
        setIsSearching(true);
        setSearchResults(null);
        const results = await performWebSearch(url);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        openExternalSearch(preferredEngine);
      }
    } else {
      if (!url.startsWith('http')) url = 'https://' + url;
      setActiveUrl(url);
      setCurrentUrl(url);
      setViewState('browser');
    }
  };

  const openExternalSearch = (engine: string) => {
    const query = encodeURIComponent(currentUrl);
    let url = '';
    switch(engine) {
      case 'google': url = `https://www.google.com/search?q=${query}`; break;
      case 'bing': url = `https://www.bing.com/search?q=${query}`; break;
      case 'duckduckgo': url = `https://duckduckgo.com/?q=${query}`; break;
      case 'lumia': navigateToUrl(); return;
    }
    setActiveUrl(url);
    setViewState('browser');
  };

  const goHome = () => {
    setViewState('home');
    setActiveUrl(null);
    setCurrentUrl('');
  };

  const texts = {
    'en-US': {
      settings: 'Settings', pin: 'Pin to Start', clear: 'Clear Data', lang: 'Switch to Portuguese',
      remove: 'Remove from Start', cancel: 'Cancel', customize: 'Customize Tile', hint: 'Long press to edit tiles',
      newsHub: 'News Hub', trending: 'Trending Now', search: 'Search', searching: 'Searching web...',
      webResults: 'Web Results', external: 'Meta-Search Engines', prefEngine: 'Default Engine'
    },
    'pt-BR': {
      settings: 'Configurações', pin: 'Fixar no Início', clear: 'Limpar Dados', lang: 'Mudar para Inglês',
      remove: 'Remover do Início', cancel: 'Cancelar', customize: 'Personalizar Bloco', hint: 'Pressione e segure para editar',
      newsHub: 'Notícias', trending: 'Tendências do Momento', search: 'Busca', searching: 'Pesquisando na web...',
      webResults: 'Resultados da Web', external: 'Motores de Meta-Busca', prefEngine: 'Buscador Padrão'
    }
  }[language];

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden flex flex-col">
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* Top Header */}
      {viewState === 'home' && (
        <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-2xl font-light tracking-[0.2em] uppercase opacity-90 drop-shadow-md">Lumia</span>
            <div className="w-[1px] h-4 bg-white/30 ml-2"></div>
            <span className="text-[10px] font-bold tracking-widest opacity-50 uppercase mt-1">{language === 'pt-BR' ? 'Navegador' : 'Browser'}</span>
          </div>
          
          <div className="pointer-events-auto relative group">
            <button onClick={handleProfileClick} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center transition-all active:scale-90">
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <svg className="w-6 h-6 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          </div>
        </div>
      )}

      {/* Home View */}
      {viewState === 'home' && (
        <div className="flex-1 pt-20 px-6 overflow-y-auto no-scrollbar pb-52 animate-slide-up relative z-10">
          <div className="mb-14 cursor-default select-none">
            <h1 className="text-8xl font-thin tracking-tighter leading-none opacity-100 drop-shadow-2xl">{currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2, '0')}</h1>
            <div className="mt-2 pl-1">
              <p className="text-xl font-light tracking-[0.1em] uppercase opacity-70">{currentTime.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
            {tiles.map((tile) => (
              <Tile key={tile.id} tile={tile} onClick={(url) => handleTileClick(url, tile.id)} onLongPress={handleLongPress} liveContent={tile.id === 'news' ? liveNews : undefined} />
            ))}
          </div>
          <div className="mt-14 mb-20 text-center opacity-40 text-[10px] tracking-[0.3em] uppercase">{texts.hint}</div>
        </div>
      )}

      {/* Search Hub View - The Unified Hub */}
      {viewState === 'search' && (
        <div className="flex-1 pt-12 px-8 overflow-y-auto no-scrollbar pb-40 animate-slide-up relative z-10 bg-black/90 backdrop-blur-xl">
           <div className="flex justify-between items-end mb-6">
             <h2 className="text-6xl font-thin text-[#0078d7]">{texts.search}</h2>
             <div className="flex gap-1 mb-2">
                {['lumia', 'google', 'bing', 'duckduckgo'].map(eng => (
                  <button 
                    key={eng}
                    onClick={() => openExternalSearch(eng)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${preferredEngine === eng ? 'bg-[#0078d7] text-white' : 'bg-white/10 opacity-40 hover:opacity-100'}`}
                  >
                    {eng.charAt(0)}
                  </button>
                ))}
             </div>
           </div>
           
           <p className="text-xl font-light opacity-50 mb-10 uppercase tracking-widest truncate">{currentUrl}</p>
           
           {isSearching ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-[#0078d7] rounded-full animate-spin"></div>
                <p className="text-xl font-light animate-pulse">{texts.searching}</p>
             </div>
           ) : (
             <div className="space-y-8">
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 animate-slide-up">
                 <p className="text-lg font-light leading-relaxed">{searchResults?.text}</p>
               </div>
               
               <div className="space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">{texts.webResults}</h3>
                 <div className="grid grid-cols-1 gap-2">
                   {searchResults?.links.map((link, i) => (
                     <div 
                      key={i} 
                      onClick={() => { setActiveUrl(link.uri); setViewState('browser'); }} 
                      className="group border-l-4 border-white/20 pl-4 py-3 active:bg-[#0078d7]/20 transition-all cursor-pointer rounded-r-xl"
                      style={{ animationDelay: `${i * 0.1}s` }}
                     >
                        <h4 className="text-xl font-light group-hover:text-[#0078d7] transition-colors line-clamp-1">{link.title}</h4>
                        <p className="text-[10px] opacity-40 truncate">{link.uri}</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-8 space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">{texts.external}</h3>
                 <div className="flex gap-2">
                    <button onClick={() => openExternalSearch('google')} className="flex-1 py-4 bg-white/10 rounded-xl hover:bg-[#0078d7] transition-all font-light active:scale-95">Google</button>
                    <button onClick={() => openExternalSearch('bing')} className="flex-1 py-4 bg-white/10 rounded-xl hover:bg-[#0078d7] transition-all font-light active:scale-95">Bing</button>
                    <button onClick={() => openExternalSearch('duckduckgo')} className="flex-1 py-4 bg-white/10 rounded-xl hover:bg-[#0078d7] transition-all font-light active:scale-95">DuckDuckGo</button>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}

      {/* News View */}
      {viewState === 'news' && (
        <div className="flex-1 pt-12 px-8 overflow-y-auto no-scrollbar pb-40 animate-slide-up relative z-10 bg-black/90 backdrop-blur-xl">
           <h2 className="text-6xl font-thin mb-2 text-[#0078d7]">{texts.newsHub}</h2>
           <p className="text-xl font-light opacity-50 mb-10 uppercase tracking-widest">{texts.trending}</p>
           <div className="space-y-6">
             {fullNews.map((article, i) => (
               <div key={i} className="group border-l-4 border-[#0078d7] pl-4 py-2 hover:bg-white/5 transition-all rounded-r-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0078d7]">{article.category}</span>
                  <h3 className="text-2xl font-light mt-1 group-hover:text-[#0078d7]">{article.title}</h3>
                  <p className="text-sm font-light opacity-70 mt-2 line-clamp-2">{article.snippet}</p>
                  <div className="mt-2 text-[10px] opacity-40 uppercase font-bold">{article.source}</div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Browser View */}
      {viewState === 'browser' && (
        <div className="flex-1 w-full bg-white z-20 animate-slide-up relative">
          <iframe ref={iframeRef} src={activeUrl!} className="w-full h-full border-none" title="Lumia View" />
        </div>
      )}

      {/* Navigation Bar */}
      <NavBar 
        onBack={() => { if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.history.back(); }}
        onForward={() => { if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.history.forward(); }}
        onRefresh={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}
        onHome={goHome}
        onTabs={() => {}}
        onMenu={() => setIsMenuOpen(true)}
        currentUrl={currentUrl}
        setUrl={setCurrentUrl}
        onGo={navigateToUrl}
        isBrowserOpen={viewState === 'browser'}
        language={language}
      />

      {/* Dialogs... */}
      {selectedTileId && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col justify-end animate-slide-up">
          <div className="p-8 space-y-4 max-w-md mx-auto w-full mb-12">
            <h3 className="text-5xl font-light mb-8 text-[#0078d7]">{texts.customize}</h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => resizeTile(selectedTileId, TileSize.SMALL)} className="w-full py-5 text-left text-2xl font-light px-6 hover:bg-white/10 active:bg-[#0078d7] rounded-xl">Small</button>
              <button onClick={() => resizeTile(selectedTileId, TileSize.MEDIUM)} className="w-full py-5 text-left text-2xl font-light px-6 hover:bg-white/10 active:bg-[#0078d7] rounded-xl">Medium</button>
              <button onClick={() => resizeTile(selectedTileId, TileSize.WIDE)} className="w-full py-5 text-left text-2xl font-light px-6 hover:bg-white/10 active:bg-[#0078d7] rounded-xl">Wide</button>
              <div className="h-[1px] bg-white/10 my-4"></div>
              <button onClick={() => removeTile(selectedTileId)} className="w-full py-5 text-red-500 text-left text-2xl font-light px-6 hover:bg-red-600 hover:text-white rounded-xl">{texts.remove}</button>
            </div>
            <button onClick={() => setSelectedTileId(null)} className="w-full py-8 text-center opacity-40 uppercase tracking-[0.4em] text-xs font-bold">{texts.cancel}</button>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col justify-end animate-slide-up">
          <div className="p-8 space-y-4 max-w-md mx-auto w-full mb-12 overflow-y-auto no-scrollbar max-h-[90vh]">
            <h2 className="text-6xl font-light mb-12 text-[#0078d7]">{texts.settings}</h2>
            
            <button onClick={addToFavorites} disabled={!activeUrl} className="w-full text-left py-6 text-3xl font-light border-b border-white/10 flex justify-between items-center disabled:opacity-20 group">
              <span className="group-hover:text-[#0078d7]">{texts.pin}</span>
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
            
            <div className="py-6 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 block">{texts.prefEngine}</span>
              <div className="flex flex-wrap gap-2">
                {['lumia', 'google', 'bing', 'duckduckgo'].map(eng => (
                  <button 
                    key={eng}
                    onClick={() => setPreferredEngine(eng as SearchEngine)}
                    className={`px-4 py-2 rounded-full border text-sm font-light transition-all ${preferredEngine === eng ? 'bg-[#0078d7] border-[#0078d7]' : 'bg-transparent border-white/20 opacity-50'}`}
                  >
                    {eng.charAt(0).toUpperCase() + eng.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setLanguage(prev => prev === 'en-US' ? 'pt-BR' : 'en-US')} className="w-full text-left py-6 text-3xl font-light border-b border-white/10 flex justify-between items-center group">
              <span className="group-hover:text-[#0078d7]">{texts.lang}</span>
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.19 15.683 3 20" /></svg>
            </button>

            <button onClick={clearBrowserData} className="w-full text-left py-6 text-3xl font-light border-b border-white/10 flex justify-between items-center group">
              <span className="group-hover:text-[#0078d7]">{texts.clear}</span>
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="w-full py-8 text-center text-sm font-bold opacity-30 uppercase tracking-[0.5em]">Close</button>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default App;
