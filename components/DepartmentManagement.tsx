
import React, { useState, useMemo } from 'react';
import { SystemSettings, Employee, EmployeeStatus } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface DeptProps {
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
  employees: Employee[];
}

const DepartmentManagement: React.FC<DeptProps> = ({ settings, setSettings, employees }) => {
  const [newDeptName, setNewDeptName] = useState('');
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || settings.departments.includes(newDeptName)) return;
    setSettings({
      ...settings,
      departments: [...settings.departments, newDeptName.trim()]
    });
    setNewDeptName('');
  };

  const triggerDeleteDept = (deptName: string) => {
    const count = employees.filter(emp => emp.department === deptName).length;
    if (count > 0) {
      alert(`عذراً، لا يمكن حذف قسم "${deptName}" لوجود ${count} موظفين مرتبطين به حالياً.`);
      return;
    }
    setConfirmState({ isOpen: true, id: deptName });
  };

  const handleConfirmedDelete = () => {
    if (confirmState.id) {
      setSettings({
        ...settings,
        departments: settings.departments.filter(d => d !== confirmState.id)
      });
    }
    setConfirmState({ isOpen: false, id: null });
  };

  const totalOrgBudget = useMemo(() => employees.reduce((acc, curr) => acc + curr.salary, 0), [employees]);

  const deptStats = useMemo(() => {
    return settings.departments.map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      const totalSalary = deptEmps.reduce((acc, curr) => acc + curr.salary, 0);
      const activeCount = deptEmps.filter(e => e.status === EmployeeStatus.ACTIVE).length;
      
      return {
        name: dept,
        employeeCount: deptEmps.length,
        totalBudget: totalSalary,
        avgSalary: deptEmps.length > 0 ? totalSalary / deptEmps.length : 0,
        activeRate: deptEmps.length > 0 ? (activeCount / deptEmps.length) * 100 : 0,
        budgetShare: totalOrgBudget > 0 ? (totalSalary / totalOrgBudget) * 100 : 0
      };
    });
  }, [settings.departments, employees, totalOrgBudget]);

  const orgSummary = useMemo(() => {
    if (deptStats.length === 0) return null;
    const largestDept = [...deptStats].sort((a, b) => b.employeeCount - a.employeeCount)[0];
    return {
      avgOrgSalary: employees.length > 0 ? totalOrgBudget / employees.length : 0,
      totalDepts: settings.departments.length,
      largestDept: largestDept?.employeeCount > 0 ? largestDept.name : '---'
    };
  }, [deptStats, employees, totalOrgBudget, settings.departments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title="حذف القسم الإداري"
        message="هل أنت متأكد من رغبتك في إزالة هذا القسم؟ لن يؤثر هذا على السجلات التاريخية."
        confirmLabel="نعم، حذف القسم"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">🏢</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الأقسام الإدارية</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">تحليل توزيع القوى العاملة والتكاليف التشغيلية لكل قطاع.</p>
        </div>
        
        <form onSubmit={handleAddDept} className="flex gap-2 w-full md:w-auto">
          <input 
            placeholder="اسم القسم الجديد..." 
            className="flex-1 md:w-64 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm" 
            value={newDeptName} 
            onChange={e => setNewDeptName(e.target.value)}
            required
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95 whitespace-nowrap">إضافة قسم</button>
        </form>
      </header>

      {orgSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">📈</div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase">متوسط الرواتب العام</p>
                 <p className="text-lg font-black text-slate-800">{Math.round(orgSummary.avgOrgSalary).toLocaleString()} ر.س</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">👥</div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase">القسم الأكبر عددياً</p>
                 <p className="text-lg font-black text-slate-800">{orgSummary.largestDept}</p>
              </div>
           </div>
           <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">📊</div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي ميزانية الرواتب</p>
                 <p className="text-lg font-black">{totalOrgBudget.toLocaleString()} ر.س</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deptStats.map((dept, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">📂</div>
                <button 
                  onClick={() => triggerDeleteDept(dept.name)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                  title="حذف القسم"
                >
                  ✕
                </button>
             </div>
             
             <div className="mb-6">
               <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{dept.name}</h3>
               <div className="flex items-center gap-2">
                 <span className={`w-1.5 h-1.5 rounded-full ${dept.activeRate > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">نسبة النشاط: {Math.round(dept.activeRate)}%</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">العدد الحالي</p>
                   <p className="text-sm font-black text-slate-700">{dept.employeeCount} موظف</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الميزانية الشهرية</p>
                   <p className="text-sm font-black text-blue-600">{dept.totalBudget.toLocaleString()} ر.س</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">متوسط الراتب</p>
                   <p className="text-xs font-bold text-slate-500">{Math.round(dept.avgSalary).toLocaleString()} ر.س</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الحصة المالية</p>
                   <p className="text-xs font-bold text-slate-500">{dept.budgetShare.toFixed(1)}% من الإجمالي</p>
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-slate-50 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-slate-400">
                   <span>توزيع التكلفة</span>
                   <span>{dept.budgetShare.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${dept.budgetShare}%` }}
                   ></div>
                </div>
             </div>

             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      {settings.departments.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
           <span className="text-6xl mb-6 block opacity-20">🏢</span>
           <h4 className="text-lg font-black text-slate-300">لا توجد أقسام مسجلة</h4>
           <p className="text-xs text-slate-400 mt-2 font-bold italic">ابدأ بإضافة أول قسم لبناء هيكلك الإداري.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
