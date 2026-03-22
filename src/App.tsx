import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Trash2, CheckCircle2, Circle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShoppingItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  quantity?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  'pane': 'Panetteria', 'focaccia': 'Panetteria', 'biscotti': 'Panetteria', 'cracker': 'Panetteria',
  'latte': 'Latticini', 'formaggio': 'Latticini', 'burro': 'Latticini', 'yogurt': 'Latticini', 'panna': 'Latticini',
  'mela': 'Ortofrutta', 'pera': 'Ortofrutta', 'banana': 'Ortofrutta', 'pomodoro': 'Ortofrutta', 'insalata': 'Ortofrutta', 'carota': 'Ortofrutta', 'patata': 'Ortofrutta',
  'carne': 'Macelleria', 'pollo': 'Macelleria', 'manzo': 'Macelleria', 'prosciutto': 'Macelleria', 'salame': 'Macelleria',
  'pesce': 'Pescheria', 'tonno': 'Pescheria', 'salmone': 'Pescheria',
  'pasta': 'Dispensa', 'riso': 'Dispensa', 'farina': 'Dispensa', 'zucchero': 'Dispensa', 'sale': 'Dispensa', 'olio': 'Dispensa',
  'acqua': 'Bevande', 'vino': 'Bevande', 'birra': 'Bevande', 'succo': 'Bevande', 'coca': 'Bevande',
  'sapone': 'Igiene', 'shampoo': 'Igiene', 'dentifricio': 'Igiene', 'carta': 'Igiene',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Panetteria': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Latticini': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Ortofrutta': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Macelleria': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Pescheria': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Dispensa': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Bevande': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Igiene': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  'Altro': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopping_list', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const lowerText = inputText.toLowerCase();
    let category = 'Altro';
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lowerText.includes(key)) {
        category = val;
        break;
      }
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      text: inputText.trim(),
      category,
      completed: false
    };

    setItems([newItem, ...items]);
    setInputText('');
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.completed));
  };

  const categories = [...new Set(items.map(item => item.category))].sort((a, b) => 
    a === 'Altro' ? 1 : b === 'Altro' ? -1 : a.localeCompare(b)
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Smart Spesa</h1>
          </div>
          {items.some(i => i.completed) && (
            <button 
              onClick={clearCompleted}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Pulisci carrello
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        
        {/* Input Form */}
        <form onSubmit={addItem} className="mb-10 relative">
          <input 
            type="text"
            placeholder="Aggiungi prodotto (es. Latte, Mele...)"
            className="w-full bg-white dark:bg-[#1a1d23] border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Categories & Items */}
        {items.length === 0 ? (
          <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
            <ShoppingCart className="w-16 h-16" />
            <p className="font-medium">La tua lista è vuota</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map(category => {
              const categoryItems = items.filter(i => i.category === category);
              const uncompleted = categoryItems.filter(i => !i.completed);
              const completed = categoryItems.filter(i => i.completed);

              if (categoryItems.length === 0) return null;

              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category] || CATEGORY_COLORS['Altro']}`}>
                      {category}
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="grid gap-2">
                    <AnimatePresence initial={false}>
                      {[...uncompleted, ...completed].map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${item.completed ? 'bg-slate-50 dark:bg-[#16191f] border-transparent opacity-50' : 'bg-white dark:bg-[#1a1d23] border-slate-100 dark:border-slate-800 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <button 
                              onClick={() => toggleComplete(item.id)}
                              className={`transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                            >
                              {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                            </button>
                            <span className={`font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>
                              {item.text}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </main>

      {/* iOS/Android PWA Prompt */}
      {((isIOS || /Android/.test(navigator.userAgent)) && !isStandalone) && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 bg-white dark:bg-[#1a1d23] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
        >
          <div className="bg-indigo-600 p-3 rounded-2xl text-white">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
            Installa la Spesa: clicca su {isIOS ? '↑' : '⋮'} e seleziona <br/> <strong>"Aggiungi a Home"</strong>.
          </p>
        </motion.div>
      )}

    </div>
  );
}

export default App;
