import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Hash, Filter, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
}

function App() {
  const [items, setItems] = useState<VaultItem[]>(() => {
    const saved = localStorage.getItem('vault_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    localStorage.setItem('vault_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim().toLowerCase())) {
        setCurrentTags([...currentTags, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  };

  const removeCurrentTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(t => t !== tagToRemove));
  };

  const addItem = () => {
    if (!title.trim()) return;

    const newItem: VaultItem = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      tags: currentTags,
      timestamp: Date.now()
    };

    setItems([newItem, ...items]);
    setTitle('');
    setContent('');
    setCurrentTags([]);
    setIsAdding(false);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const allTags = [...new Set(items.flatMap(item => item.tags))].sort();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-24">
      
      {/* Top Navigation & Filters */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bookmark className="w-5 h-5 text-white fill-current" />
              </div>
              <h1 className="text-xl font-black tracking-tight">Smart Vault</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Cerca per titolo, contenuto o tag..."
              className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${!selectedTag ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Tutti
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${selectedTag === tag ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  <Hash className="w-3 h-3 opacity-50" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
            <Filter className="w-16 h-16" />
            <p className="font-bold uppercase tracking-widest text-sm">Nessun elemento trovato</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white dark:bg-[#161b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg leading-tight tracking-tight pr-8">{item.title}</h3>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.content && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Hash className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md bg-black/40">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white dark:bg-[#161b22] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black tracking-tight">Nuovo Elemento</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <input 
                  type="text"
                  placeholder="Titolo (es: Codice Garage, Link Ricetta...)"
                  className="w-full bg-transparent border-none text-2xl font-black placeholder:text-slate-200 dark:placeholder:text-slate-800 focus:ring-0 p-0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                
                <textarea 
                  placeholder="Contenuto o note..."
                  className="w-full bg-transparent border-none text-slate-500 dark:text-slate-400 focus:ring-0 p-0 resize-none h-24"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map(tag => (
                      <span key={tag} className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                        {tag}
                        <button onClick={() => removeCurrentTag(tag)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Aggiungi tag e premi Invio"
                      className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                    />
                  </div>
                </div>

                <button 
                  onClick={addItem}
                  disabled={!title.trim()}
                  className="w-full bg-indigo-600 disabled:opacity-50 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
                >
                  Salva nel Vault
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Prompt */}
      {((isIOS || /Android/.test(navigator.userAgent)) && !isStandalone) && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
        >
          <div className="bg-indigo-600 p-3 rounded-2xl text-white">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-tight leading-tight">
            Installa il Vault: clicca su {isIOS ? '↑' : '⋮'} e seleziona <br/> <strong>"Aggiungi a Home"</strong>.
          </p>
        </motion.div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default App;
