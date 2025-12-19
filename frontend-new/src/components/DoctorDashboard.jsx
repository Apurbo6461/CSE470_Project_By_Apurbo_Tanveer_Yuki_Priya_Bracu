import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Stethoscope, Clock, CheckCircle, Save, Camera, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DoctorDashboard = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Smith",
    specialization: "Cardiologist",
    credentials: "MD, PhD - Johns Hopkins",
    image: null,
    imageFile: null 
  });
  
  const [isAvailable, setIsAvailable] = useState(true);

  
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
    
        const res = await axios.get('http://localhost:5000/api/doctors');
        if (res.data.length > 0) {
          const d = res.data[0];
          setDoctorId(d._id);
          setProfile({
            name: d.name,
            specialization: d.specialization,
            credentials: d.credentials || "Medical Professional",
            image: d.image || null
          });
          setIsAvailable(d.availability);
        }
      } catch (err) {
        console.error("Could not fetch doctor profile:", err);
      }
    };
    fetchDoctor();
  }, []);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  
  const handleUpdateProfile = async () => {
    if (!doctorId) return toast.error("No Doctor ID found. Please create a profile first.");
    
    setLoading(true);
    try {
      
      const profileData = {
        name: profile.name,
        specialization: profile.specialization,
        credentials: profile.credentials
      };

      await axios.put(`http://localhost:5000/api/doctors/${doctorId}`, profileData);
      toast.success("Profile synchronized with Database!");
    } catch (err) {
      console.error("Sync Error:", err.response?.data);
      toast.error("Update failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const toggleAvailability = async () => {
    if (!doctorId) return;
    
    const newStatus = !isAvailable;
    setIsAvailable(newStatus); 

    try {
      await axios.put(`http://localhost:5000/api/doctors/${doctorId}/availability`, { 
        availability: newStatus 
      });
      toast.success(`Status updated to ${newStatus ? 'Active' : 'Busy'}`);
    } catch (err) {
      setIsAvailable(!newStatus);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-900 bg-[#f8fafc] overflow-hidden">
    
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial="initial" animate="animate"
        className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full p-6 md:p-12"
      >
      
        <motion.div className="lg:col-span-3">
          <div className="relative bg-white/40 backdrop-blur-[30px] border border-white/50 p-8 md:p-12 rounded-[3rem] shadow-xl">
            
            <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
              <div className="relative group">
                <div 
                  className="w-44 h-44 rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl bg-slate-100 flex items-center justify-center cursor-pointer relative"
                  onClick={() => fileInputRef.current.click()}
                >
                  {profile.image ? (
                    <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-blue-600/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="text-white mb-2" size={28} />
                    <span className="text-[10px] text-white font-bold tracking-widest uppercase text-center px-4">Update Photo</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              </div>

              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <Sparkles size={12} /> Medical Staff Dashboard
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-slate-800 mb-2">{profile.name}</h1>
                <p className="text-slate-500 font-medium text-xl italic">{profile.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                <input 
                  type="text" value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full p-6 bg-white/50 border border-slate-100 rounded-[2rem] outline-none text-lg font-semibold shadow-sm focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Specialization</label>
                <input 
                  type="text" value={profile.specialization}
                  onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                  className="w-full p-6 bg-white/50 border border-slate-100 rounded-[2rem] outline-none text-lg font-semibold shadow-sm focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Credentials</label>
                <textarea 
                  rows="3" value={profile.credentials}
                  onChange={(e) => setProfile({...profile, credentials: e.target.value})}
                  className="w-full p-6 bg-white/50 border border-slate-100 rounded-[2rem] outline-none text-lg font-semibold resize-none shadow-sm focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <motion.button 
              onClick={handleUpdateProfile}
              disabled={loading}
              whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
              className="mt-12 px-16 py-6 bg-slate-900 text-white rounded-[2.2rem] font-black text-xl flex items-center gap-4 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save />}
              {loading ? "Syncing..." : "Update Profile"}
            </motion.button>
          </div>
        </motion.div>

      
        <motion.div className="lg:col-span-1">
          <div className="h-full bg-slate-900/5 backdrop-blur-md border border-white/20 p-8 rounded-[3rem] flex flex-col justify-between">
            <h2 className="text-xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tighter">
              <Clock className="text-blue-600" /> Status
            </h2>

            <motion.div 
              onClick={toggleAvailability}
              whileHover={{ scale: 1.02 }}
              className={`relative w-full h-[350px] rounded-[4rem] cursor-pointer transition-all duration-700 flex flex-col items-center justify-center gap-8 shadow-2xl ${
                isAvailable ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
              <div className="p-8 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border border-white/30 z-10">
                <CheckCircle size={60} className="text-white" />
              </div>
              
              <div className="text-center z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-2">Real-time status</p>
                <p className="text-5xl font-black text-white tracking-tighter">
                  {isAvailable ? 'ACTIVE' : 'BUSY'}
                </p>
              </div>
            </motion.div>

            <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
              Tap card to toggle availability
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;