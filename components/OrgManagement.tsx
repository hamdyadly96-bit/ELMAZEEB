
import React, { useState, useMemo } from 'react';
import { Branch, SystemSettings, Employee } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface OrgProps {
  branches: Branch[];
  setBranches: (b: Branch[]) => void;
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
  employees: Employee[];
}

const OrgManagement: React.FC<OrgProps> = ({ branches, setBranches, settings, setSettings, employees }) => {
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });
  const [newDeptName, setNewDeptName] = useState('');
  
  const [confirmState, setConfirmState] = useState<{ 
    isOpen: boolean; 
    type: 'branch' | 'department' | null; 
    id: string | null 
  }>({
    isOpen: false,
    type: null,
    id: null
  });

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;
    setBranches([...branches, { ...newBranch, id: Date.now().toString() }]);
    setNewBranch({ name: '', location: '' });
  };

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
      alert(`لا يمكن حذف قسم "${deptName}" لوجود ${count} موظفين تابعين له. يرجى نقلهم أولاً.`);
      return;
    }
    setConfirmState({ isOpen: true, type: 'department', id: deptName });
  };

  const triggerDeleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    const count = employees.filter(emp => emp.branch === branch?.name).length;
    if (count > 0) {
      alert(`لا يمكن حذف فرع "${branch?.name}" لوجود ${count} موظفين تابعين له.`);
      return;
    }
    setConfirmState({ isOpen: true, type: 'branch', id: branchId });
  };

  const handleConfirmedDelete = () => {
    if (confirmState.type === 'department' && confirmState.id) {
      setSettings({
        ...settings,
        departments: settings.departments.filter(d => d !== confirmState.id)
      });
    } else if (confirmState.type === 'branch' && confirmState.id) {
      setBranches(branches.filter(b => b.id !== confirmState.id));
    }
    setConfirmState({ isOpen: false, type: null, id: null });
  };

  // إحصائيات سريعة
  const orgStats = useMemo(() => {
    return {
      totalBranches: branches.length,
      totalDepts: settings.departments.length,
      avgEmpPerDept: settings.departments.length > 0 ? (employees.length / settings.departments.length).toFixed(1) : 0
    };
  }, [branches, settings.departments, employees]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-2 md:px-0">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'branch' ? 'حذف الفرع' : 'حذف القسم الإداري'}
        message="هل أنت متأكد؟ سيؤدي هذا الإجراء لإزالة السجل نهائياً من الهيكل التنظيمي للمنشأة."
        confirmLabel="تأكيد الحذف"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setConfirmState({ isOpen: false, type: null, id: null })}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-xl">🏢</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الكيان التنظيمي</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">تحكم في فروع المنشأة وتوزيع الأقسام الإدارية والتشغيلية.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">الفروع</p>
              <p className="text-lg font-black text-blue-600">{orgStats.totalBranches}</p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">الأقسام</p>
              <p className="text-lg font-black text-emerald-600">{orgStats.totalDepts}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* قسم إدارة الفروع */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              فروع المؤسسة
            </h3>
          </div>

          <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {branches.map(b => {
                const branchEmps = employees.filter(e => e.branch === b.name).length;
                return (
                  <div key={b.id} className="group flex justify-between items-center p-5 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100 rounded-[1.75rem] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">📍</div>
                      <div>
                        <p className="font-black text-sm text-slate-800">{b.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">
                          {branchEmps} موظف
                        </span>
                      </div>
                      <button 
                        onClick={() => triggerDeleteBranch(b.id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition transform active:scale-90"
                        title="حذف الفرع"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddBranch} className="p-6 mt-2 bg-blue-50/30 rounded-[2rem] border-t border-blue-50 space-y-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 px-2">إضافة فرع جديد</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  placeholder="اسم الفرع (مثال: فرع الخبر)" 
                  className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm font-bold outline-none shadow-sm transition" 
                  value={newBranch.name} 
                  onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                  required
                />
                <input 
                  placeholder="المدينة" 
                  className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl p-3.5 text-sm font-bold outline-none shadow-sm transition" 
                  value={newBranch.location} 
                  onChange={e => setNewBranch({...newBranch, location: e.target.value})}
                  required
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95 flex items-center justify-center gap-2">
                <span>➕</span> تسجيل الفرع في النظام
              </button>
            </form>
          </div>
        </section>

        {/* قسم إدارة الأقسام */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
              الأقسام الإدارية
            </h3>
          </div>

          <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-3">
              {settings.departments.map(d => {
                const deptEmps = employees.filter(e => e.department === d).length;
                return (
                  <div key={d} className="group relative flex items-center justify-between p-4 bg-emerald-50/30 hover:bg-white hover:shadow-md border border-emerald-50 hover:border-emerald-200 rounded-2xl transition-all">
                    <div>
                      <span className="text-[11px] font-black text-emerald-800 block mb-1">{d}</span>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase">{deptEmps} كادر وظيفي</span>
                    </div>
                    <button 
                      onClick={() => triggerDeleteDept(d)}
                      className="w-7 h-7 flex items-center justify-center bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm border border-red-50 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddDept} className="p-6 mt-2 bg-emerald-50/30 rounded-[2rem] border-t border-emerald-50 space-y-4">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-2">استحداث قسم جديد</p>
              <div className="flex gap-2">
                <input 
                  placeholder="اسم القسم (مثال: الجودة)" 
                  className="flex-1 bg-white border-2 border-transparent focus:border-emerald-500 rounded-xl p-3.5 text-sm font-bold outline-none shadow-sm transition" 
                  value={newDeptName} 
                  onChange={e => setNewDeptName(e.target.value)}
                  required
                />
                <button className="bg-emerald-600 text-white px-6 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition transform active:scale-95">إضافة</button>
              </div>
              <div className="p-4 bg-white/60 rounded-xl border border-emerald-100/50">
                <p className="text-[9px] text-emerald-700 leading-relaxed font-bold">
                  ℹ️ ملاحظة: الأقسام التي يتم إضافتها ستكون متاحة فوراً كخيارات عند تسجيل الموظفين الجدد أو نقل الموظفين الحاليين.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrgManagement;
