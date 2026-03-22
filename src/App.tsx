import React, { useState, useEffect, useRef } from 'react';
import { Plus, Bell, Clock, Trash2, CheckCircle2, AlertCircle, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reminder {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  notified: boolean;
}

function App() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Audio for notification
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Check if app is installed (standalone)
    const standalone = (window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkReminders(now);
    }, 1000);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => clearInterval(timer);
  }, [reminders]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const checkReminders = (now: Date) => {
    const currentStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    reminders.forEach(reminder => {
      if (!reminder.completed && !reminder.notified && reminder.time === currentStr) {
        showNotification(reminder);
        setReminders(prev => prev.map(r => 
          r.id === reminder.id ? { ...r, notified: true } : r
        ));
      }
    });
  };

  const showNotification = (reminder: Reminder) => {
    if (notificationPermission === 'granted') {
      new Notification('Promemoria!', {
        body: reminder.text,
        icon: '/favicon.svg'
      });
    }
    // Play sound if possible
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play blocked', e));
    }
  };

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !time) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      text,
      time,
      completed: false,
      notified: false
    };

    setReminders([newReminder, ...reminders]);
    setText('');
    setTime('');
  };

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const clearCompleted = () => {
    setReminders(reminders.filter(r => !r.completed));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
      
      <div className="w-full max-w-md">
        {/* Header / Clock */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light text-slate-900 dark:text-white mb-2 tracking-tight">
            {currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-xs">
            {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* iOS Specific Instructions */}
        {isIOS && !isStandalone && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Per le notifiche su iOS:</strong> Clicca sull'icona di condivisione <span className="inline-block border border-blue-300 rounded px-1 text-xs">↑</span> e seleziona <strong>"Aggiungi alla schermata Home"</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Notification Banner */}
        {(!isIOS || isStandalone) && notificationPermission !== 'granted' && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-amber-800 dark:text-amber-200">Abilita le notifiche per non perdere i promemoria</p>
            </div>
            <button 
              onClick={requestPermission}
              className="text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full transition-colors"
            >
              Abilita
            </button>
          </div>
        )}

        {/* Add Reminder Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 mb-8">
          <form onSubmit={addReminder} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cosa devi fare?"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="time"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center"
              >
                Aggiungi
              </button>
            </div>
          </form>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              I tuoi promemoria
            </h2>
            {reminders.some(r => r.completed) && (
              <button 
                onClick={clearCompleted}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Trash className="w-3 h-3" />
                Cancella completati
              </button>
            )}
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {reminders.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500">Nessun promemoria impostato</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {reminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="relative overflow-hidden rounded-2xl"
                    >
                      {/* Delete Background */}
                      <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6 rounded-2xl">
                        <Trash2 className="text-white w-6 h-6" />
                      </div>

                      {/* Swipeable Foreground */}
                      <motion.div 
                        drag="x"
                        dragConstraints={{ left: -100, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -60) {
                            deleteReminder(reminder.id);
                          }
                        }}
                        className={`relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between transition-colors ${reminder.completed ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleComplete(reminder.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              reminder.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            {reminder.completed && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <div>
                            <h3 className={`font-medium transition-all ${reminder.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {reminder.text}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                              <Clock className="w-3 h-3" />
                              {reminder.time}
                            </div>
                          </div>
                        </div>
                        
                        {/* PC Delete Button (fallback) */}
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-slate-300 hover:text-rose-500 p-2 transition-colors hidden md:block"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Mobile Swipe Hint (on iOS) */}
                        {isIOS && (
                          <div className="md:hidden text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                            ← swipe
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
