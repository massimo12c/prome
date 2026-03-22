import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CloudRain, Flame, Coffee, Wind, TreePine, Volume2, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const SOUNDS = [
  { id: 'rain', name: 'Pioggia', icon: CloudRain, url: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3' },
  { id: 'fire', name: 'Fuoco', icon: Flame, url: 'https://assets.mixkit.co/active_storage/sfx/2413/2413-preview.mp3' },
  { id: 'coffee', name: 'Caffè', icon: Coffee, url: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3' },
  { id: 'wind', name: 'Vento', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2422/2422-preview.mp3' },
  { id: 'forest', name: 'Foresta', icon: TreePine, url: 'https://assets.mixkit.co/active_storage/sfx/2411/2411-preview.mp3' },
];

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>({});
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const setDuration = (mins: number) => {
    const secs = mins * 60;
    setTotalTime(secs);
    setTimeLeft(secs);
    setIsActive(false);
  };

  const toggleSound = (id: string) => {
    const isNowActive = !activeSounds[id];
    setActiveSounds({ ...activeSounds, [id]: isNowActive });
    
    if (isNowActive) {
      audioRefs.current[id].play().catch(e => console.log('Audio play blocked', e));
      audioRefs.current[id].loop = true;
    } else {
      audioRefs.current[id].pause();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-slate-200 transition-colors duration-1000 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      
      {/* Hidden Audio Elements */}
      {SOUNDS.map(sound => (
        <audio 
          key={sound.id}
          ref={el => { if (el) audioRefs.current[sound.id] = el; }}
          src={sound.url}
          preload="auto"
        />
      ))}

      {/* Background Animated Gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-12">
        
        {/* Timer Circle */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-200 dark:text-slate-800"
            />
            <motion.circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="816.8"
              animate={{ strokeDashoffset: 816.8 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-indigo-500 dark:text-indigo-400"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center flex flex-col items-center">
            <motion.span 
              key={timeLeft}
              initial={{ opacity: 0.5, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-extralight tracking-tighter"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-2">
              {isActive ? 'Concentrazione' : 'Pronto'}
            </p>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="p-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          <div className="flex flex-col gap-2">
            {[15, 25, 45].map(m => (
              <button 
                key={m}
                onClick={() => setDuration(m)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${totalTime === m * 60 ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Sound Mixer */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Volume2 className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mixer Ambientale</span>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-90 ${activeSounds[sound.id] ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
              >
                <sound.icon className="w-6 h-6" />
                <span className="text-[8px] font-bold uppercase tracking-tighter">{sound.name}</span>
              </button>
            ))}
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
            <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">
              Installa per un'esperienza Zen: clicca su <span className="inline-block border rounded px-1">↑</span> e poi su <br/> <strong>"Aggiungi alla schermata Home"</strong>.
            </p>
            <button onClick={() => setIsIOS(false)} className="text-slate-300 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default App;
