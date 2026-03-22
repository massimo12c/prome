import { useState, useEffect } from 'react';
import { Search, Book, History, ArrowRight, Loader2, Sparkles, X, Globe, ExternalLink, Trash2, Youtube, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Summary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
}

function App() {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('wiki_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    localStorage.setItem('wiki_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const fetchSummary = async (searchTitle: string) => {
    if (!searchTitle.trim()) return;
    
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      // 1. Fetch Basic Info and Thumbnail
      const summaryRes = await fetch(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTitle)}`);
      if (!summaryRes.ok) throw new Error('Argomento non trovato.');
      const summaryData = await summaryRes.json();

      // 2. Fetch Deep Extract (Action API for more sentences)
      const deepRes = await fetch(`https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(summaryData.title)}&explaintext=1&exsentences=10&origin=*`);
      const deepData = await deepRes.json();
      const pages = deepData.query.pages;
      const pageId = Object.keys(pages)[0];
      const deepExtract = pages[pageId].extract;

      setSummary({
        ...summaryData,
        extract: deepExtract || summaryData.extract // Fallback to summary if deep fails
      });

      // Add to history
      if (summaryData.title) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          title: summaryData.title,
          timestamp: Date.now()
        };
        setHistory(prev => [newHistoryItem, ...prev.filter(h => h.title !== summaryData.title)].slice(0, 10));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary(query);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const clearAllHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#080808] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-serif">
      
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter font-sans uppercase">Smart Knowledge</h1>
            </div>
            {summary && (
              <button onClick={() => setSummary(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Chiedimi di qualsiasi cosa (es: Napoleone)..."
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-lg font-sans focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
            )}
          </form>

          {/* Quick Links */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-2">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(query || 'Napoleone')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <Globe className="w-3 h-3 text-blue-500" />
              Google
            </a>
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query || 'Napoleone')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500/30 transition-all shadow-sm"
            >
              <Youtube className="w-3 h-3 text-red-500" />
              YouTube
            </a>
            <a 
              href="https://chatgpt.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <MessageSquareText className="w-3 h-3 text-emerald-500" />
              ChatGPT
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-6 rounded-3xl text-center space-y-2"
            >
              <p className="text-rose-600 dark:text-rose-400 font-bold font-sans">Ops! Qualcosa è andato storto</p>
              <p className="text-sm opacity-70 italic">{error}</p>
            </motion.div>
          )}

          {summary ? (
            <motion.article 
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {summary.thumbnail && (
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10">
                  <img 
                    src={summary.thumbnail.source} 
                    alt={summary.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-500">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">Riassunto Automatico</span>
                </div>
                <h2 className="text-5xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
                  {summary.title}
                </h2>
                <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-xl md:text-2xl leading-relaxed text-slate-700 dark:text-slate-300 first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left">
                  {summary.extract}
                </p>
              </div>

              {summary.content_urls && (
                <a 
                  href={summary.content_urls.desktop.page} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors font-sans uppercase tracking-widest border-b-2 border-indigo-500/20 pb-1"
                >
                  Approfondisci su Wikipedia <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.article>
          ) : !loading && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {history.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <History className="w-4 h-4" />
                      <h3 className="text-xs font-black uppercase tracking-widest font-sans">Ricerche Recenti</h3>
                    </div>
                    <button 
                      onClick={clearAllHistory}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest font-sans transition-colors"
                    >
                      Cancella tutto
                    </button>
                  </div>
                  
                  <div className="grid gap-3">
                    <AnimatePresence initial={false}>
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          {/* Delete Background (Revealed on Swipe) */}
                          <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6 rounded-2xl">
                            <Trash2 className="text-white w-5 h-5" />
                          </div>

                          {/* Swipeable Item Content */}
                          <motion.div 
                            drag="x"
                            dragConstraints={{ left: -100, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={(_, info) => {
                              if (info.offset.x < -60) {
                                deleteHistoryItem(item.id);
                              }
                            }}
                            className="relative flex items-center justify-between p-5 bg-white dark:bg-[#121212] border border-slate-100 dark:border-slate-800 rounded-2xl transition-all"
                          >
                            <button
                              onClick={() => {
                                setQuery(item.title);
                                fetchSummary(item.title);
                              }}
                              className="group flex items-center gap-4 text-left flex-1"
                            >
                              <Book className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              <span className="font-bold font-sans">{item.title}</span>
                            </button>
                            
                            <div className="flex items-center gap-3">
                              <div className="md:hidden text-[8px] font-black uppercase tracking-tighter text-slate-300">
                                ← swipe
                              </div>
                              <button 
                                onClick={() => deleteHistoryItem(item.id)}
                                className="hidden md:block p-2 text-slate-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              <section className="text-center space-y-6 py-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] p-8 border border-indigo-100 dark:border-indigo-900/30">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
                  <Sparkles className="w-8 h-8 text-indigo-500 fill-current" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black font-sans uppercase tracking-tight">Esplora il Mondo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                    Scrivi un argomento e ti fornirò un riassunto elegante e preciso, attingendo alla conoscenza globale.
                  </p>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* PWA Prompt */}
      {((isIOS || /Android/.test(navigator.userAgent)) && !isStandalone) && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
        >
          <div className="bg-indigo-600 p-3 rounded-2xl text-white">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold font-sans uppercase tracking-tight leading-tight">
            Installa Smart Knowledge: clicca su {isIOS ? '↑' : '⋮'} e seleziona <br/> <strong>"Aggiungi a Home"</strong>.
          </p>
        </motion.div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;700;900&display=swap');
        
        .font-serif { font-family: 'Crimson Pro', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        ::selection {
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default App;
