import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertCircle, FileText, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ReportAccidentModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    severity: 'Medium',
    status: 'Reported',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: '' 
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  const payload = {
    ...formData,
    time: formData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  try {
    const response = await axios.post('http://localhost:5000/api/accidents', payload);
    if (response.status === 201) {
      toast.success('Report Live!');
      onClose(); 
    }
  } catch (err) {
    console.error("Validation Error Details:", err.response?.data);
    toast.error(err.response?.data?.message || "Validation Failed");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white font-sans"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter text-slate-800">Report Incident</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Location</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-blue-500 transition-all">
                    <MapPin className="text-blue-500" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="Street, Landmark or Highway..."
                      className="bg-transparent outline-none w-full font-bold text-slate-700 placeholder:text-slate-300"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Incident Details</label>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-blue-500 transition-all">
                    <FileText className="text-blue-500 mt-1" size={20} />
                    <textarea 
                      required
                      rows="3"
                      placeholder="Describe the situation..."
                      className="bg-transparent outline-none w-full font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

      
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Severity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Low', 'High', 'Critical'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({...formData, severity: level})}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          formData.severity === level 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 mt-4 shadow-xl shadow-slate-200 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  {isSubmitting ? "Broadcasting..." : "Dispatch Report"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportAccidentModal;