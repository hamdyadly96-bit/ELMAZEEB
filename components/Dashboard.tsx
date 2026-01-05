
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee, EmployeeStatus, SystemSettings, AttendanceEntry, Shift } from '../types';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  shifts: Shift[];
  settings: SystemSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, shifts, settings }) => {
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  
  const calculateHours = (inStr?: string, outStr?: string): number => {
    if (!inStr || !outStr) return 0;
    const [inH, inM] = inStr.split(':').map(Number);
    const [outH, outM] = outStr.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff < 0) diff += 24; 
    return parseFloat(diff.toFixed(2));
  };

  const productivityStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    const totalTodayHours = todayRecords.reduce((sum, r) => sum + calculateHours(r.clockIn, r.clockOut), 0);
    
    return {
      todayHours: parseFloat(totalTodayHours.toFixed(1)),
      attendanceRate: employees.length > 0 ? (todayRecords.length / employees.length) * 100 : 0
    };
  }, [attendance, employees]);

  const departmentData = employees.reduce((acc: any[], emp) => {
    const existing = acc.find(item => item.name === emp.department);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: emp.department, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const expiringDocs = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + settings.alertThresholdDays);

    employees.forEach(emp => {
      emp.documents?.forEach(doc => {
        const expiry = new Date(doc.expiryDate);
        if (expiry <= thresholdDate) {
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({ empName: emp.name, docType: doc.type, expiryDate: doc.expiryDate, isExpired: expiry < today, daysLeft: diffDays });
        }
      });
    });
    return alerts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).slice(0, 5);
  }, [employees, settings.alertThresholdDays]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">نظرة عامة على المؤسسة</h2>
          <p className="text-sm text-slate-500 font-medium">مرحباً بك في لوحة تحكم {settings.companyName}</p>
        </div>
        <div className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {employees.slice(0, 3).map((e, i) => (
              <img key={i} src={e.avatar} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
            ))}
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">+{employees.length - 3}</div>
          </div>
          <span className="text-[11px] font-black text-slate-700">فريق العمل المباشر</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الموظفين" value={employees.length} subtext="كادر وظيفي" icon="👥" color="indigo" />
        <StatCard title="ساعات اليوم" value={productivityStats.todayHours} subtext="ساعة فعلية" icon="⏱️" color="emerald" />
        <StatCard title="الالتزام اليومي" value={`${productivityStats.attendanceRate.toFixed(0)}%`} subtext="نسبة الحضور" icon="⚡" color="amber" />
        <StatCard title="الميزانية الشهرية" value={`${(totalSalary/1000).toFixed(1)}k`} subtext="ألف ر.س" icon="💰" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              توزيع الموارد البشرية
            </h3>
            <button className="text-[10px] font-black px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition">تحليل معمق</button>
          </div>
          <div className="h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', direction: 'rtl', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                تنبيهات فورية
              </h3>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-red-500/30">حرجة</span>
            </div>
            
            <div className="space-y-4">
              {expiringDocs.length > 0 ? expiringDocs.map((alert, i) => (
                <div key={i} className="group p-5 rounded-[1.75rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${alert.isExpired ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                      {alert.isExpired ? 'منتهية' : `خلال ${alert.daysLeft} يوم`}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{alert.expiryDate}</span>
                  </div>
                  <p className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">{alert.empName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{alert.docType}</p>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30">
                  <span className="text-5xl block mb-4">🛡️</span>
                  <p className="text-xs font-bold">جميع الوثائق ممتثلة للنظام</p>
                </div>
              )}
            </div>

            <button className="mt-8 w-full bg-white text-slate-900 py-4 rounded-2xl text-xs font-black hover:bg-blue-50 transition-all active-scale shadow-xl shadow-slate-950/20">الأرشيف الكامل 📂</button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, color }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm card-hover relative overflow-hidden">
      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 shadow-sm ${styles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] font-bold text-slate-400">{subtext}</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 opacity-[0.03] group-hover:scale-150 transition-transform duration-500">
        <span className="text-6xl">{icon}</span>
      </div>
    </div>
  );
};

export default Dashboard;
