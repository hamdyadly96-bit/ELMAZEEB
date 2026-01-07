
import React, { useState, useMemo } from 'react';
import { Shift, Employee, SystemSettings } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface ShiftManagementProps {
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  settings: SystemSettings;
}

const ShiftManagement: React.FC<ShiftManagementProps> = ({ shifts, setShifts, employees, setEmployees, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({ name: '', department: settings.departments[0], startTime: '08:00', endTime: '16:00' });

  const calculateHours = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH + eM/60) - (sH + sM/60);
    return parseFloat((diff < 0 ? diff + 24 : diff).toFixed(2));
  };

  const getCompliance = (hours: number) => {
    if (hours <= 8) return { label: 'مثالية 🟢', color: 'text-emerald-600 bg-emerald-50' };
    if (hours <= 11) return { label: 'قانونية (إضافي) 🔵', color: 'text-blue-600 bg-blue-50' };
    return { label: 'مخالفة 🔴', color: 'text-rose-600 bg-rose-50' };
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">هيكلة الورديات الذكية</h2>
            <p className="text-sm text-slate-500 font-medium">تحديد فترات العمل مع التنبيه التلقائي للمخالفات النظامية.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active-scale"><span>➕</span> إضافة وردية جديدة</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shifts.map(shift => {
          const hours = calculateHours(shift.startTime, shift.endTime);
          const compliance = getCompliance(hours);
          const assignedCount = employees.filter(e => e.shiftId === shift.id).length;

          return (
            <div key={shift.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">🕒</div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black border ${compliance.color}`}>{compliance.label}</span>
               </div>
               <h3 className="text-lg font-black text-slate-800 mb-1">{shift.name}</h3>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">{shift.department}</p>
               
               <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">وقت البدء</p>
                    <p className="text-sm font-black text-slate-800 font-mono">{shift.startTime}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">وقت الانتهاء</p>
                    <p className="text-sm font-black text-slate-800 font-mono">{shift.endTime}</p>
                  </div>
               </div>

               <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                  <span>إجمالي الساعات: {hours} س</span>
                  <span>الموظفون: {assignedCount}</span>
               </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8">تعريف وردية عمل</h3>
              <form onSubmit={e => {
                 e.preventDefault();
                 setShifts([...shifts, { ...newShift as Shift, id: Date.now().toString(), workHours: calculateHours(newShift.startTime!, newShift.endTime!) }]);
                 setIsModalOpen(false);
              }} className="space-y-6">
                 <input className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" placeholder="اسم الوردية (مثلاً: الصباحية أ)" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} required />
                 <select className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newShift.department} onChange={e => setNewShift({...newShift, department: e.target.value})}>
                    {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="time" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                    <input type="time" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-[2rem] font-black shadow-xl">حفظ الوردية ✨</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
