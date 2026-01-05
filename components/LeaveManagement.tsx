
import React, { useState, useMemo } from 'react';
import { Employee, LeaveRequest } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface LeaveManagementProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  setLeaves: (leaves: LeaveRequest[]) => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees, leaves, setLeaves }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState<Partial<LeaveRequest>>({
    type: 'سنوية',
    status: 'معلق',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: string | null; status: LeaveRequest['status'] | null }>({
    isOpen: false,
    id: null,
    status: null
  });

  // حساب عدد الأيام للإجازة الحالية في النموذج
  const calculatedDays = useMemo(() => {
    if (newLeave.startDate && newLeave.endDate) {
      const start = new Date(newLeave.startDate);
      const end = new Date(newLeave.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  }, [newLeave.startDate, newLeave.endDate]);

  const triggerStatusChange = (id: string, status: LeaveRequest['status']) => {
    setConfirmState({ isOpen: true, id, status });
  };

  const handleConfirmedStatusChange = () => {
    if (confirmState.id && confirmState.status) {
      setLeaves(leaves.map(l => l.id === confirmState.id ? { ...l, status: confirmState.status! } : l));
    }
    setConfirmState({ isOpen: false, id: null, status: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    const leave: LeaveRequest = {
      ...newLeave as LeaveRequest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeaves([leave, ...leaves]);
    setIsModalOpen(false);
    setNewLeave({ type: 'سنوية', status: 'معلق', startDate: '', endDate: '', reason: '' });
  };

  const getDaysCount = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.status === 'مقبول' ? 'اعتماد الإجازة الرسمية' : 'رفض طلب الإجازة'}
        message={`هل أنت متأكد من قرارك؟ سيتم تحديث حالة الموظف فورياً وإرسال إشعار له بالقرار النهائي.`}
        confirmLabel={confirmState.status === 'مقبول' ? 'نعم، اعتماد' : 'نعم، رفض'}
        variant={confirmState.status === 'مقبول' ? 'info' : 'danger'}
        onConfirm={handleConfirmedStatusChange}
        onCancel={() => setConfirmState({ isOpen: false, id: null, status: null })}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الإجازات والاستحقاقات</h2>
          <p className="text-sm text-slate-500 font-medium">مراجعة طلبات الإجازة السنوية، المرضية، والاضطرارية.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center gap-2"
        >
          <span>➕</span>
          <span>تقديم طلب جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">نوع الإجازة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الفترة المستحقة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">المدة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves.map((leave) => {
                const emp = employees.find(e => e.id === leave.employeeId);
                const days = getDaysCount(leave.startDate, leave.endDate);
                return (
                  <tr key={leave.id} className="hover:bg-slate-50 transition group">
                    <td className="px-8 py-6">
                      <div className="font-extrabold text-slate-800 text-sm">{emp?.name || 'موظف سابق'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{emp?.role}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <span className="opacity-50">من:</span> {leave.startDate}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <span className="opacity-50">إلى:</span> {leave.endDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        {days} يوم
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black border ${
                        leave.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        leave.status === 'مرفوض' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {leave.status === 'معلق' && (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => triggerStatusChange(leave.id, 'مقبول')} className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm">✅</button>
                          <button onClick={() => triggerStatusChange(leave.id, 'مرفوض')} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm">❌</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="text-5xl mb-4 opacity-20">🏖️</div>
                      <p className="text-sm font-extrabold text-slate-400 italic">لا توجد طلبات إجازة حالياً</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl shadow-blue-100">🏖️</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">طلب إجازة جديد</h3>
                  <p className="text-xs text-slate-400 font-bold">يرجى تحديد تواريخ الاستحقاق بدقة</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الموظف صاحب الطلب</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition"
                  onChange={(e) => setNewLeave({...newLeave, employeeId: e.target.value})}
                  required
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تاريخ البدء</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" 
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تاريخ الانتهاء</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" 
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {calculatedDays > 0 && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-center font-black text-xs">
                  المدة المحتسبة: {calculatedDays} يوم عمل
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">نوع الإجازة</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" 
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value as any})}
                >
                  <option value="سنوية">إجازة سنوية</option>
                  <option value="مرضية">إجازة مرضية</option>
                  <option value="اضطرارية">إجازة اضطرارية</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">السبب / الملاحظات</label>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" 
                  rows={3}
                  value={newLeave.reason}
                  placeholder="يرجى ذكر سبب الإجازة (اختياري)"
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95">تقديم الطلب</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black hover:bg-slate-200 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
