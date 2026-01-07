
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, LeaveRequest } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface LeaveManagementProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  setLeaves: (leaves: LeaveRequest[]) => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees, leaves, setLeaves }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('الكل');
  
  const leaveStats = useMemo(() => {
    return {
      pending: leaves.filter(l => l.status === 'معلق').length,
      annual: leaves.filter(l => l.type === 'سنوية' && l.status === 'مقبول').length,
      sick: leaves.filter(l => l.type === 'مرضية' && l.status === 'مقبول').length
    };
  }, [leaves]);

  const [newLeave, setNewLeave] = useState<Partial<LeaveRequest>>({
    type: 'سنوية', status: 'معلق', startDate: '', endDate: '', reason: ''
  });

  const handleStatusChange = (id: string, status: LeaveRequest['status']) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
  };

  const getDaysCount = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-7 bg-blue-600 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
               <p className="text-[10px] font-black opacity-60 uppercase mb-1">طلبات بانتظار الاعتماد</p>
               <p className="text-3xl font-black">{leaveStats.pending}</p>
            </div>
            <span className="text-4xl opacity-20 relative z-10">⏳</span>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
         </div>
         <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجازات سنوية نشطة</p>
               <p className="text-2xl font-black text-slate-800">{leaveStats.annual}</p>
            </div>
            <span className="text-3xl">🏝️</span>
         </div>
         <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجازات مرضية (شهر)</p>
               <p className="text-2xl font-black text-slate-800">{leaveStats.sick}</p>
            </div>
            <span className="text-3xl">🤒</span>
         </div>
      </div>

      <div className="flex justify-between items-center">
         <h3 className="text-xl font-black text-slate-800">سجل طلبات الإجازات</h3>
         <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl active-scale flex items-center gap-2"><span>➕</span> تقديم طلب جديد</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                     <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">النوع</th>
                     <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الفترة</th>
                     <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">المدة</th>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">إجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {leaves.map(leave => {
                     const emp = employees.find(e => e.id === leave.employeeId);
                     const days = getDaysCount(leave.startDate, leave.endDate);
                     return (
                        <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <img src={emp?.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                 <p className="font-black text-slate-800 text-sm">{emp?.name}</p>
                              </div>
                           </td>
                           <td className="px-6 py-6 font-bold text-slate-600 text-xs">{leave.type}</td>
                           <td className="px-6 py-6 text-center font-mono text-[11px] text-slate-500">{leave.startDate} ⬅ {leave.endDate}</td>
                           <td className="px-6 py-6 text-center font-black text-slate-800 text-xs">{days} يوم</td>
                           <td className="px-8 py-6 text-center">
                              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                                 leave.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                 leave.status === 'مرفوض' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>{leave.status}</span>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {leave.status === 'معلق' && (
                                 <div className="flex justify-center gap-2">
                                    <button onClick={() => handleStatusChange(leave.id, 'مقبول')} className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition flex items-center justify-center text-xs">✓</button>
                                    <button onClick={() => handleStatusChange(leave.id, 'مرفوض')} className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition flex items-center justify-center text-xs">✕</button>
                                 </div>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8">طلب إجازة جديد</h3>
              <form onSubmit={e => {
                 e.preventDefault();
                 setLeaves([{ ...newLeave as LeaveRequest, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...leaves]);
                 setIsModalOpen(false);
              }} className="space-y-6">
                 <select className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" onChange={e => setNewLeave({...newLeave, employeeId: e.target.value})} required>
                    <option value="">اختر الموظف...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} required />
                    <input type="date" className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} required />
                 </div>
                 <select className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none" value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value as any})}>
                    <option value="سنوية">إجازة سنوية</option>
                    <option value="مرضية">إجازة مرضية</option>
                    <option value="اضطرارية">إجازة اضطرارية</option>
                 </select>
                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-[2rem] font-black shadow-xl">حفظ الطلب ✨</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
