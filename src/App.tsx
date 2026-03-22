import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Droplets, Sparkles, Sun, Moon, Wind, Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('flow_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('flow_water');
    return saved ? JSON.parse(saved) : 0;
  });
  const [inputText, setInputText] = useState('');
  const [time, setTime] = useState(new Date());
  
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    localStorage.setItem('flow_todos', JSON.stringify(todos));
    localStorage.setItem('flow_water', JSON.stringify(water));
  }, [todos, water]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
    return () => clearInterval(timer);
  }, []);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newTodo: Todo = { id: Date.now().toString(), text: inputText.trim(), completed: false };
    setTodos([newTodo, ...todos]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Buongiorno";
    if (hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const getQuote = () => {
    const quotes = [
      "Fai un respiro profondo.",
      "Un passo alla volta.",
      "Oggi è un nuovo inizio.",
      "Trova la bellezza nelle piccole cose.",
      "Sii gentile con te stesso."
    ];
    return quotes[time.getDay() % quotes.length];
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] dark:bg-[#0f0f0f] text-[#3d3d3d] dark:text-[#e0e0e0] transition-colors duration-1000 font-sans pb-20 selection:bg-orange-100">
      
      <main className="max-w-xl mx-auto px-6 pt-16 md:pt-24 space-y-12">
        
        {/* Header Section */}
        <header className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-orange-500/80"
          >
            {time.getHours() < 18 ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-[0.3em]">{getGreeting()}</span>
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-[#1a1a1a] dark:text-white leading-tight">
              Il tuo Flow.
            </h1>
            <p className="text-lg text-slate-400 font-medium italic">"{getQuote()}"</p>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid gap-6">
          
          {/* Focus Section */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-black tracking-tight">Focus di oggi</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                {todos.filter(t => t.completed).length}/{todos.length} completati
              </span>
            </div>

            <form onSubmit={addTodo} className="relative">
              <input 
                type="text"
                placeholder="Cosa vuoi realizzare?"
                className="w-full bg-slate-50 dark:bg-[#222] border-none rounded-2xl py-4 pl-6 pr-12 text-sm focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {todos.map(todo => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex items-center justify-between py-1"
                  >
                    <button 
                      onClick={() => toggleTodo(todo.id)}
                      className="flex items-center gap-4 text-left flex-1"
                    >
                      <div className={`transition-colors ${todo.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-400'}`}>
                        {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <span className={`font-bold transition-all ${todo.completed ? 'text-slate-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {todo.text}
                      </span>
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Wellness Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] p-8 border border-blue-100/50 dark:border-blue-900/30 flex flex-col items-center justify-center text-center gap-4">
              <div className="relative">
                <Droplets className="w-10 h-10 text-blue-500" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-400 rounded-full blur-xl -z-10"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Idratazione</p>
                <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{water * 250}ml</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setWater(Math.max(0, water - 1))}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-blue-500 font-black"
                >
                  -
                </button>
                <button 
                  onClick={() => setWater(water + 1)}
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-100/50 dark:border-emerald-900/30 flex flex-col items-center justify-center text-center gap-4">
              <Wind className="w-10 h-10 text-emerald-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Respiro</p>
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">Prenditi un minuto</h3>
              </div>
              <button className="px-6 py-2 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95">
                Inizia
              </button>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <footer className="text-center py-10 opacity-30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {time.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tighter">Custodisci il tuo tempo, ogni giorno.</p>
        </footer>

      </main>

      {/* PWA Prompt */}
      {((isIOS || /Android/.test(navigator.userAgent)) && !isStandalone) && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
        >
          <div className="bg-orange-500 p-3 rounded-2xl text-white">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[10px] font-bold font-sans uppercase tracking-tight leading-tight">
            Installa il tuo Flow: clicca su {isIOS ? '↑' : '⋮'} e seleziona <br/> <strong>"Aggiungi a Home"</strong>.
          </p>
        </motion.div>
      )}

    </div>
  );
}

export default App;
