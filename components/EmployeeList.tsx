
import React, { useState, useMemo, useRef } from 'react';
import { Employee, EmployeeStatus, Branch, SystemSettings, Invitation, AttendanceEntry, LeaveRequest, FinancialAdjustment, Shift } from '../types.ts';
import { extractEmployeeDataFromDocument } from '../services/geminiService.ts';
import ConfirmationModal from './ConfirmationModal.tsx';

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
  setAdjustments: (adj: FinancialAdjustment[]) => void;
  shifts: Shift[];
  onSimulateJoin: (inv: Invitation) => void;
}

type DetailTab = 'overview' | 'attendance' | 'leaves' | 'financials';

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  setEmployees, 
  branches, 
  settings,
  attendance,
  leaves,
  adjustments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('الكل');
  const [filterStatus, setFilterStatus] = useState('الكل');
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const emptyEmployeeState: Partial<Employee> = {
    name: '',
    role: '',
    userRole: 'EMPLOYEE',
    department: settings.departments[0],
    branch: branches[0]?.name || '',
    salary: 0,
    status: EmployeeStatus.ACTIVE,
    isSaudi: true,
    gender: 'ذكر',
    email: '',
    iban: '',
    phone: '',
    idNumber: '',
    idExpiryDate: '',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: '',
  };

  const [newEmployeeData, setNewEmployeeData] = useState<Partial<Employee>>(emptyEmployeeState);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'الكل' || emp.department === filterDept;
      const matchesStatus = filterStatus === 'الكل' || emp.status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, filterDept, filterStatus]);

  // استخراج البيانات التفصيلية للموظف المختار فور النقر
  const empDetails = useMemo(() => {
    if (!selectedEmployee) return null;
    const empId = selectedEmployee.id;
    
    const empAttendance = attendance
      .filter(a => a.employeeId === empId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const empLeaves = leaves
      .filter(l => l.employeeId === empId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const empAdjustments = adjustments
      .filter(adj => adj.employeeId === empId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // حساب رصيد الإجازات السنوي (بافتراض 30 يوم سنوياً)
    const annualLeavesTaken = empLeaves
      .filter(l => l.type === 'سنوية' && l.status === 'مقبول')
      .reduce((sum, l) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        return sum + diff;
      }, 0);

    const attendanceRate = empAttendance.length > 0 
      ? (empAttendance.filter(a => a.status === 'حاضر').length / empAttendance.length) * 100 
      : 0;

    return {
      attendance: empAttendance,
      leaves: empLeaves,
      adjustments: empAdjustments,
      leaveBalance: 30 - annualLeavesTaken,
      attendanceRate
    };
  }, [selectedEmployee, attendance, leaves, adjustments]);

  const handleAiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fullDataUrl = event.target?.result as string;
      const base64 = fullDataUrl.split(',')[1];
      try {
        const data = await extractEmployeeDataFromDocument(base64, file.type);
        if (data) {
          setNewEmployeeData(prev => ({
            ...prev,
            name: data.name || prev.name,
            idNumber: data.idNumber || prev.idNumber,
            idExpiryDate: data.idExpiryDate || prev.idExpiryDate,
            gender: data.gender || prev.gender,
            avatar: data.hasFaceImage ? fullDataUrl : prev.avatar,
          }));
        }
      } catch (error) {
        console.error("AI extraction failed:", error);
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewEmployeeData({ ...newEmployeeData, avatar: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("يرجى منح إذن الكاميرا.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const photo = canvasRef.current.toDataURL('image/png');
      setNewEmployeeData({ ...newEmployeeData, avatar: photo });
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && newEmployeeData.id) {
      setEmployees(employees.map(emp => emp.id === newEmployeeData.id ? { ...emp, ...newEmployeeData } as Employee : emp));
    } else {
      const newEmp: Employee = {
        ...newEmployeeData as Employee,
        id: Date.now().toString(),
      };
      setEmployees([...employees, newEmp]);
    }
    setIsAddModalOpen(false);
    setIsEditing(false);
    setNewEmployeeData(emptyEmployeeState);
  };

  const handleEditClick = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    setNewEmployeeData({ ...emp });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const getStatusInfo = (status: EmployeeStatus) => {
    switch(status) {
      case EmployeeStatus.ACTIVE: return { color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case EmployeeStatus.ON_LEAVE: return { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      case EmployeeStatus.TERMINATED: return { color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
      default: return { color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف سجل الموظف "${selectedEmployee?.name}"؟`}
        confirmLabel="حذف السجل"
        onConfirm={() => {
            if (selectedEmployee) {
              setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
              setSelectedEmployee(null);
              setIsDeleteConfirmOpen(false);
              setIsDetailVisible(false);
            }
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الكوادر البشرية</h2>
          <p className="text-sm text-slate-500 font-medium">عرض سريع وبحث ذكي في ملفات الموظفين.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setNewEmployeeData(emptyEmployeeState); setIsAddModalOpen(true); }} 
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active-scale flex items-center justify-center gap-3"
        >
          <span className="text-xl">➕</span> إضافة موظف جديد
        </button>
      </header>

      {/* شريط البحث والفلترة */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
           <input 
            type="text" 
            placeholder="ابحث بالاسم أو المنصب..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
           />
        </div>
        <select className="bg-slate-50 border-0 rounded-2xl px-4 py-4 text-xs font-black outline-none" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="الكل">جميع الأقسام</option>
          {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="bg-slate-50 border-0 rounded-2xl px-4 py-4 text-xs font-black outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="الكل">كل الحالات</option>
          {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* شبكة البطاقات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => {
          const statusInfo = getStatusInfo(emp.status);
          return (
            <div 
              key={emp.id} 
              onClick={() => { setSelectedEmployee(emp); setActiveDetailTab('overview'); setIsDetailVisible(true); }} 
              className="group relative bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center"
            >
              <div className="absolute top-0 left-0 w-full h-20 bg-slate-50/50 -z-0"></div>
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="relative mb-5">
                  <img src={emp.avatar || 'https://via.placeholder.com/150'} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-lg" alt="" />
                  <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${statusInfo.color}`}></span>
                </div>
                <h4 className="font-black text-slate-800 text-base mb-1 truncate w-full text-center">{emp.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{emp.role}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg border border-blue-100">{emp.department}</span>
                  <span className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.text} text-[9px] font-black rounded-lg border ${statusInfo.border}`}>{emp.status}</span>
                </div>
                <div className="w-full pt-4 border-t border-slate-50 flex justify-between">
                   <div className="text-right">
                     <p className="text-[8px] font-black text-slate-300">الراتب</p>
                     <p className="text-[11px] font-black">{emp.salary.toLocaleString()} ر.س</p>
                   </div>
                   <div className="text-left">
                     <p className="text-[8px] font-black text-slate-300">تاريخ البدء</p>
                     <p className="text-[11px] font-black">{emp.joinDate}</p>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة تفاصيل الموظف التفصيلية (Enhanced View) */}
      {isDetailVisible && selectedEmployee && empDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* الهيدر العلوي */}
            <div className="p-10 border-b bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col md:flex-row gap-10 items-center relative">
               <button onClick={() => setIsDetailVisible(false)} className="absolute top-8 left-8 w-10 h-10 flex items-center justify-center bg-white border rounded-xl text-slate-400 hover:text-red-500 transition shadow-sm z-20">✕</button>
               <img src={selectedEmployee.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl object-cover" alt="" />
               <div className="text-center md:text-right flex-1">
                 <h3 className="text-4xl font-black text-slate-800 tracking-tight">{selectedEmployee.name}</h3>
                 <p className="text-sm font-bold text-slate-500">{selectedEmployee.role} • <span className="text-blue-600">{selectedEmployee.department}</span></p>
                 <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                    <StatBox label="رصيد الإجازات" value={`${empDetails.leaveBalance} يوم`} color="text-blue-600" />
                    <StatBox label="معدل الانضباط" value={`${Math.round(empDetails.attendanceRate)}%`} color="text-emerald-600" />
                    <StatBox label="إجمالي الحركات المالية" value={empDetails.adjustments.length} color="text-slate-600" />
                 </div>
               </div>
            </div>

            {/* التبويبات الداخلية */}
            <div className="flex bg-slate-100 p-1.5 border-b">
               <TabBtn active={activeDetailTab === 'overview'} onClick={() => setActiveDetailTab('overview')} label="البيانات العامة" icon="📂" />
               <TabBtn active={activeDetailTab === 'attendance'} onClick={() => setActiveDetailTab('attendance')} label="سجل الحضور" icon="⏱️" />
               <TabBtn active={activeDetailTab === 'leaves'} onClick={() => setActiveDetailTab('leaves')} label="الإجازات" icon="🏖️" />
               <TabBtn active={activeDetailTab === 'financials'} onClick={() => setActiveDetailTab('financials')} label="المالية" icon="💰" />
            </div>

            {/* محتوى التبويبات */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
               {activeDetailTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4">
                    <Section title="بيانات الهوية والعمل" icon="🆔">
                       <Row label="رقم الهوية / الإقامة" value={selectedEmployee.idNumber} />
                       <Row label="تاريخ انتهاء الهوية" value={selectedEmployee.idExpiryDate} />
                       <Row label="تاريخ الانضمام" value={selectedEmployee.joinDate} />
                       <Row label="فرع العمل" value={selectedEmployee.branch} />
                    </Section>
                    <Section title="بيانات التواصل والبنك" icon="🏦">
                       <Row label="رقم الجوال" value={selectedEmployee.phone || 'غير مسجل'} />
                       <Row label="البريد الإلكتروني" value={selectedEmployee.email} />
                       <Row label="الآيبان IBAN" value={selectedEmployee.iban || 'غير مسجل'} />
                       <Row label="الراتب الأساسي" value={`${selectedEmployee.salary.toLocaleString()} ر.س`} />
                    </Section>
                  </div>
               )}

               {activeDetailTab === 'attendance' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="text-lg font-black text-slate-800">آخر 10 سجلات حضور</h4>
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                       <table className="w-full text-right text-xs">
                          <thead className="bg-slate-100/50 font-black text-slate-400 uppercase tracking-widest">
                             <tr>
                                <th className="px-8 py-5">التاريخ</th>
                                <th className="px-6 py-5 text-center">الدخول</th>
                                <th className="px-6 py-5 text-center">الانصراف</th>
                                <th className="px-8 py-5 text-center">الحالة</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {empDetails.attendance.map((a, i) => (
                                <tr key={i} className="hover:bg-white transition-colors">
                                   <td className="px-8 py-5 font-bold">{a.date}</td>
                                   <td className="px-6 py-5 text-center font-mono">{a.clockIn || '--:--'}</td>
                                   <td className="px-6 py-5 text-center font-mono">{a.clockOut || '--:--'}</td>
                                   <td className="px-8 py-5 text-center">
                                      <span className={`px-3 py-1 rounded-lg font-black ${
                                         a.status === 'حاضر' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                      }`}>{a.status}</span>
                                   </td>
                                </tr>
                             ))}
                             {empDetails.attendance.length === 0 && <tr><td colSpan={4} className="py-20 text-center opacity-30 italic font-bold">لا توجد سجلات بعد.</td></tr>}
                          </tbody>
                       </table>
                    </div>
                  </div>
               )}

               {activeDetailTab === 'leaves' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-lg font-black text-slate-800">رصيد الإجازات السنوي</h4>
                       <span className="text-2xl font-black text-blue-600">{empDetails.leaveBalance} يوم متبقي</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(empDetails.leaveBalance / 30) * 100}%` }}></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100">
                       <h5 className="text-sm font-black mb-4">السجل التاريخي للإجازات</h5>
                       <div className="space-y-3">
                          {empDetails.leaves.map((l, i) => (
                             <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <div><p className="font-black text-sm">{l.type}</p><p className="text-[10px] text-slate-400 font-bold">{l.startDate} إلى {l.endDate}</p></div>
                                <span className="px-3 py-1 bg-white border rounded-lg text-[9px] font-black">{l.status}</span>
                             </div>
                          ))}
                          {empDetails.leaves.length === 0 && <p className="text-center py-10 opacity-30 italic">لا يوجد سجل إجازات.</p>}
                       </div>
                    </div>
                  </div>
               )}

               {activeDetailTab === 'financials' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="text-lg font-black text-slate-800">الحركات المالية المسجلة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {empDetails.adjustments.map((adj, i) => (
                          <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-blue-100 transition-all">
                             <div className="flex justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                                   ['مكافأة', 'بدل سكن', 'بدل نقل'].includes(adj.type) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>{adj.type}</span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">{adj.date}</span>
                             </div>
                             <p className="text-xl font-black text-slate-800">
                                {['مكافأة', 'بدل سكن', 'بدل نقل'].includes(adj.type) ? '+' : '-'}{adj.amount.toLocaleString()} <span className="text-xs">ر.س</span>
                             </p>
                             <p className="text-[10px] font-bold text-slate-500 mt-2">{adj.reason}</p>
                          </div>
                       ))}
                       {empDetails.adjustments.length === 0 && <div className="col-span-full py-20 text-center opacity-30 italic font-bold">لا توجد حركات مالية مسجلة.</div>}
                    </div>
                  </div>
               )}
            </div>

            <div className="p-8 border-t bg-slate-50 flex gap-4 justify-end">
               <button onClick={(e) => handleEditClick(e, selectedEmployee)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active-scale transition">تعديل الملف الأساسي ✏️</button>
               <button onClick={() => { setIsDeleteConfirmOpen(true); }} className="px-8 py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-black text-xs active-scale transition">حذف السجل 🗑️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// مكونات مساعدة
const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex-1 py-4 text-xs font-black transition-all border-b-2 ${active ? 'bg-white text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}>
     <span className="ml-2">{icon}</span> {label}
  </button>
);
const StatBox = ({ label, value, color }: any) => (
  <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
     <p className={`text-sm font-black ${color}`}>{value}</p>
  </div>
);
const Section = ({ title, children, icon }: any) => (
  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
     <div className="flex items-center gap-3 mb-6"><span className="text-xl">{icon}</span><h5 className="text-xs font-black text-blue-600 uppercase">{title}</h5></div>
     <div className="space-y-4">{children}</div>
  </div>
);
const Row = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"><span className="text-[10px] font-bold text-slate-400">{label}</span><span className="text-xs font-black text-slate-800">{value}</span></div>
);

export default EmployeeList;
