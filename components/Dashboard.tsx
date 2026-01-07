
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee, SystemSettings, AttendanceEntry, Shift } from '../types';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  shifts: Shift[];
  settings: SystemSettings;
  onNavigate: (tabId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, settings, onNavigate }) => {
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    return {
      activeCount: employees.filter(e => e.status === 'نشط').length,
      attendanceRate: employees.length > 0 ? Math.round((todayAttendance.length / employees.length) * 100) : 0,
      avgSalary: employees.length > 0 ? Math.round(totalSalary / employees.length) : 0
    };
  }, [employees, attendance, totalSalary]);

  const departmentData = useMemo(() => {
    const data: Record<string, number> = {};
    employees.forEach(emp => {
      data[emp.department] = (data[emp.department] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const COLORS = ['#1b3152', '#76bc43', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-10 page-transition">
      {/* الترحيب والبحث السريع */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1b3152] tracking-tight">لوحة التحكم المركزية</h2>
          <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest">إدارة شاملة لموارد {settings.companyName}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => onNavigate('self-service')} className="px-6 py-3.5 bg-white border border-slate-200 text-[#1b3152] rounded-2xl text-[10px] font-black shadow-sm hover:bg-slate-50 transition active-scale">بوابة الموظف</button>
           <button onClick={() => onNavigate('people_hub')} className="px-6 py-3.5 bg-[#1b3152] text-white rounded-2xl text-[10px] font-black shadow-xl shadow-[#1b3152]/20 active-scale">إدارة الكوادر</button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="إجمالي الموظفين" value={employees.length} subtext="نشط حالياً" icon="👥" color="navy" />
        <StatCard title="نسبة الحضور اليوم" value={`${stats.attendanceRate}%`} subtext="تحديث حي" icon="⚡" color="green" />
        <StatCard title="إجمالي الرواتب" value={`${(totalSalary/1000).toFixed(1)}k`} subtext="ريال / شهرياً" icon="💰" color="blue" />
      </div>

      {/* مركز الإجراءات الفورية */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">إجراءات سريعة للإطلاق 🚀</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction title="توظيف جديد" icon="👤" onClick={() => onNavigate('people_hub')} color="bg-blue-50 text-blue-600" />
            <button onClick={() => onNavigate('finance_hub')} className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition active-scale group">
               <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">💸</span>
               <span className="text-[10px] font-black">صرف الرواتب</span>
            </button>
            <QuickAction title="جدولة الدوام" icon="⏱️" onClick={() => onNavigate('time_hub')} color="bg-amber-50 text-amber-600" />
            <QuickAction title="تحليل AI" icon="✨" onClick={() => onNavigate('growth_hub')} color="bg-purple-50 text-purple-600" />
         </div>
      </div>

      {/* الرسوم البيانية والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-[#1b3152] mb-10 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#76bc43] rounded-full"></span>
            تحليل توزيع القوى العاملة
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={45}>
                  {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#1b3152] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-8">مركز العمليات 🛠️</h3>
            <div className="space-y-6">
              {/* تنبيه انتهاء إقامة - يوجه إلى قسم الوثائق */}
              <button 
                onClick={() => onNavigate('docs')}
                className="w-full text-right p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/15 hover:border-[#76bc43]/30 transition-all active-scale"
              >
                <p className="text-xs font-black text-[#76bc43]">تنبيه انتهاء إقامة</p>
                <p className="text-[10px] opacity-60 mt-2 font-bold leading-relaxed">هناك 3 موظفين تنتهي إقاماتهم خلال 30 يوماً القادمة.</p>
              </button>

              {/* تنبيه طلبات الإجازة - يوجه إلى قسم الإجازات */}
              <button 
                onClick={() => onNavigate('leaves')}
                className="w-full text-right p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/15 hover:border-blue-400/30 transition-all active-scale"
              >
                <p className="text-xs font-black text-blue-400">طلبات إجازة معلقة</p>
                <p className="text-[10px] opacity-60 mt-2 font-bold leading-relaxed">لديك 5 طلبات إجازة سنوية بانتظار الاعتماد المالي.</p>
              </button>
            </div>
            <button onClick={() => onNavigate('people_hub')} className="w-full mt-10 py-5 bg-[#76bc43] text-white rounded-3xl font-black text-[10px] hover:bg-[#68a63a] transition shadow-lg shadow-[#76bc43]/20 active-scale uppercase tracking-widest">عرض كافة التنبيهات</button>
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#76bc43]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, color }: any) => {
  const colorMap: any = {
    navy: 'border-r-[#1b3152] bg-white',
    green: 'border-r-[#76bc43] bg-white',
    blue: 'border-r-[#3b82f6] bg-white',
  };
  return (
    <div className={`p-10 rounded-[3rem] border-r-[12px] shadow-sm hover:shadow-xl transition-all ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#1b3152] tracking-tighter">{value}</span>
            <span className="text-[10px] font-bold text-slate-400">{subtext}</span>
          </div>
        </div>
        <span className="text-4xl drop-shadow-md">{icon}</span>
      </div>
    </div>
  );
};

const QuickAction = ({ title, icon, onClick, color }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] ${color} border border-transparent hover:shadow-lg transition-all active-scale group`}>
     <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
     <span className="text-[10px] font-black">{title}</span>
  </button>
);

export default Dashboard;
