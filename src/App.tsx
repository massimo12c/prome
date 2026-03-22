import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Calendar, BookOpen, PenLine, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiaryEntry {
  id: string;
  date: string;
  text: string;
  timestamp: number;
}

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('diary_entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    localStorage.setItem('diary_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    const standalone = (window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addEntry = () => {
    if (!inputText.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setEntries([newEntry, ...entries]);
    setInputText('');
    setIsWriting(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const filteredEntries = entries.filter(e => 
    e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayEntry = entries.find(e => 
    new Date(e.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0c0c] text-[#2c2c2c] dark:text-[#e0e0e0] transition-colors duration-500 font-serif">
      
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-16 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-medium tracking-tight text-[#1a1a1a] dark:text-white">
                Diario Personale
              </h1>
              <p className="text-sm text-slate-400 uppercase tracking-[0.2em] font-sans font-bold">
                {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-indigo-500/50" />
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative mb-12 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            placeholder="Cerca nei tuoi ricordi..."
            className="w-full bg-white dark:bg-[#161616] border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Writing Section */}
        <div className="mb-16">
          <AnimatePresence mode="wait">
            {!isWriting ? (
              <motion.button
                key="add-button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setIsWriting(true)}
                disabled={!!todayEntry && !searchQuery}
                className={`w-full group bg-white dark:bg-[#161616] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50 ${!!todayEntry ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-indigo-500/5'}`}
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <PenLine className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">
                    {todayEntry ? 'Hai già scritto per oggi' : 'Cosa hai in mente?'}
                  </p>
                  <p className="text-sm text-slate-400 font-sans mt-1">
                    {todayEntry ? 'Torna domani per un nuovo pensiero' : 'Scrivi un solo pensiero per custodire la giornata'}
                  </p>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="writing-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#161616] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest font-sans">Nuovo Pensiero</span>
                  <button onClick={() => setIsWriting(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  autoFocus
                  placeholder="Oggi è stato..."
                  className="w-full bg-transparent border-none focus:ring-0 text-xl leading-relaxed resize-none h-32 placeholder:text-slate-200 dark:placeholder:text-slate-800"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={addEntry}
                    disabled={!inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-sans font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Custodisci
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Entries List */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-slate-300 dark:text-slate-700">
            <div className="h-px flex-1 bg-current opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-sans">I tuoi ricordi</span>
            <div className="h-px flex-1 bg-current opacity-20" />
          </div>

          <div className="space-y-12">
            <AnimatePresence initial={false}>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group relative"
                >
                  <div className="flex gap-6">
                    <div className="hidden md:flex flex-col items-center gap-2 pt-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500/30 group-hover:bg-indigo-500 transition-colors" />
                      <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    
                    <div className="flex-1 space-y-3 pb-8">
                      <div className="flex items-center justify-between">
                        <time className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {entry.date}
                        </time>
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg md:text-xl text-[#333] dark:text-[#ccc] leading-relaxed">
                        {entry.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredEntries.length === 0 && (
              <div className="text-center py-20 opacity-20 grayscale">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p className="font-medium italic">Ancora nessun ricordo custodito...</p>
              </div>
            )}
          </div>
        </div>

        {/* iOS PWA Instructions */}
        {isIOS && !isStandalone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 right-6 bg-white dark:bg-[#161616] border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl text-indigo-500">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-sans leading-tight pr-4">
              <strong>Installa il Diario:</strong> clicca sull'icona di condivisione <span className="inline-block border rounded px-1">↑</span> e poi su <strong>"Aggiungi alla schermata Home"</strong>.
            </p>
            <button onClick={() => setIsIOS(false)} className="text-slate-300 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;700&display=swap');
        
        .font-serif { font-family: 'Crimson Pro', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        ::selection {
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
}

export default App;
