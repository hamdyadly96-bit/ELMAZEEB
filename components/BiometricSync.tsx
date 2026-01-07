
import React, { useState, useMemo } from 'react';
import { Employee, AttendanceEntry, BiometricDevice } from '../types';

interface BiometricSyncProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
  devices: BiometricDevice[];
  setDevices: (devices: BiometricDevice[]) => void;
}

const BiometricSync: React.FC<BiometricSyncProps> = ({ employees, attendance, setAttendance, devices, setDevices }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString('en-GB')}] ${msg}`, ...prev].slice(0, 10));

  const simulateSync = async (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;
    setSyncingId(deviceId);
    addLog(`📡 جاري الاتصال بالجهاز: ${dev.name}...`);
    await new Promise(r => setTimeout(r, 1000));
    addLog(`🔓 تم المصادقة بنجاح. سحب سجلات الحضور...`);
    await new Promise(r => setTimeout(r, 1500));
    addLog(`✅ تم مزامنة 14 سجلاً بنجاح.`);
    setSyncingId(null);
    setDevices(devices.map(d => d.id === deviceId ? { ...d, lastSync: new Date().toISOString() } : d));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">بوابة الربط الذكي بالبصمة</h2>
            <p className="text-sm text-slate-500 font-medium">مراقبة حية لأجهزة الحضور الموزعة في الفروع والمستودعات.</p>
         </div>
         <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active-scale"><span>➕</span> تسجيل جهاز جديد</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map(dev => (
               <div key={dev.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📟</div>
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black border ${dev.status === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {dev.status === 'online' ? 'متصل' : 'أوفلاين'}
                     </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">{dev.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400 mb-6">{dev.ip}:{dev.port}</p>
                  
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-300 uppercase">آخر مزامنة: {dev.lastSync ? dev.lastSync.slice(11, 16) : '---'}</p>
                     <button 
                        onClick={() => simulateSync(dev.id)}
                        disabled={syncingId === dev.id}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${syncingId === dev.id ? 'bg-blue-100 text-blue-400 animate-spin' : 'bg-blue-600 text-white hover:bg-slate-900 shadow-lg'}`}
                     >
                        🔄
                     </button>
                  </div>
               </div>
            ))}
         </div>

         <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-emerald-400 font-mono text-xs h-[450px] flex flex-col shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biometric Bridge Console</span>
                  <div className="flex gap-1.5">
                     <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></span>
                     <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                  {logs.map((log, i) => (
                     <div key={i} className="animate-in slide-in-from-bottom-2 duration-300 opacity-80 hover:opacity-100">
                        {log}
                     </div>
                  ))}
                  {logs.length === 0 && <p className="text-slate-600 italic text-center py-20">بانتظار بدء عمليات المزامنة...</p>}
               </div>
               <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-[9px] font-black text-slate-600">
                  <span>SSL_ENCRYPTED: ON</span>
                  <span>HANDSHAKE: OK</span>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BiometricSync;
