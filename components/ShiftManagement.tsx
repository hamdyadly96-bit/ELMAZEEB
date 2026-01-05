
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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    name: '',
    department: settings.departments[0],
    startTime: '08:00',
    endTime: '16:00'
  });

  // Bulk State
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkTargetShiftId, setBulkTargetShiftId] = useState('');
  const [bulkSearchTerm, setBulkSearchTerm] = useState('');
  const [bulkDeptFilter, setBulkDeptFilter] = useState('الكل');

  const calculateHours = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH + endM / 60) - (startH + startM / 60);
    if (diff < 0) diff += 24; 
    return parseFloat(diff.toFixed(2));
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const workHours = calculateHours(newShift.startTime!, newShift.endTime!);
    const shift: Shift = {
      ...newShift as Shift,
      id: Date.now().toString(),
      workHours
    };
    setShifts([...shifts, shift]);
    setIsModalOpen(false);
    setNewShift({ name: '', department: settings.departments[0], startTime: '08:00', endTime: '16:00' });
  };

  const handleBulkAssign = () => {
    if (bulkSelectedIds.length === 0 || !bulkTargetShiftId) return;
    
    const updatedEmployees = employees.map(emp => {
      if (bulkSelectedIds.includes(emp.id)) {
        return { ...emp, shiftId: bulkTargetShiftId };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    setIsBulkModalOpen(false);
    setBulkSelectedIds([]);
    setBulkTargetShiftId('');
    alert(`تم تعيين الوردية لـ ${bulkSelectedIds.length} موظف بنجاح ✨`);
  };

  const triggerDeleteShift = (id: string) => {
    const assignedCount = employees.filter(emp => emp.shiftId === id).length;
    if (assignedCount > 0) {
      alert(`لا يمكن حذف هذه الوردية لوجود ${assignedCount} موظفاً مرتبطين بها.`);
      return;
    }
    setConfirmState({ isOpen: true, id });
  };

  const handleConfirmedDelete = () => {
    if (confirmState.id) {
      setShifts(shifts.filter(s => s.id !== confirmState.id));
    }
    setConfirmState({ isOpen: false, id: null });
  };

  const getShiftCompliance = (hours: number) => {
    if (hours <= 8) return { label: 'مناسب للجميع', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✅' };
    if (hours <= 11) return { label: 'للأجانب فقط (قانوني)', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: '🌍' };
    return { label: 'مخالف لنظام العمل', color: 'bg-red-50 text-red-700 border-red-100', icon: '⚠️' };
  };

  const filteredBulkEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(bulkSearchTerm.toLowerCase());
      const matchesDept = bulkDeptFilter === 'الكل' || emp.department === bulkDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, bulkSearchTerm, bulkDeptFilter]);

  const toggleBulkSelect = (id: string) => {
    setBulkSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title="حذف وردية العمل"
        message="هل أنت متأكد من رغبتك في إزالة هذه الوردية؟ سيؤدي هذا لإزالتها من سجلات التخطيط، لكن لن يتأثر الموظفون السابقون المرتبطون بها في سجلات الحضور."
        confirmLabel="نعم، حذف الوردية"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">مركز تنظيم الورديات</h2>
          <p className="text-sm text-slate-500 font-medium">إدارة فترات العمل مع مراعاة قوانين العمل وتخصيص الموارد.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-6 py-3 bg-white text-blue-600 border border-blue-100 rounded-2xl font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2 active-scale"
          >
            <span>👥</span>
            <span>تعيين جماعي</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active-scale"
          >
            <span>➕</span>
            <span>إنشاء وردية عمل</span>
          </button>
        </div>
      </header>

      {/* لوحة مراقبة القوانين */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🇸🇦</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المواطنون</p>
              <p className="text-lg font-black text-slate-800">8 ساعات قياسية</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الوافدون</p>
              <p className="text-lg font-black text-slate-800">حتى 11 ساعة</p>
           </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-5">
           <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center text-2xl">🕒</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الحالة التشغيلية</p>
              <p className="text-lg font-black">{shifts.length} وردية فعالة</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settings.departments.map(dept => {
          const deptShifts = shifts.filter(s => s.department === dept);
          return (
            <div key={dept} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  {dept}
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 uppercase">
                  {deptShifts.length} ورديات
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                {deptShifts.length > 0 ? deptShifts.map(s => {
                  const assignedEmployees = employees.filter(emp => emp.shiftId === s.id);
                  const compliance = getShiftCompliance(s.workHours);
                  
                  return (
                    <div key={s.id} className="group bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-50">🕒</div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{s.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold font-mono">{s.startTime} - {s.endTime}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => triggerDeleteShift(s.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black border flex items-center gap-1.5 ${compliance.color}`}>
                           <span>{compliance.icon}</span>
                           <span>{compliance.label}</span>
                         </span>
                         <span className="px-3 py-1 rounded-lg text-[9px] font-black border bg-white text-slate-500 border-slate-100">
                           ⏳ {s.workHours} ساعة
                         </span>
                      </div>

                      {assignedEmployees.length > 0 && (
                        <div className="pt-4 border-t border-slate-100/50">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">الموظفون المخصصون ({assignedEmployees.length})</p>
                           <div className="flex flex-wrap gap-2">
                             {assignedEmployees.map(emp => (
                               <div key={emp.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                 <img src={emp.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                                 <span className="text-[9px] font-bold text-slate-600">{emp.name.split(' ')[0]}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <div className="text-4xl mb-4">🌑</div>
                    <p className="text-xs font-bold text-slate-500 italic">لا توجد ورديات نشطة لهذا القسم.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Assign Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
            <header className="mb-8">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-2xl font-black text-slate-800">التعيين الجماعي للورديات</h3>
                 <button onClick={() => setIsBulkModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-red-500 transition">✕</button>
              </div>
              <p className="text-sm text-slate-500 font-bold">حدد الموظفين والوردية المطلوبة لتطبيق التغييرات دفعة واحدة.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
               <div className="lg:col-span-8 flex flex-col overflow-hidden">
                  <div className="flex gap-3 mb-4">
                     <div className="relative flex-1">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                        <input 
                           type="text" 
                           placeholder="بحث بالاسم..." 
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                           value={bulkSearchTerm}
                           onChange={e => setBulkSearchTerm(e.target.value)}
                        />
                     </div>
                     <select 
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black outline-none"
                        value={bulkDeptFilter}
                        onChange={e => setBulkDeptFilter(e.target.value)}
                     >
                        <option value="الكل">كل الأقسام</option>
                        {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {filteredBulkEmployees.map(emp => (
                        <label 
                           key={emp.id} 
                           className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              bulkSelectedIds.includes(emp.id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-50 hover:bg-slate-50'
                           }`}
                        >
                           <div className="flex items-center gap-4">
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                                 checked={bulkSelectedIds.includes(emp.id)}
                                 onChange={() => toggleBulkSelect(emp.id)}
                              />
                              <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                              <div>
                                 <p className="text-xs font-black text-slate-800">{emp.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">{emp.department} • {emp.role}</p>
                              </div>
                           </div>
                           <div className="text-left">
                              <span className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                 {shifts.find(s => s.id === emp.shiftId)?.name || 'بدون وردية'}
                              </span>
                           </div>
                        </label>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-4 bg-slate-50 rounded-[2rem] p-6 flex flex-col">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">إعدادات الوردية الجديدة</h4>
                  
                  <div className="space-y-6 flex-1">
                     <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 mr-2">اختيار الوردية المستهدفة</label>
                        <select 
                           className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                           value={bulkTargetShiftId}
                           onChange={e => setBulkTargetShiftId(e.target.value)}
                        >
                           <option value="">-- اختر الوردية --</option>
                           {shifts.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                           ))}
                        </select>
                     </div>

                     <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black">
                           <span className="text-slate-400 uppercase">الموظفون المختارون</span>
                           <span className="text-blue-600">{bulkSelectedIds.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black">
                           <span className="text-slate-400 uppercase">الوردية الجديدة</span>
                           <span className="text-emerald-600">
                              {shifts.find(s => s.id === bulkTargetShiftId)?.name || 'لم تحدد'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={handleBulkAssign}
                     disabled={bulkSelectedIds.length === 0 || !bulkTargetShiftId}
                     className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-30 disabled:grayscale"
                  >
                     تطبيق التغييرات الجماعية ✨
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-8">إضافة وردية عمل جديدة</h3>
            <form onSubmit={handleAddShift} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اسم الوردية</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" 
                  placeholder="مثال: وردية الصباح الأساسية"
                  value={newShift.name}
                  onChange={e => setNewShift({...newShift, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">القسم المسؤول</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.25rem] p-4 text-sm font-bold outline-none transition"
                  value={newShift.department}
                  onChange={e => setNewShift({...newShift, department: e.target.value})}
                >
                  {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">وقت البدء</label>
                  <input type="time" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.25rem] p-4 text-sm font-bold outline-none" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">وقت الانتهاء</label>
                  <input type="time" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.25rem] p-4 text-sm font-bold outline-none" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                </div>
              </div>

              {newShift.startTime && newShift.endTime && (
                <div className={`p-4 rounded-2xl border text-center font-black text-xs ${getShiftCompliance(calculateHours(newShift.startTime, newShift.endTime)).color}`}>
                   إجمالي الساعات المحتسبة: {calculateHours(newShift.startTime, newShift.endTime)} ساعة
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95">حفظ الوردية</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black hover:bg-slate-200 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
