
import React, { useState } from 'react';
// Added SystemSettings to imports
import { Employee, FinancialAdjustment, SystemSettings } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface FinancialsProps {
  employees: Employee[];
  adjustments: FinancialAdjustment[];
  setAdjustments: (adj: FinancialAdjustment[]) => void;
  // Added settings property to fix TypeScript error in App.tsx line 191
  settings: SystemSettings;
}

const Financials: React.FC<FinancialsProps> = ({ employees, adjustments, setAdjustments, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdj, setNewAdj] = useState<Partial<FinancialAdjustment>>({ type: 'مكافأة', amount: 0, reason: '' });
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirming(true);
  };

  const handleConfirmedAdd = () => {
    const adj: FinancialAdjustment = {
      ...newAdj as FinancialAdjustment,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setAdjustments([adj, ...adjustments]);
    setIsModalOpen(false);
    setIsConfirming(false);
    setNewAdj({ type: 'مكافأة', amount: 0, reason: '' });
  };

  const selectedEmpName = employees.find(e => e.id === newAdj.employeeId)?.name || '';

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={isConfirming}
        title="تأكيد العملية المالية"
        message={`هل أنت متأكد من رغبتك في إضافة ${newAdj.type} بمبلغ ${newAdj.amount?.toLocaleString()} ريال للموظف ${selectedEmpName}؟ سيؤثر هذا على كشف الراتب القادم.`}
        confirmLabel="تأكيد الإضافة"
        variant="warning"
        onConfirm={handleConfirmedAdd}
        onCancel={() => setIsConfirming(false)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">المؤثرات المالية</h2>
          <p className="text-slate-500 text-sm">إدارة المكافآت، الجزاءات، والخصومات الشهرية.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100"
        >
          إضافة مؤثر مالي ➕
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-right min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">الموظف</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">النوع</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">المبلغ</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">السبب</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adjustments.map((adj) => {
              const emp = employees.find(e => e.id === adj.employeeId);
              return (
                <tr key={adj.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-sm">{emp?.name || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${adj.type === 'مكافأة' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {adj.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-700">{adj.amount.toLocaleString()} ريال</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{adj.reason}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-mono">{adj.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {adjustments.length === 0 && <div className="p-12 text-center text-slate-400 italic">لا توجد سجلات مالية مضافة.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-in zoom-in duration-200 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">إضافة مؤثر مالي جديد</h3>
            <form onSubmit={handleOpenConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">الموظف المستهدف</label>
                <select className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" onChange={(e) => setNewAdj({...newAdj, employeeId: e.target.value})} required>
                  <option value="">اختر الموظف</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">النوع</label>
                  <select className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" onChange={(e) => setNewAdj({...newAdj, type: e.target.value as any})}>
                    <option value="مكافأة">مكافأة</option>
                    <option value="خصم">خصم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">المبلغ (ريال)</label>
                  <input type="number" className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" onChange={(e) => setNewAdj({...newAdj, amount: Number(e.target.value)})} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">السبب / الملاحظات</label>
                <textarea className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" rows={3} onChange={(e) => setNewAdj({...newAdj, reason: e.target.value})} required></textarea>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-100">إضافة المؤثر</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
