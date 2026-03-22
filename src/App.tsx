import { useState, useEffect } from 'react';
import { Sun, Wind, Thermometer, MapPin, Radio, Cpu, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [time, setTime] = useState(new Date());
  const [weather] = useState({
    temp: 24,
    condition: 'Sunny',
    city: 'Milano',
    humidity: 45,
    wind: 12
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Simulate mouse/gyro parallax
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 25;
      const y = (e.clientY - innerHeight / 2) / 25;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-[#00f2ff] overflow-hidden font-mono flex items-center justify-center p-4">
      
      {/* Background Grid & Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      {/* Main Hologram Container */}
      <motion.div 
        style={{ 
          rotateX: -mousePos.y, 
          rotateY: mousePos.x,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full max-w-4xl grid grid-cols-12 gap-4"
      >
        
        {/* TOP ROW: LOGO & STATUS */}
        <div className="col-span-12 flex justify-between items-end border-b border-[#00f2ff]/30 pb-4 mb-2">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 animate-pulse" />
            <div className="leading-none">
              <h1 className="text-xl font-black tracking-tighter uppercase italic">HoloOS v4.0</h1>
              <p className="text-[8px] opacity-50 tracking-[0.4em]">NEURAL INTERFACE ACTIVE</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold tracking-widest uppercase">System Stable</span>
            </div>
            <p className="text-[8px] opacity-50 font-bold uppercase tracking-widest">Lat: 45.4642° N | Lon: 9.1900° E</p>
          </div>
        </div>

        {/* MAIN CLOCK BENTO (Big Center) */}
        <div className="col-span-12 md:col-span-8 bg-[#00f2ff]/5 border border-[#00f2ff]/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,242,255,0.05)]">
          <div className="absolute top-4 left-6 flex items-center gap-2 opacity-40">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Chronos Module</span>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            <motion.div 
              key={time.getSeconds()}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-8xl md:text-9xl font-black tracking-tighter flex gap-2 drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]"
            >
              {formatTime(time)}
            </motion.div>
            <div className="mt-4 flex items-center gap-4 text-sm font-bold tracking-[0.5em] opacity-60">
              <div className="h-px w-12 bg-[#00f2ff]/30" />
              {formatDate(time)}
              <div className="h-px w-12 bg-[#00f2ff]/30" />
            </div>
          </div>

          {/* Glitch Decorative Element */}
          <div className="absolute bottom-4 right-6 opacity-20">
            <Activity className="w-12 h-12" />
          </div>
        </div>

        {/* WEATHER BENTO (Right Side) */}
        <div className="col-span-12 md:col-span-4 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-md relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{weather.city}</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight italic">Sunny</h3>
              </div>
              <Sun className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-spin-slow" />
            </div>

            <div className="mt-8">
              <div className="flex items-end gap-1 mb-4">
                <span className="text-6xl font-black tracking-tighter italic">{weather.temp}</span>
                <span className="text-2xl font-light mb-2">°C</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-indigo-500/20 pt-4">
                <div>
                  <p className="text-[8px] opacity-50 uppercase tracking-widest mb-1">Humidity</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-indigo-900/50 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    </div>
                    <span className="text-[10px] font-bold italic">{weather.humidity}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] opacity-50 uppercase tracking-widest mb-1">Wind Speed</p>
                  <div className="flex items-center gap-2">
                    <Wind className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold italic">{weather.wind} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: SENSORS & SIGNAL */}
        <div className="col-span-12 md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/20">
            <Radio className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-50">
              <span>Signal Strength</span>
              <span>98%</span>
            </div>
            <div className="flex gap-1 h-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-full ${i < 10 ? 'bg-[#00f2ff]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">CPU Load</span>
              <div className="flex items-end gap-1 h-6">
                {[4, 8, 6, 10, 5, 12, 7, 9].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: `${h * 8}%` }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                    className="w-1.5 bg-indigo-500 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Core Temp</span>
              <div className="flex items-center gap-2 text-xl font-black italic">
                <Thermometer className="w-4 h-4 text-rose-500" />
                38.4°
              </div>
            </div>
          </div>
          
          <button className="bg-[#00f2ff] text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all active:scale-95">
            Sync Neural Link
          </button>
        </div>

      </motion.div>

      {/* Decorative Glitch Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-10 w-32 h-px bg-[#00f2ff]/20 animate-pulse" />
        <div className="absolute bottom-1/3 right-20 w-px h-48 bg-indigo-500/20 animate-pulse" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,400;0,800;1,100;1,400;1,800&display=swap');
        
        body {
          font-family: 'JetBrains Mono', monospace;
          background: #02040a;
          perspective: 1000px;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0, 242, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 242, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        ::selection {
          background: #00f2ff;
          color: #000;
        }
      `}</style>
    </div>
  );
}

export default App;
