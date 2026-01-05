
import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, EmployeeStatus, Branch, SystemSettings, Invitation, Document as EmployeeDoc, AttendanceEntry, LeaveRequest, FinancialAdjustment, Shift } from '../types';
import { extractEmployeeDataFromDocument } from '../services/geminiService';
import ConfirmationModal from './ConfirmationModal';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  branches: Branch[];
  settings: SystemSettings;
  invitations: Invitation[];
  setInvitations: (invs: Invitation[]) => void;
  attendance: AttendanceEntry[];
  leaves: LeaveRequest[];
  adjustments: FinancialAdjustment[];
  shifts: Shift[];
  onSimulateJoin: (inv: Invitation) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  setEmployees, 
  branches, 
  settings,
  invitations,
  attendance,
  leaves,
  adjustments,
  onSimulateJoin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'invitations'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('الكل');
  const [filterStatus, setFilterStatus] = useState('الكل');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'summary' | 'documents' | 'attendance' | 'leaves' | 'financials'>('summary');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: 'employee' | 'document' | null; id: string | null }>({ isOpen: false, type: null, id: null });
  
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const initialFormState = { 
    name: '', role: '', department: settings.departments[0], branch: branches[0]?.name || '', 
    salary: 0, email: '', phone: '', idNumber: '', iban: '', 
    joinDate: new Date().toISOString().split('T')[0],
    status: EmployeeStatus.ACTIVE, isSaudi: true, shiftId: '', userRole: 'EMPLOYEE',
    customFields: {}, documents: [] 
  };
  const [formData, setFormData] = useState<any>(initialFormState);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = emp.name.toLowerCase().includes(lowerSearch) || emp.role.toLowerCase().includes(lowerSearch);
      const matchesDept = filterDept === 'الكل' || emp.department === filterDept;
      const matchesStatus = filterStatus === 'الكل' || emp.status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, filterDept, filterStatus]);

  const openEmployeeProfile = (emp: Employee) => {
    setViewingEmployee(emp);
    setProfileTab('summary');
    setIsProfileModalOpen(true);
  };

  // بيانات الموظف المختار للتفاصيل
  const employeeSpecificData = useMemo(() => {
    if (!viewingEmployee) return null;
    
    const empAttendance = attendance.filter(a => a.employeeId === viewingEmployee.id);
    const empLeaves = leaves.filter(l => l.employeeId === viewingEmployee.id);
    const empAdjustments = adjustments.filter(adj => adj.employeeId === viewingEmployee.id);
    
    const totalHours = empAttendance.reduce((sum, a) => {
        if (!a.clockIn || !a.clockOut) return sum;
        const [inH, inM] = a.clockIn.split(':').map(Number);
        const [outH, outM] = a.clockOut.split(':').map(Number);
        let diff = (outH + outM/60) - (inH + inM/60);
        if (diff < 0) diff += 24;
        return sum + diff;
    }, 0);

    const bonuses = empAdjustments.filter(a => a.type === 'مكافأة' || a.type === 'بدل سكن' || a.type === 'بدل نقل').reduce((s, a) => s + a.amount, 0);
    const deductions = empAdjustments.filter(a => a.type === 'خصم' || a.type === 'سلفة').reduce((s, a) => s + a.amount, 0);

    return {
      attendance: empAttendance,
      leaves: empLeaves,
      adjustments: empAdjustments,
      stats: {
        totalHours: totalHours.toFixed(1),
        lateDays: empAttendance.filter(a => a.status === 'تأخير').length,
        approvedLeaves: empLeaves.filter(l => l.status === 'مقبول').length,
        totalBonuses: bonuses,
        totalDeductions: deductions,
        financialBalance: bonuses - deductions
      }
    };
  }, [viewingEmployee, attendance, leaves, adjustments]);

  return (
    <div className="space-y-8 pb-12 page-transition">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'employee' ? 'حذف سجل موظف' : 'حذف وثيقة'}
        message="سيؤدي الحذف لإزالة البيانات نهائياً. هل أنت متأكد؟"
        confirmLabel="نعم، حذف الآن"
        onConfirm={() => {
          if (confirmState.type === 'employee' && confirmState.id) setEmployees(employees.filter(e => e.id !== confirmState.id));
          setConfirmState({ isOpen: false, type: null, id: null });
        }}
        onCancel={() => setConfirmState({ isOpen: false, type: null, id: null })}
      />

      {/* مودال معاينة الوثيقة (ثانوي) */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                 <h4 className="font-black text-slate-800">معاينة المستند المرفق</h4>
                 <button onClick={() => setPreviewDocUrl(null)} className="w-8 h-8 bg-slate-100 rounded-lg">✕</button>
              </div>
              <div className="flex-1 bg-slate-50 flex items-center justify-center">
                 {previewDocUrl.startsWith('data:application/pdf') ? (
                    <iframe src={previewDocUrl} className="w-full h-full border-0"></iframe>
                 ) : (
                    <img src={previewDocUrl} className="max-h-full object-contain" alt="Doc" />
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit mb-4">
            <button onClick={() => setActiveSubTab('list')} className={`px-6 py-2 rounded-[0.85rem] text-[11px] font-black transition-all ${activeSubTab === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>قائمة الموظفين</button>
            <button onClick={() => setActiveSubTab('invitations')} className={`px-6 py-2 rounded-[0.85rem] text-[11px] font-black transition-all ${activeSubTab === 'invitations' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>الدعوات ({invitations.length})</button>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة القوى البشرية</h2>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => { setEditingId(null); setFormData(initialFormState); setIsModalOpen(true); }} className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95 flex items-center gap-2">
            <span>➕</span> إضافة موظف جديد
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 relative">
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
             <input type="text" placeholder="ابحث بالاسم أو المسمى الوظيفي..." className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold outline-none transition shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="الكل">كل الأقسام</option>
            {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="الكل">كل الحالات</option>
            {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-container no-scrollbar">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">القسم</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => openEmployeeProfile(emp)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={emp.avatar} className="w-12 h-12 rounded-[1.1rem] object-cover shadow-sm ring-2 ring-white" alt="" />
                      <div>
                        <div className="font-black text-slate-800 text-sm">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center text-xs font-bold text-slate-700">{emp.department}</td>
                  <td className="px-4 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{emp.status}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(emp.id); setFormData({ ...emp }); setIsModalOpen(true); }} className="w-9 h-9 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-600 hover:shadow-md transition">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmState({ isOpen: true, type: 'employee', id: emp.id }); }} className="w-9 h-9 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-red-500 hover:shadow-md transition">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة ملف الموظف الكاملة والمتطورة */}
      {isProfileModalOpen && viewingEmployee && employeeSpecificData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-start shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="relative">
                        <img src={viewingEmployee.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white/10 object-cover shadow-2xl" alt="" />
                        <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[9px] font-black border-2 border-slate-900 ${viewingEmployee.status === EmployeeStatus.ACTIVE ? 'bg-emerald-500' : 'bg-amber-500'}`}>{viewingEmployee.status}</span>
                    </div>
                    <div>
                       <h3 className="text-3xl font-black">{viewingEmployee.name}</h3>
                       <div className="flex items-center gap-3 mt-1">
                          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">{viewingEmployee.role} • {viewingEmployee.department}</p>
                          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                          <p className="text-white/40 font-bold text-[10px]">ID: #{viewingEmployee.id.slice(-6)}</p>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsProfileModalOpen(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition active-scale">✕</button>
              </div>
              
              <div className="flex-1 flex flex-col overflow-hidden bg-[#fbfcfd]">
                 <div className="flex border-b bg-white px-8 overflow-x-auto no-scrollbar shrink-0">
                    <button onClick={() => setProfileTab('summary')} className={`px-6 py-5 text-sm font-black transition-all border-b-4 shrink-0 ${profileTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>📊 نظرة عامة</button>
                    <button onClick={() => setProfileTab('attendance')} className={`px-6 py-5 text-sm font-black transition-all border-b-4 shrink-0 ${profileTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>📅 الحضور ({employeeSpecificData.attendance.length})</button>
                    <button onClick={() => setProfileTab('leaves')} className={`px-6 py-5 text-sm font-black transition-all border-b-4 shrink-0 ${profileTab === 'leaves' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>🏖️ الإجازات ({employeeSpecificData.leaves.length})</button>
                    <button onClick={() => setProfileTab('financials')} className={`px-6 py-5 text-sm font-black transition-all border-b-4 shrink-0 ${profileTab === 'financials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>💸 المؤثرات ({employeeSpecificData.adjustments.length})</button>
                    <button onClick={() => setProfileTab('documents')} className={`px-6 py-5 text-sm font-black transition-all border-b-4 shrink-0 ${profileTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>📄 الوثائق ({viewingEmployee.documents?.length || 0})</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {profileTab === 'summary' && (
                       <div className="space-y-8 animate-in fade-in duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجمالي ساعات العمل</p>
                                <p className="text-2xl font-black text-blue-600">{employeeSpecificData.stats.totalHours} س</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">أيام التأخير</p>
                                <p className="text-2xl font-black text-amber-500">{employeeSpecificData.stats.lateDays} يوم</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجازات معتمدة</p>
                                <p className="text-2xl font-black text-emerald-500">{employeeSpecificData.stats.approvedLeaves} طلب</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الرصيد المالي (مكافآت-خصم)</p>
                                <p className={`text-2xl font-black ${employeeSpecificData.stats.financialBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{employeeSpecificData.stats.financialBalance.toLocaleString()} ر.س</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><span>👤</span> المعلومات الشخصية</h4>
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4 shadow-sm">
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">الاسم الكامل</span><span className="text-xs font-black text-slate-700">{viewingEmployee.name}</span></div>
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">رقم الهوية</span><span className="text-xs font-black text-slate-700">{viewingEmployee.idNumber || 'غير مسجل'}</span></div>
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">البريد الإلكتروني</span><span className="text-xs font-black text-slate-700">{viewingEmployee.email}</span></div>
                                   <div className="flex justify-between"><span className="text-xs text-slate-400 font-bold">رقم الجوال</span><span className="text-xs font-black text-slate-700">{viewingEmployee.phone || '---'}</span></div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><span>🏢</span> المعلومات الوظيفية</h4>
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4 shadow-sm">
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">تاريخ الانضمام</span><span className="text-xs font-black text-slate-700">{viewingEmployee.joinDate}</span></div>
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">الراتب الأساسي</span><span className="text-xs font-black text-blue-600">{viewingEmployee.salary.toLocaleString()} ريال</span></div>
                                   <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-xs text-slate-400 font-bold">الفرع</span><span className="text-xs font-black text-slate-700">{viewingEmployee.branch}</span></div>
                                   <div className="flex justify-between"><span className="text-xs text-slate-400 font-bold">رقم الآيبان</span><span className="text-xs font-mono font-black text-slate-700">{viewingEmployee.iban || '---'}</span></div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                    
                    {profileTab === 'attendance' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                              <table className="w-full text-right text-xs">
                                 <thead className="bg-slate-50 border-b">
                                    <tr>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase">التاريخ</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase text-center">الدخول</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase text-center">الانصراف</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase text-center">الحالة</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {employeeSpecificData.attendance.length > 0 ? employeeSpecificData.attendance.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rec, i) => (
                                       <tr key={i} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 font-black text-slate-700">{rec.date}</td>
                                          <td className="px-6 py-4 text-center font-bold text-slate-400">{rec.clockIn || '--:--'}</td>
                                          <td className="px-6 py-4 text-center font-bold text-slate-400">{rec.clockOut || '--:--'}</td>
                                          <td className="px-6 py-4 text-center">
                                             <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                                                rec.status === 'حاضر' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                rec.status === 'تأخير' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                             }`}>{rec.status}</span>
                                          </td>
                                       </tr>
                                    )) : (
                                       <tr><td colSpan={4} className="py-12 text-center text-slate-300 italic">لا توجد سجلات حضور مسجلة</td></tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {profileTab === 'leaves' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                              <table className="w-full text-right text-xs">
                                 <thead className="bg-slate-50 border-b">
                                    <tr>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase">النوع</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase">الفترة</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase text-center">الحالة</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {employeeSpecificData.leaves.length > 0 ? employeeSpecificData.leaves.map((l, i) => (
                                       <tr key={i} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 font-black text-slate-700">{l.type}</td>
                                          <td className="px-6 py-4 text-slate-500 font-bold">{l.startDate} ← {l.endDate}</td>
                                          <td className="px-6 py-4 text-center">
                                             <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                                                l.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                l.status === 'مرفوض' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                             }`}>{l.status}</span>
                                          </td>
                                       </tr>
                                    )) : (
                                       <tr><td colSpan={3} className="py-12 text-center text-slate-300 italic">لا توجد طلبات إجازة سابقة</td></tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}

                    {profileTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                           {/* ملخص المؤثرات المالية */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center">
                                 <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">إجمالي المكافآت</p>
                                 <p className="text-xl font-black text-emerald-800">+{employeeSpecificData.stats.totalBonuses.toLocaleString()} ر.س</p>
                              </div>
                              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex flex-col items-center">
                                 <p className="text-[10px] font-black text-rose-600 uppercase mb-1">إجمالي الخصومات</p>
                                 <p className="text-xl font-black text-rose-800">-{employeeSpecificData.stats.totalDeductions.toLocaleString()} ر.س</p>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
                                 <p className="text-[10px] font-black text-blue-600 uppercase mb-1">صافي المؤثرات</p>
                                 <p className={`text-xl font-black ${employeeSpecificData.stats.financialBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {employeeSpecificData.stats.financialBalance.toLocaleString()} ر.س
                                 </p>
                              </div>
                           </div>

                           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                              <table className="w-full text-right text-xs">
                                 <thead className="bg-slate-50 border-b">
                                    <tr>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase">التاريخ</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase">النوع والسبب</th>
                                       <th className="px-6 py-4 font-black text-slate-500 uppercase text-center">المبلغ</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {employeeSpecificData.adjustments.length > 0 ? employeeSpecificData.adjustments.map((adj, i) => {
                                       const isBonus = adj.type === 'مكافأة' || adj.type === 'بدل سكن' || adj.type === 'بدل نقل';
                                       return (
                                       <tr key={i} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 font-bold text-slate-400 font-mono">{adj.date}</td>
                                          <td className="px-6 py-4">
                                             <div className="font-black text-slate-700">{adj.type}</div>
                                             <div className="text-[10px] text-slate-400 font-bold">{adj.reason}</div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                             <span className={`font-black ${isBonus ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isBonus ? '+' : '-'}{adj.amount.toLocaleString()} ر.س
                                             </span>
                                          </td>
                                       </tr>
                                       );
                                    }) : (
                                       <tr><td colSpan={3} className="py-12 text-center text-slate-300 italic">لا توجد مؤثرات مالية مسجلة</td></tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                    )}
                    
                    {profileTab === 'documents' && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                          {viewingEmployee.documents && viewingEmployee.documents.length > 0 ? viewingEmployee.documents.map(doc => (
                             <div key={doc.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center hover:border-blue-200 transition group shadow-sm">
                                <div>
                                   <p className="font-black text-slate-800 text-sm">{doc.type}</p>
                                   <p className="text-[10px] text-slate-400 font-bold">ينتهي في: {doc.expiryDate}</p>
                                </div>
                                {doc.fileUrl && (
                                   <button 
                                      onClick={() => setPreviewDocUrl(doc.fileUrl!)}
                                      className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition active-scale shadow-sm"
                                   >
                                      👁️
                                   </button>
                                )}
                             </div>
                          )) : (
                             <div className="col-span-2 py-10 text-center opacity-20"><span className="text-5xl block mb-4">📂</span><p className="font-black">لا توجد وثائق مرفقة</p></div>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
