import React, { useState } from 'react';
import DoctorDashboard from './components/DoctorDashboard';
import AccidentReporting from './components/AccidentReporting';
import { 
  User, 
  AlertTriangle, 
  LayoutDashboard, 
  Settings, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {

  const [activeTab, setActiveTab] = useState('doctor');

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden">

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '20px',
          },
        }}
      />

      <nav className="hidden md:flex flex-col w-24 lg:w-72 bg-white border-r border-slate-200 p-8 justify-between">
        <div className="space-y-12">

          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 rotate-3">
              <LayoutDashboard size={28} />
            </div>
            <span className="hidden lg:block font-black text-2xl tracking-tighter text-slate-900">
              LFE<span className="text-blue-600">Link</span>
            </span>
          </div>


          <div className="flex flex-col gap-3">
            <p className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 mb-2">
              Management
            </p>
            
            <button 
              onClick={() => setActiveTab('doctor')}
              className={`flex items-center justify-between group p-4 rounded-2xl transition-all duration-500 ${
                activeTab === 'doctor' 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <User size={22} strokeWidth={activeTab === 'doctor' ? 3 : 2} />
                <span className="hidden lg:block font-black text-sm uppercase tracking-widest">Profile</span>
              </div>
              <ChevronRight className={`hidden lg:block transition-transform ${activeTab === 'doctor' ? 'rotate-90' : 'opacity-0'}`} size={16} />
            </button>

            <button 
              onClick={() => setActiveTab('accidents')}
              className={`flex items-center justify-between group p-4 rounded-2xl transition-all duration-500 ${
                activeTab === 'accidents' 
                ? 'bg-rose-600 text-white shadow-2xl shadow-rose-200' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <AlertTriangle size={22} strokeWidth={activeTab === 'accidents' ? 3 : 2} />
                <span className="hidden lg:block font-black text-sm uppercase tracking-widest">Reports</span>
              </div>
              <ChevronRight className={`hidden lg:block transition-transform ${activeTab === 'accidents' ? 'rotate-90' : 'opacity-0'}`} size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button className="flex items-center gap-4 p-4 text-slate-400 hover:text-slate-600 transition-colors w-full group">
            <Settings size={22} className="group-hover:rotate-45 transition-transform" />
            <span className="hidden lg:block font-black text-sm uppercase tracking-widest">Settings</span>
          </button>
          <button className="flex items-center gap-4 p-4 text-rose-400 hover:bg-rose-50 rounded-2xl transition-all w-full">
            <LogOut size={22} />
            <span className="hidden lg:block font-black text-sm uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </nav>


      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        

        <div className="md:hidden flex justify-between items-center p-6 bg-white border-b border-slate-100">
           <span className="font-black text-xl tracking-tighter italic">MediSync</span>
           <div className="flex gap-4">
              <button onClick={() => setActiveTab('doctor')} className={activeTab === 'doctor' ? 'text-blue-600' : 'text-slate-300'}><User /></button>
              <button onClick={() => setActiveTab('accidents')} className={activeTab === 'accidents' ? 'text-rose-600' : 'text-slate-300'}><AlertTriangle /></button>
           </div>
        </div>


        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {activeTab === 'doctor' ? (
            <DoctorDashboard />
          ) : (
            <AccidentReporting />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;