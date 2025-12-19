import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Filter, MapPin, TrendingUp, 
  Clock, Activity, Wifi, Search, BarChart3, Plus, Loader2, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReportAccidentModal from './ReportAccidentModal';


const socket = io('http://localhost:5000');

const AccidentReporting = () => {
  
  const [accidents, setAccidents] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [accidentsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/accidents'),
        axios.get('http://localhost:5000/api/accidents/stats')
      ]);
      setAccidents(accidentsRes.data);
      setStatsData(statsRes.data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError("Unable to connect to the medical database.");
      toast.error("Offline Mode: Using cached data if available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    socket.on('new_accident_reported', (newAccident) => {
      setAccidents((prev) => [newAccident, ...prev]);
      
      toast.error(`NEW INCIDENT: ${newAccident.location}`, {
        icon: '🚨',
        style: {
          borderRadius: '20px',
          background: '#1e293b',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '600',
        },
      });

      loadDashboardData();
    });

    return () => socket.off('new_accident_reported');
  }, []);

  const filteredAccidents = accidents
    .filter(acc => acc.location.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "severity") {
        const priority = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (priority[b.severity] || 0) - (priority[a.severity] || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Hospital Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 md:p-10 bg-[#f8fafc] font-sans pb-32">
      <ReportAccidentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 z-50 flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-full font-bold shadow-2xl shadow-blue-400/40 border border-blue-400/20"
      >
        <Plus size={24} />
        <span className="uppercase tracking-widest text-xs font-extrabold">Report Accident</span>
      </motion.button>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600">
          <AlertTriangle size={20} />
          <span className="text-sm font-bold">{error} Check your backend connection.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={32} /> Accident Analytics
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Persistence Enabled: Fetching from MongoDB</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${error ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              <Wifi size={14} className={!error && "animate-pulse"} /> {error ? 'Disconnected' : 'Live Sync'}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'Poppins' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

    
        <div className="flex flex-col gap-6">
          <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group flex-grow">
            <BarChart3 className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Total Incident Count</p>
            <h3 className="text-7xl font-black mt-4 tracking-tighter">{accidents.length}</h3>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex-grow flex flex-col justify-between">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Database Persistence</p>
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{error ? 'Sync Failed' : 'Active MongoDB Link'}</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="flex flex-wrap items-center gap-6 p-6 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm mb-10">
        <div className="flex items-center gap-4 flex-grow p-4 bg-white rounded-[1.8rem] border border-slate-100 shadow-inner">
          <Search className="text-slate-300" size={24} />
          <input 
            type="text" placeholder="Search by location..." 
            className="bg-transparent outline-none w-full font-semibold text-slate-700 placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-2 bg-slate-100 rounded-2xl gap-2">
          {['newest', 'severity'].map((type) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                sortBy === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredAccidents.map((accident) => (
            <motion.div
              key={accident._id || accident.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-[1.5rem] shadow-lg ${
                  ['High', 'Critical'].includes(accident.severity) 
                  ? 'bg-rose-500 text-white shadow-rose-200' 
                  : 'bg-blue-600 text-white shadow-blue-200'
                }`}>
                  <AlertCircle size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  {accident.severity}
                </span>
              </div>

              <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{accident.location}</h4>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-4 italic">
                <Clock size={16} className="text-blue-500" /> {accident.time}
              </div>

              <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 h-10">
                {accident.description || "No additional details provided."}
              </p>

              <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] ${
                accident.status === 'En-route' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${accident.status === 'En-route' ? 'bg-orange-600 animate-ping' : 'bg-emerald-600'}`} />
                {accident.status}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAccidents.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <Search size={64} className="mb-4 text-slate-300" />
           <p className="font-black text-slate-400 uppercase tracking-[0.3em]">No incidents found</p>
        </div>
      )}
    </div>
  );
};

export default AccidentReporting;