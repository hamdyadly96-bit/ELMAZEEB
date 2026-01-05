
import React, { useState, useMemo } from 'react';
import { Employee, AttendanceEntry, AttendanceStatus, Shift, EmployeeStatus } from '../types';

interface AttendanceProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
  shifts: Shift[];
}

const Attendance: React.FC<AttendanceProps> = ({ employees, attendance, setAttendance, shifts }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [monthlyViewType, setMonthlyViewType] = useState<'individual' | 'team'>('team');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>(employees[0]?.id || '');
  
  const [filterEmployeeStatus, setFilterEmployeeStatus] = useState<string>('الكل');
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState<string>('الكل');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addRecordData, setAddRecordData] = useState({
    employeeId: employees[0]?.id || '',
    status: 'حاضر' as AttendanceStatus,
    clockIn: '08:00',
    clockOut: '16:00'
  });

  const getEntryForEmployee = (employeeId: string, date: string): AttendanceEntry | undefined => {
    return attendance.find(record => record.employeeId === employeeId && record.date === date);
  };

  const calculateHours = (inStr?: string, outStr?: string): number => {
    if (!inStr || !outStr) return 0;
    const [inH, inM] = inStr.split(':').map(Number);
    const [outH, outM] = outStr.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff < 0) diff += 24; 
    return parseFloat(diff.toFixed(2));
  };

  const fetchCurrentLocation = (): Promise<{ lat: number; lng: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000 }
      );
    });
  };

  const handleAttendanceChange = async (employeeId: string, type: 'clockIn' | 'clockOut', value: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const existingIndex = attendance.findIndex(r => r.employeeId === employeeId && r.date === selectedDate);
    const newRecords = [...attendance];
    
    let entry: AttendanceEntry;
    if (existingIndex > -1) {
      entry = { ...newRecords[existingIndex], [type]: value };
    } else {
      entry = { employeeId, date: selectedDate, status: 'حاضر', [type]: value };
    }

    if (type === 'clockIn' && value) {
      const shift = shifts.find(s => s.id === emp.shiftId) || shifts.find(s => s.department === emp.department);
      if (shift) {
        const [clockH, clockM] = value.split(':').map(Number);
        const [shiftH, shiftM] = shift.startTime.split(':').map(Number);
        const clockTotal = clockH * 60 + clockM;
        const shiftTotal = shiftH * 60 + shiftM;
        entry.status = clockTotal > shiftTotal + 15 ? 'تأخير' : 'حاضر';
      }
      // Capture location for clock-in event
      if (!entry.location) {
        const loc = await fetchCurrentLocation();
        if (loc) entry.location = loc;
      }
    } else if (type === 'clockIn' && !value && !entry.clockOut) {
      entry.status = 'غائب';
    }

    if (existingIndex > -1) {
      newRecords[existingIndex] = entry;
    } else {
      newRecords.push(entry);
    }

    setAttendance(newRecords);
  };

  const handleStatusChangeManual = async (employeeId: string, status: AttendanceStatus) => {
    const existingIndex = attendance.findIndex(r => r.employeeId === employeeId && r.date === selectedDate);
    const newRecords = [...attendance];
    
    let loc: { lat: number; lng: number } | undefined = undefined;
    if (status === 'حاضر' || status === 'تأخير') {
      loc = await fetchCurrentLocation();
    }

    if (existingIndex > -1) {
      newRecords[existingIndex] = { ...newRecords[existingIndex], status, location: loc || newRecords[existingIndex].location };
    } else {
      newRecords.push({ employeeId, date: selectedDate, status, location: loc });
    }
    setAttendance(newRecords);
  };

  const handleEditClick = (employeeId: string) => {
    const entry = getEntryForEmployee(employeeId, selectedDate);
    setAddRecordData({
      employeeId: employeeId,
      status: entry?.status || 'حاضر',
      clockIn: entry?.clockIn || '08:00',
      clockOut: entry?.clockOut || '16:00'
    });
    setIsAddModalOpen(true);
  };

  const handleBulkStatusChange = async (status: AttendanceStatus) => {
    if (selectedEmployeeIds.length === 0) return;
    
    let loc: { lat: number; lng: number } | undefined = undefined;
    if (status === 'حاضر' || status === 'تأخير') {
      loc = await fetchCurrentLocation();
    }

    const newRecords = [...attendance];
    selectedEmployeeIds.forEach(empId => {
      const existingIndex = newRecords.findIndex(r => r.employeeId === empId && r.date === selectedDate);
      if (existingIndex > -1) {
        newRecords[existingIndex] = { ...newRecords[existingIndex], status, location: loc || newRecords[existingIndex].location };
      } else {
        newRecords.push({ employeeId: empId, date: selectedDate, status, location: loc });
      }
    });
    setAttendance(newRecords);
    setSelectedEmployeeIds([]);
  };

  const handleAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = attendance.findIndex(r => r.employeeId === addRecordData.employeeId && r.date === selectedDate);
    const newRecords = [...attendance];
    
    let loc: { lat: number; lng: number } | undefined = undefined;
    if (addRecordData.status === 'حاضر' || addRecordData.status === 'تأخير') {
      loc = await fetchCurrentLocation();
    }

    const newEntry: AttendanceEntry = {
      employeeId: addRecordData.employeeId,
      date: selectedDate,
      status: addRecordData.status,
      clockIn: addRecordData.clockIn,
      clockOut: addRecordData.clockOut,
      location: loc
    };
    if (existingIndex > -1) newRecords[existingIndex] = newEntry;
    else newRecords.push(newEntry);
    setAttendance(newRecords);
    setIsAddModalOpen(false);
  };

  const toggleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) setSelectedEmployeeIds([]);
    else setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
  };

  const toggleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const entry = getEntryForEmployee(emp.id, selectedDate);
      const matchesEmpStatus = filterEmployeeStatus === 'الكل' || emp.status === filterEmployeeStatus;
      let matchesAttendanceStatus = true;
      if (filterAttendanceStatus !== 'الكل') {
        if (filterAttendanceStatus === 'لم يسجل') matchesAttendanceStatus = !entry;
        else matchesAttendanceStatus = entry?.status === filterAttendanceStatus;
      }
      return matchesEmpStatus && matchesAttendanceStatus;
    });
  }, [employees, attendance, selectedDate, filterEmployeeStatus, filterAttendanceStatus]);

  const filteredStats = useMemo(() => {
    const records = filteredEmployees.map(emp => getEntryForEmployee(emp.id, selectedDate));
    return {
      total: filteredEmployees.length,
      present: records.filter(r => r?.status === 'حاضر').length,
      late: records.filter(r => r?.status === 'تأخير').length,
      absent: records.filter(r => r?.status === 'غائب').length,
      unrecorded: records.filter(r => !r).length
    };
  }, [filteredEmployees, attendance, selectedDate]);

  const calendarData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  }, [selectedMonth]);

  const monthlyStats = useMemo(() => {
    const records = attendance.filter(r => r.employeeId === targetEmployeeId && r.date.startsWith(selectedMonth));
    const totalHours = records.reduce((sum, r) => sum + calculateHours(r.clockIn, r.clockOut), 0);
    return {
      present: records.filter(r => r.status === 'حاضر').length,
      late: records.filter(r => r.status === 'تأخير').length,
      absent: records.filter(r => r.status === 'غائب').length,
      totalHours: parseFloat(totalHours.toFixed(1))
    };
  }, [attendance, targetEmployeeId, selectedMonth]);

  const teamMonthlyAnalysis = useMemo(() => {
    return employees.map(emp => {
      const records = attendance.filter(r => r.employeeId === emp.id && r.date.startsWith(selectedMonth));
      const actualHours = records.reduce((sum, r) => sum + calculateHours(r.clockIn, r.clockOut), 0);
      const shift = shifts.find(s => s.id === emp.shiftId) || shifts.find(s => s.department === emp.department);
      const expectedDailyHours = shift?.workHours || 8;
      const expectedTotalHours = records.length * expectedDailyHours;
      const variance = actualHours - expectedTotalHours;
      
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar,
        daysCount: records.length,
        actualHours,
        expectedTotalHours,
        variance,
        efficiency: expectedTotalHours > 0 ? (actualHours / expectedTotalHours) * 100 : 0
      };
    }).sort((a, b) => b.actualHours - a.actualHours);
  }, [employees, attendance, selectedMonth, shifts]);

  const totalTeamHours = useMemo(() => teamMonthlyAnalysis.reduce((sum, a) => sum + a.actualHours, 0), [teamMonthlyAnalysis]);

  const exportToCSV = () => {
    let csvContent = "\uFEFF"; 
    if (viewMode === 'daily') {
      csvContent += "اسم الموظف,القسم,الوردية,وقت الحضور,وقت الانصراف,ساعات العمل,الحالة,الإحداثيات\n";
      filteredEmployees.forEach(emp => {
        const entry = getEntryForEmployee(emp.id, selectedDate);
        const shift = shifts.find(s => s.id === emp.shiftId) || shifts.find(s => s.department === emp.department);
        const hours = calculateHours(entry?.clockIn, entry?.clockOut);
        const loc = entry?.location ? `${entry.location.lat};${entry.location.lng}` : 'N/A';
        csvContent += `${emp.name},${emp.department},${shift?.name || 'بدون وردية'},${entry?.clockIn || '--:--'},${entry?.clockOut || '--:--'},${hours},${entry?.status || 'لم يُسجل'},${loc}\n`;
      });
    } else {
      csvContent += "اسم الموظف,ساعات العمل الفعلية,الساعات المستهدفة,الفارق,الإنتاجية\n";
      teamMonthlyAnalysis.forEach(a => {
        csvContent += `${a.name},${a.actualHours},${a.expectedTotalHours},${a.variance},${a.efficiency.toFixed(1)}%\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تحليل_الحضور_${viewMode === 'daily' ? selectedDate : selectedMonth}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">الحضور والغياب والإنتاجية</h2>
          <p className="text-sm text-slate-500 font-medium">نظام ذكي لتحليل ساعات الدوام ومقارنتها بالورديات المخططة.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => {
              setAddRecordData({
                employeeId: employees[0]?.id || '',
                status: 'حاضر',
                clockIn: '08:00',
                clockOut: '16:00'
              });
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active-scale"
          >
            <span>➕</span>
            <span>إضافة سجل يدوي</span>
          </button>

          <button 
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-white text-emerald-600 border border-emerald-100 rounded-2xl font-black text-xs shadow-sm hover:bg-emerald-50 transition-all flex items-center gap-2 active-scale"
          >
            <span>📄</span>
            <span>تصدير التحليل</span>
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>السجل اليومي</button>
            <button onClick={() => setViewMode('monthly')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>التحليل الشهري</button>
          </div>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="space-y-6 relative">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-3/12">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 flex items-center gap-1.5">
                   <span>📅</span> تاريخ السجل
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500 transition shadow-inner" 
                  value={selectedDate} 
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedEmployeeIds([]); }} 
                />
              </div>
              
              <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 flex items-center gap-1.5">
                     <span>👥</span> حالة الموظف الإدارية
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition"
                    value={filterEmployeeStatus}
                    onChange={(e) => { setFilterEmployeeStatus(e.target.value); setSelectedEmployeeIds([]); }}
                  >
                    <option value="الكل">جميع الموظفين</option>
                    {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 flex items-center gap-1.5">
                     <span>⏱️</span> حالة الحضور لهذا اليوم
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition"
                    value={filterAttendanceStatus}
                    onChange={(e) => { setFilterAttendanceStatus(e.target.value); setSelectedEmployeeIds([]); }}
                  >
                    <option value="الكل">كل الحالات</option>
                    <option value="حاضر">حاضر ✅</option>
                    <option value="تأخير">تأخير ⏱</option>
                    <option value="غائب">غائب ❌</option>
                    <option value="لم يسجل">لم يسجل حضور</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => { setFilterEmployeeStatus('الكل'); setFilterAttendanceStatus('الكل'); setSelectedEmployeeIds([]); }}
                className="w-full lg:w-auto px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-200 transition flex items-center justify-center gap-2 active-scale"
              >
                <span>🔄</span>
                <span>تصفير</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">ملخص الفلاتر:</span>
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500">المختارين:</span>
                  <span className="text-xs font-black text-slate-800">{filteredStats.total}</span>
               </div>
               <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600">حاضر:</span>
                  <span className="text-xs font-black text-slate-800">{filteredStats.present}</span>
               </div>
               <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600">متأخر:</span>
                  <span className="text-xs font-black text-slate-800">{filteredStats.late}</span>
               </div>
               <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                  <span className="text-[10px] font-bold text-red-600">غائب:</span>
                  <span className="text-xs font-black text-slate-800">{filteredStats.absent}</span>
               </div>
            </div>
          </div>

          {selectedEmployeeIds.length > 0 && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl z-50 flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-300">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm">{selectedEmployeeIds.length}</div>
                  <div>
                    <p className="text-xs font-black">موظف محدد</p>
                    <button onClick={() => setSelectedEmployeeIds([])} className="text-[10px] font-bold text-slate-400 hover:text-white underline transition">إلغاء التحديد</button>
                  </div>
               </div>
               <div className="h-10 w-px bg-white/10"></div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkStatusChange('حاضر')} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl shadow-lg transition transform active:scale-95">تحضير جماعي ✅</button>
                  <button onClick={() => handleBulkStatusChange('تأخير')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black rounded-xl shadow-lg transition transform active:scale-95">تسجيل تأخير ⏱</button>
                  <button onClick={() => handleBulkStatusChange('غائب')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-xl shadow-lg transition transform active:scale-95">تسجيل غياب ✕</button>
               </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 text-center w-16">
                      <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={filteredEmployees.length > 0 && selectedEmployeeIds.length === filteredEmployees.length} onChange={toggleSelectAll} />
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف والوردية</th>
                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الدخول</th>
                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الانصراف</th>
                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">العمل الفعلي</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp) => {
                    const entry = getEntryForEmployee(emp.id, selectedDate);
                    const shift = shifts.find(s => s.id === emp.shiftId) || shifts.find(s => s.department === emp.department);
                    const hours = calculateHours(entry?.clockIn, entry?.clockOut);
                    const isSelected = selectedEmployeeIds.includes(emp.id);

                    return (
                      <tr key={emp.id} className={`hover:bg-slate-50/50 transition-all group ${isSelected ? 'bg-blue-50/40' : ''}`}>
                        <td className="px-6 py-6 text-center">
                          <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={isSelected} onChange={() => toggleSelectEmployee(emp.id)} />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={emp.avatar} className="w-11 h-11 rounded-2xl border shadow-sm object-cover" alt="" />
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full ${emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                {shift?.name || 'بدون وردية'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-6 text-center">
                          <input type="time" className="bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl p-2 text-xs font-black outline-none w-28 text-center" value={entry?.clockIn || ''} onChange={(e) => handleAttendanceChange(emp.id, 'clockIn', e.target.value)} />
                        </td>
                        <td className="px-4 py-6 text-center">
                          <input type="time" className="bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl p-2 text-xs font-black outline-none w-28 text-center" value={entry?.clockOut || ''} onChange={(e) => handleAttendanceChange(emp.id, 'clockOut', e.target.value)} />
                        </td>
                        <td className="px-4 py-6 text-center">
                           <span className={`text-xs font-black px-3 py-1 rounded-lg ${hours > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-300'}`}>
                             {hours > 0 ? `${hours} س` : '--'}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex flex-col items-center gap-1">
                             <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                              entry?.status === 'حاضر' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              entry?.status === 'تأخير' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              entry?.status === 'غائب' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                              {entry?.status || 'لم يُسجل'}
                            </span>
                            {entry?.location && (
                              <span className="text-[10px] text-blue-500 animate-bounce" title={`محدد الموقع: ${entry.location.lat.toFixed(2)}, ${entry.location.lng.toFixed(2)}`}>📍</span>
                            )}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleStatusChangeManual(emp.id, 'حاضر')} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${entry?.status === 'حاضر' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>✓</button>
                             <button onClick={() => handleStatusChangeManual(emp.id, 'تأخير')} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${entry?.status === 'تأخير' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>⏱</button>
                             <button onClick={() => handleStatusChangeManual(emp.id, 'غائب')} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${entry?.status === 'غائب' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>✕</button>
                             <button onClick={() => handleEditClick(emp.id)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-600 hover:text-white transition shadow-sm" title="تعديل السجل">✏️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto md:mx-0">
             <button onClick={() => setMonthlyViewType('team')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${monthlyViewType === 'team' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>تحليل الفريق الكامل 👥</button>
             <button onClick={() => setMonthlyViewType('individual')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${monthlyViewType === 'individual' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>تقويم الموظف الفردي 👤</button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="text-center md:text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الشهر المستهدف</p>
                         <input 
                           type="month" 
                           className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500" 
                           value={selectedMonth} 
                           onChange={(e) => setSelectedMonth(e.target.value)} 
                         />
                      </div>
                      <div className="h-12 w-px bg-slate-100 hidden md:block"></div>
                      <div className="flex gap-6">
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي ساعات العمل</p>
                            <p className="text-2xl font-black text-blue-600">{totalTeamHours.toLocaleString()}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">سجل الحضور</p>
                            <p className="text-2xl font-black text-emerald-600">{teamMonthlyAnalysis.reduce((sum, a) => sum + a.daysCount, 0)}</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">⚡</div>
                      <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase">مؤشر الإنتاجية العام</p>
                        <p className="text-lg font-black text-blue-900">
                          {(teamMonthlyAnalysis.reduce((sum, a) => sum + a.efficiency, 0) / teamMonthlyAnalysis.length || 0).toFixed(1)}%
                        </p>
                      </div>
                   </div>
                </div>

                {monthlyViewType === 'team' ? (
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">أيام الدوام</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">العمل الفعلي</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">العمل المستهدف</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الفارق (O.T)</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">مؤشر الإنجاز</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {teamMonthlyAnalysis.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => { setTargetEmployeeId(a.id); setMonthlyViewType('individual'); }}>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <img src={a.avatar} className="w-9 h-9 rounded-xl border object-cover" alt="" />
                                  <span className="font-bold text-slate-800 text-sm">{a.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-5 text-center font-black text-slate-500">{a.daysCount} يوم</td>
                              <td className="px-4 py-5 text-center font-black text-slate-800">{a.actualHours} س</td>
                              <td className="px-4 py-5 text-center font-bold text-slate-400">{a.expectedTotalHours} س</td>
                              <td className="px-4 py-5 text-center">
                                 <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                                   a.variance > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                   a.variance < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                 }`}>
                                   {a.variance > 0 ? `+${a.variance.toFixed(1)} س` : `${a.variance.toFixed(1)} س`}
                                 </span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                      <div className={`h-full transition-all duration-1000 ${a.efficiency >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(a.efficiency, 100)}%` }}></div>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-500">{a.efficiency.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-300">
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                           <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                           تفاصيل الموظف الفردية
                        </h3>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">تغيير الموظف</label>
                          <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.25rem] p-4 text-sm font-bold outline-none transition" value={targetEmployeeId} onChange={(e) => setTargetEmployeeId(e.target.value)}>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100"><p className="text-[10px] font-black text-emerald-600 uppercase mb-1">أيام الحضور</p><p className="text-2xl font-black text-emerald-800">{monthlyStats.present}</p></div>
                          <div className="text-center p-5 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-[10px] font-black text-blue-600 uppercase mb-1">إجمالي الساعات</p><p className="text-2xl font-black text-blue-800">{monthlyStats.totalHours}</p></div>
                          <div className="text-center p-5 bg-amber-50 rounded-2xl border border-amber-100"><p className="text-[10px] font-black text-amber-600 uppercase mb-1">مرات التأخير</p><p className="text-2xl font-black text-amber-800">{monthlyStats.late}</p></div>
                          <div className="text-center p-5 bg-red-50 rounded-2xl border border-red-100"><p className="text-[10px] font-black text-red-600 uppercase mb-1">أيام الغياب</p><p className="text-2xl font-black text-red-800">{monthlyStats.absent}</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-8">
                       <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-7 gap-3 md:gap-4">
                          {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase py-2 tracking-widest">{day}</div>
                          ))}
                          {calendarData.map((data, idx) => {
                            if (!data) return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-2xl border border-dashed border-slate-100"></div>;
                            const record = getEntryForEmployee(targetEmployeeId, data.date);
                            const status = record?.status;
                            const hours = calculateHours(record?.clockIn, record?.clockOut);
                            const styles: any = { 
                              'حاضر': 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm', 
                              'تأخير': 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-50', 
                              'غائب': 'bg-red-50 text-red-600 border-red-100', 
                              'default': 'bg-white border-slate-50 text-slate-300' 
                            };
                            return (
                              <div key={data.date} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative ${status ? styles[status] : styles.default}`}>
                                <span className="font-black text-sm">{data.day}</span>
                                {hours > 0 && <span className="text-[8px] font-bold opacity-70">{hours}س</span>}
                                {status === 'تأخير' && <span className="absolute top-1 right-1 text-[8px]">⏱</span>}
                                {record?.location && <span className="absolute bottom-1 right-1 text-[8px]">📍</span>}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">إضافة / تعديل سجل حضور يدوي</h3>
            <form onSubmit={handleAddManualSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الموظف</label>
                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold transition outline-none" value={addRecordData.employeeId} onChange={(e) => setAddRecordData({ ...addRecordData, employeeId: e.target.value })} required>
                  <option value="">اختر الموظف...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الحالة</label>
                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold transition outline-none" value={addRecordData.status} onChange={(e) => setAddRecordData({ ...addRecordData, status: e.target.value as AttendanceStatus })} required>
                  <option value="حاضر">حاضر ✅</option>
                  <option value="تأخير">تأخير ⏱</option>
                  <option value="غائب">غائب ✕</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الدخول</label>
                  <input type="time" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={addRecordData.clockIn} onChange={(e) => setAddRecordData({ ...addRecordData, clockIn: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الانصراف</label>
                  <input type="time" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={addRecordData.clockOut} onChange={(e) => setAddRecordData({ ...addRecordData, clockOut: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95">حفظ السجل</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black active-scale">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
