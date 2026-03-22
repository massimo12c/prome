import { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, PieChart, TrendingUp, TrendingDown, DollarSign, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  timestamp: number;
}

const CATEGORY_MAP: Record<string, string> = {
  'pizza': 'Cibo', 'ristorante': 'Cibo', 'cena': 'Cibo', 'pranzo': 'Cibo', 'spesa': 'Cibo', 'caffè': 'Cibo', 'bar': 'Cibo',
  'benzina': 'Trasporti', 'auto': 'Trasporti', 'treno': 'Trasporti', 'bus': 'Trasporti', 'parcheggio': 'Trasporti',
  'affitto': 'Casa', 'bolletta': 'Casa', 'luce': 'Casa', 'gas': 'Casa', 'internet': 'Casa',
  'cinema': 'Svago', 'teatro': 'Svago', 'gioco': 'Svago', 'abbonamento': 'Svago', 'netflix': 'Svago',
  'stipendio': 'Entrate', 'bonus': 'Entrate', 'regalo': 'Entrate',
};

const CATEGORY_ICONS: Record<string, any> = {
  'Cibo': '🍔', 'Trasporti': '🚗', 'Casa': '🏠', 'Svago': '🎮', 'Entrate': '💰', 'Altro': '📦'
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? JSON.parse(saved) : 1000;
  });
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(transactions));
    localStorage.setItem('monthly_budget', JSON.stringify(budget));
  }, [transactions, budget]);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Pattern: "10 pizza" or "pizza 10"
    const amountMatch = inputText.match(/(\d+([.,]\d+)?)/);
    if (!amountMatch) return;

    const amount = parseFloat(amountMatch[1].replace(',', '.'));
    const description = inputText.replace(amountMatch[0], '').trim() || 'Spesa generica';
    
    let category = 'Altro';
    const lowerDesc = description.toLowerCase();
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lowerDesc.includes(key)) {
        category = val;
        break;
      }
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      description,
      category,
      date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      timestamp: Date.now()
    };

    setTransactions([newTransaction, ...transactions]);
    setInputText('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthTransactions
    .filter(t => t.category !== 'Entrate')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEarned = currentMonthTransactions
    .filter(t => t.category === 'Entrate')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalEarned - totalSpent;
  const budgetProgress = Math.min((totalSpent / budget) * 100, 100);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-10">
      
      {/* Header / Wallet Card */}
      <header className="bg-indigo-600 dark:bg-indigo-700 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm font-bold opacity-80 tracking-widest uppercase">Il tuo Portafoglio</span>
            </div>
            <button 
              onClick={() => setShowBudgetEdit(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-[10px] font-bold transition-all"
            >
              Imposta Budget
            </button>
          </div>
          
          <div className="space-y-1 mb-8">
            <h1 className="text-4xl font-black tracking-tighter">€ {balance.toFixed(2)}</h1>
            <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Saldo Mensile</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-xl"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
              <div>
                <p className="text-[10px] opacity-60 font-bold">Entrate</p>
                <p className="font-bold tracking-tight">€ {totalEarned.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="bg-rose-500/20 p-2 rounded-xl"><TrendingDown className="w-4 h-4 text-rose-400" /></div>
              <div>
                <p className="text-[10px] opacity-60 font-bold">Uscite</p>
                <p className="font-bold tracking-tight">€ {totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 -mt-12">
        
        {/* Budget Progress Card */}
        <div className="bg-white dark:bg-[#161821] rounded-[2rem] p-6 shadow-xl mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget Mensile</p>
              <h2 className="text-xl font-bold">€ {totalSpent.toFixed(0)} <span className="text-slate-300 font-light">/ € {budget}</span></h2>
            </div>
            <span className={`text-xs font-black ${budgetProgress > 90 ? 'text-rose-500' : 'text-indigo-500'}`}>
              {budgetProgress.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              className={`h-full transition-all duration-1000 ${budgetProgress > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
            />
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={addTransaction} className="relative mb-8">
          <input 
            type="text"
            placeholder="Es: '10 Pizza' o 'Stipendio 1500'"
            className="w-full bg-white dark:bg-[#161821] border-none rounded-2xl py-4 pl-12 pr-4 shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl">
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ultime Operazioni</h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {transactions.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6">
                    <Trash2 className="text-white w-5 h-5" />
                  </div>

                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    onDragEnd={(_, info) => info.offset.x < -60 && deleteTransaction(t.id)}
                    className="relative bg-white dark:bg-[#161821] p-4 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl bg-slate-50 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
                        {CATEGORY_ICONS[t.category] || CATEGORY_ICONS['Altro']}
                      </div>
                      <div>
                        <p className="font-bold text-sm capitalize">{t.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.category} • {t.date}</p>
                      </div>
                    </div>
                    <div className={`text-right font-black tracking-tighter ${t.category === 'Entrate' ? 'text-emerald-500' : ''}`}>
                      {t.category === 'Entrate' ? '+' : '-'} € {t.amount.toFixed(2)}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {transactions.length === 0 && (
              <div className="text-center py-10 opacity-20 flex flex-col items-center gap-4">
                <TrendingUp className="w-12 h-12" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Nessuna spesa registrata</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Budget Edit Modal */}
      <AnimatePresence>
        {showBudgetEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#161821] w-full max-w-xs rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black uppercase tracking-widest text-xs">Imposta Budget Mensile</h4>
                <button onClick={() => setShowBudgetEdit(false)}><X className="w-4 h-4" /></button>
              </div>
              <input 
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 text-center text-2xl font-black mb-6"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <button 
                onClick={() => setShowBudgetEdit(false)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold"
              >
                Salva
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS/Android Prompt */}
      {((isIOS || /Android/.test(navigator.userAgent)) && !isStandalone) && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 bg-white dark:bg-[#161821] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50"
        >
          <div className="bg-indigo-600 p-3 rounded-2xl text-white">
            <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
            Installa Smart Budget: clicca su {isIOS ? '↑' : '⋮'} e seleziona <br/> <strong>"Aggiungi a Home"</strong>.
          </p>
        </motion.div>
      )}

    </div>
  );
}

export default App;
