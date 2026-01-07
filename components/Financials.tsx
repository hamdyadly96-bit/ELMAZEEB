
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, FinancialAdjustment, SystemSettings } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface FinancialsProps {
  employees: Employee[];
  adjustments: FinancialAdjustment[];
  setAdjustments: (adj: FinancialAdjustment[]) => void;
  settings: SystemSettings;
}

const Financials: React.FC<FinancialsProps> = ({ employees, adjustments, setAdjustments, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('الكل');

  const [newAdj, setNewAdj] = useState<Partial<FinancialAdjustment>>({ 
    type: 'مكافأة', 
    amount: 0, 
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      const emp = employees.find(e => e.id === adj.employeeId);
      const matchesSearch = (emp?.name.toLowerCase().includes(searchTerm.toLowerCase())) || (adj.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'الكل' || adj.type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [adjustments, searchTerm, filterType, employees]);

  const handleExportExcel = () => {
    const data = filteredAdjustments.map(adj => {
      const emp = employees.find(e => e.id === adj.employeeId);
      return {
        'الموظف': emp?.name || '---',
        'القسم': emp?.department || '---',
        'نوع العملية': adj.type,
        'المبلغ (ر.س)': adj.amount,
        'التفاصيل والسبب': adj.reason,
        'تاريخ الاستحقاق': adj.date,
        'رقم الهوية': emp?.idNumber || '---'
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial_Adjustments");
    XLSX.writeFile(workbook, `Fin_Adjustments_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddAdj = (e: React.FormEvent) => {
    e.preventDefault();
    const adj: FinancialAdjustment = {
      ...newAdj as FinancialAdjustment,
      id: Date.now().toString(),
      date: newAdj.date || new Date().toISOString().split('T')[0],
    };
    setAdjustments([adj, ...adjustments]);
    setIsModalOpen(false);
    setNewAdj({ type: 'مكافأة', amount: 0, reason: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8 pb-12 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">السجلات والمؤثرات المالية</h2>
          <p className="text-sm text-slate-500 font-medium">إدارة المكافآت، السلف، والخصومات اليدوية.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <span>📊</span> تصدير السجلات (Excel)
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-[2] md:flex-none bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-black text-sm shadow-xl active-scale transition flex items-center justify-center gap-2"
          >
            <span>➕</span> إضافة مؤثر مالي
          </button>
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
           <input 
            type="text" 
            placeholder="ابحث باسم الموظف أو التفاصيل..." 
            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-sm font-bold outline-none" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <select className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="الكل">كل العمليات</option>
          <option value="مكافأة">مكافأة 🟢</option>
          <option value="خصم">خصم 🔴</option>
          <option value="سلفة">سلفة 🔵</option>
        </select>
      </div>
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 text-center">النوع</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 text-center">المبلغ</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400">السبب</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 text-center">التاريخ</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdjustments.map((adj) => {
                const emp = employees.find(e => e.id === adj.employeeId);
                const isBonus = ['مكافأة', 'بدل سكن', 'بدل نقل'].includes(adj.type);
                return (
                  <tr key={adj.id} className="hover:bg-slate-50 transition group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <img src={emp?.avatar} className="w-9 h-9 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-slate-800 text-sm">{emp?.name || '---'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{emp?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                        isBonus ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {adj.type}
                      </span>
                    </td>
                    <td className={`px-6 py-6 text-center font-black text-sm ${isBonus ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isBonus ? '+' : '-'}{adj.amount.toLocaleString()} ر.س
                    </td>
                    <td className="px-6 py-6 text-xs text-slate-700 font-bold">{adj.reason}</td>
                    <td className="px-6 py-6 text-center text-[11px] text-slate-600 font-mono font-black">{adj.date}</td>
                    <td className="px-8 py-6 text-center">
                      <button className="w-8 h-8 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in zoom-in-200">
            <h3 className="text-2xl font-black text-slate-800 mb-8">إضافة مؤثر مالي جديد</h3>
            <form onSubmit={handleAddAdj} className="space-y-6">
              <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" onChange={(e) => setNewAdj({...newAdj, employeeId: e.target.value})} required>
                <option value="">اختر الموظف...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={newAdj.type} onChange={(e) => setNewAdj({...newAdj, type: e.target.value as any})}>
                  <option value="مكافأة">مكافأة 🟢</option>
                  <option value="خصم">خصم 🔴</option>
                  <option value="سلفة">سلفة 🔵</option>
                </select>
                <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" placeholder="المبلغ" onChange={(e) => setNewAdj({...newAdj, amount: Number(e.target.value)})} required />
              </div>
              <input type="date" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={newAdj.date} onChange={(e) => setNewAdj({...newAdj, date: e.target.value})} required />
              <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" rows={3} placeholder="السبب..." onChange={(e) => setNewAdj({...newAdj, reason: e.target.value})} required></textarea>
              <div className="flex gap-4">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl">حفظ العملية</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
