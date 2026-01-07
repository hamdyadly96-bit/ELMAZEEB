
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, AttendanceEntry, AttendanceStatus, Shift } from '../types';

interface AttendanceProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
  shifts: Shift[];
}

const Attendance: React.FC<AttendanceProps> = ({ employees, attendance, setAttendance, shifts }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('الكل');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const getEntry = (id: string, date: string) => attendance.find(r => r.employeeId === id && r.date === date);

  const attendanceStats = useMemo(() => {
    const todayRecords = attendance.filter(r => r.date === selectedDate);
    return {
      present: todayRecords.filter(r => r.status === 'حاضر').length,
      late: todayRecords.filter(r => r.status === 'تأخير').length,
      absent: employees.length - todayRecords.length
    };
  }, [attendance, employees, selectedDate]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const entry = getEntry(emp.id, selectedDate);
      if (filterStatus === 'الكل') return true;
      if (filterStatus === 'غائب') return !entry;
      return entry?.status === filterStatus;
    });
  }, [employees, attendance, selectedDate, filterStatus]);

  const handleStatusUpdate = (empIds: string[], status: AttendanceStatus) => {
    let newRecords = [...attendance];
    
    empIds.forEach(empId => {
      const existingIdx = newRecords.findIndex(r => r.employeeId === empId && r.date === selectedDate);
      if (existingIdx > -1) {
        newRecords[existingIdx] = { ...newRecords[existingIdx], status, source: 'manual' };
      } else {
        newRecords.push({ 
          employeeId: empId, 
          date: selectedDate, 
          status, 
          clockIn: status === 'حاضر' ? '08:00' : undefined, 
          clockOut: status === 'حاضر' ? '16:00' : undefined, 
          source: 'manual' 
        });
      }
    });

    setAttendance(newRecords);
    if (empIds.length > 1) setSelectedEmployeeIds([]); // Clear selection after bulk update
  };

  const toggleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500 relative">
      {/* هيدر وإحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black opacity-50 uppercase mb-1">تاريخ العرض</p>
          <input 
            type="date" 
            className="bg-transparent border-0 text-lg font-black outline-none w-full" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
          />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>
        <StatTile label="حاضر الآن" count={attendanceStats.present} icon="✅" color="emerald" />
        <StatTile label="حالات التأخير" count={attendanceStats.late} icon="⏱️" color="amber" />
        <StatTile label="غياب اليوم" count={attendanceStats.absent} icon="✕" color="rose" />
      </div>

      {/* شريط الإجراءات الجماعية الفلوتنج */}
      {selectedEmployeeIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10 duration-300 border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">تعديل جماعي</span>
            <span className="text-sm font-black whitespace-nowrap">تم اختيار {selectedEmployeeIds.length} موظف</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleStatusUpdate(selectedEmployeeIds, 'حاضر')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition-all active-scale"
            >حاضر ✓</button>
            <button 
              onClick={() => handleStatusUpdate(selectedEmployeeIds, 'تأخير')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-black transition-all active-scale"
            >تأخير ⏱</button>
            <button 
              onClick={() => handleStatusUpdate(selectedEmployeeIds, 'غائب')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black transition-all active-scale"
            >غائب ✕</button>
          </div>
          <button onClick={() => setSelectedEmployeeIds([])} className="text-white/40 hover:text-white transition-colors p-2">
            <span className="text-xl">✕</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>عرض اليوم</button>
              <button onClick={() => setViewMode('monthly')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>التحليل الشهري</button>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية العرض:</span>
             <select 
              className="bg-slate-50 border-0 rounded-xl px-4 py-2 text-xs font-black outline-none min-w-[120px]"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
             >
               <option value="الكل">كل الحالات</option>
               <option value="حاضر">حاضر</option>
               <option value="تأخير">تأخير</option>
               <option value="غائب">غائب</option>
             </select>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500" 
                    checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">وقت الحضور</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">وقت الانصراف</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map(emp => {
                const entry = getEntry(emp.id, selectedDate);
                const isSelected = selectedEmployeeIds.includes(emp.id);
                return (
                  <tr key={emp.id} className={`transition-colors group ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-8 py-6 text-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        checked={isSelected}
                        onChange={() => toggleSelectEmployee(emp.id)}
                      />
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                          {entry?.status === 'حاضر' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <span className="font-mono font-black text-slate-600 bg-white border border-slate-100 px-3 py-1.5 rounded-lg text-xs shadow-sm">
                         {entry?.clockIn || '--:--'}
                       </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <span className="font-mono font-black text-slate-600 bg-white border border-slate-100 px-3 py-1.5 rounded-lg text-xs shadow-sm">
                         {entry?.clockOut || '--:--'}
                       </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                         entry?.status === 'حاضر' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         entry?.status === 'تأخير' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         entry?.status === 'غائب' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                         {entry?.status || 'لم يسجل'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStatusUpdate([emp.id], 'حاضر')} className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition flex items-center justify-center text-xs shadow-sm" title="حاضر">✓</button>
                          <button onClick={() => handleStatusUpdate([emp.id], 'تأخير')} className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition flex items-center justify-center text-xs shadow-sm" title="تأخير">⏱</button>
                          <button onClick={() => handleStatusUpdate([emp.id], 'غائب')} className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition flex items-center justify-center text-xs shadow-sm" title="غائب">✕</button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold italic">
               لا يوجد موظفون يطابقون معايير العرض المحددة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ label, count, icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50'
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} flex items-center justify-between shadow-sm hover:shadow-lg transition-all`}>
       <div>
          <p className="text-[10px] font-black uppercase opacity-60 mb-1">{label}</p>
          <p className="text-2xl font-black">{count}</p>
       </div>
       <span className="text-3xl">{icon}</span>
    </div>
  );
};

export default Attendance;
