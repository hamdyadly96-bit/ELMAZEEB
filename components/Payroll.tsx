
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { Employee, SystemSettings, AttendanceEntry, Shift, FinancialAdjustment } from '../types';

interface PayrollProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  shifts: Shift[];
  settings: SystemSettings;
  adjustments: FinancialAdjustment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Payroll: React.FC<PayrollProps> = ({ employees, attendance, shifts, settings, adjustments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');

  const calculateHours = (inStr?: string, outStr?: string): number => {
    if (!inStr || !outStr) return 0;
    const [inH, inM] = inStr.split(':').map(Number);
    const [outH, outM] = outStr.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff < 0) diff += 24; 
    return parseFloat(diff.toFixed(2));
  };

  const payrollData = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'الكل' || emp.department === selectedDept;
        return matchesSearch && matchesDept;
      })
      .map(emp => {
        const empAttendance = attendance.filter(a => a.employeeId === emp.id && a.date.slice(0, 7) >= startMonth && a.date.slice(0, 7) <= endMonth);
        const actualHours = empAttendance.reduce((sum, a) => sum + calculateHours(a.clockIn, a.clockOut), 0);
        const s = new Date(startMonth + "-01");
        const e = new Date(endMonth + "-01");
        const monthDiff = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;

        const shift = shifts.find(s => s.id === emp.shiftId) || shifts.find(s => s.department === emp.department);
        const expectedDailyHours = shift?.workHours || 8;
        const targetHours = 22 * expectedDailyHours * monthDiff;
        
        // الحسابات الأساسية
        const basic = emp.salary * monthDiff;
        const housing = basic * 0.25;
        const transport = basic * 0.1;
        const insurance = basic * 0.09;
        
        // حساب المؤثرات المالية (سلف، خصومات، مكافآت) للفترة المختارة
        const empAdjustments = adjustments.filter(adj => 
          adj.employeeId === emp.id && 
          adj.date.slice(0, 7) >= startMonth && 
          adj.date.slice(0, 7) <= endMonth
        );

        const totalBonuses = empAdjustments
          .filter(a => a.type === 'مكافأة' || a.type === 'بدل سكن' || a.type === 'بدل نقل')
          .reduce((sum, a) => sum + a.amount, 0);
        
        const totalDeductions = empAdjustments
          .filter(a => a.type === 'سلفة' || a.type === 'خصم')
          .reduce((sum, a) => sum + a.amount, 0);

        const net = basic + housing + transport - insurance + totalBonuses - totalDeductions;

        return { 
          ...emp, 
          actualHours: parseFloat(actualHours.toFixed(1)), 
          targetHours, 
          efficiency: targetHours > 0 ? Math.min(100, (actualHours / targetHours) * 100) : 0, 
          basic, 
          housing, 
          transport, 
          insurance, 
          totalBonuses,
          totalDeductions,
          net, 
          monthCount: monthDiff 
        };
      });
  }, [employees, attendance, startMonth, endMonth, shifts, searchTerm, selectedDept, adjustments]);

  const stats = useMemo(() => {
    let totalNet = 0, totalHours = 0, totalDeductions = 0;
    payrollData.forEach(p => { 
      totalNet += p.net; 
      totalHours += p.actualHours; 
      totalDeductions += p.totalDeductions;
    });
    return { 
      totalNet, 
      totalHours: parseFloat(totalHours.toFixed(1)), 
      totalDeductions,
      avgEfficiency: payrollData.length > 0 ? (payrollData.reduce((s, p) => s + p.efficiency, 0) / payrollData.length).toFixed(1) : 0 
    };
  }, [payrollData]);

  const chartDataByDept = useMemo(() => {
    const map: Record<string, number> = {};
    payrollData.forEach(p => { map[p.department] = (map[p.department] || 0) + p.net; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [payrollData]);

  return (
    <div className="space-y-8 pb-12 page-transition">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">التقارير المالية والرواتب</h2>
          <p className="text-sm text-slate-500 font-medium">نظام ذكي لمصاريف التشغيل والإنتاجية مع خصم آلي للسلف</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.25rem] border border-slate-100 shadow-sm">
          <button onClick={() => setViewMode('table')} className={`px-6 py-2 rounded-xl text-[11px] font-black transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>📋 البيانات</button>
          <button onClick={() => setViewMode('analytics')} className={`px-6 py-2 rounded-xl text-[11px] font-black transition-all ${viewMode === 'analytics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>📊 التحليل</button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">النطاق الزمني</label>
          <div className="flex items-center gap-2">
            <input type="month" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black outline-none" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
            <span className="text-slate-300">←</span>
            <input type="month" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black outline-none" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الفلترة حسب القسم</label>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black outline-none" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <option value="الكل">جميع الأقسام</option>
            {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-end">
          <StatsMiniCard title="صافي الحوالات" value={stats.totalNet.toLocaleString()} unit="SAR" icon="💰" color="blue" />
          <StatsMiniCard title="سلف مستردة" value={stats.totalDeductions.toLocaleString()} unit="SAR" icon="📉" color="amber" />
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="text-lg font-black text-slate-800 mb-8">الميزانية حسب القسم</h3>
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={chartDataByDept} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                      {chartDataByDept.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px rgba(0,0,0,0.05)', fontSize: '11px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-center">
             <div className="text-6xl mb-6 opacity-30">💹</div>
             <h3 className="text-2xl font-black mb-4 leading-tight">جاهز لتسوية المستحقات؟</h3>
             <p className="text-slate-400 font-medium mb-8 leading-relaxed">بناءً على الفلاتر المختارة، إجمالي المبلغ المطلوب للتحويل هو {stats.totalNet.toLocaleString()} ريال سعودي لعدد {payrollData.length} موظف بعد خصم السلف.</p>
             <button className="bg-white text-slate-900 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-50 transition-all active-scale">توليد ملف صرف الرواتب (WPS) 📥</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                  <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الراتب الأساسي</th>
                  <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">المؤثرات (سلف/مكافآت)</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">صافي الراتب النهائي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrollData.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={p.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <div className="font-black text-slate-800 text-sm">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{p.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center font-bold text-slate-600">
                       {p.basic.toLocaleString()} ر.س
                    </td>
                    <td className="px-4 py-6 text-center">
                       <div className="flex flex-col items-center gap-1">
                          {p.totalBonuses > 0 && <span className="text-[10px] font-black text-emerald-600">+{p.totalBonuses.toLocaleString()} (مكافآت)</span>}
                          {p.totalDeductions > 0 && <span className="text-[10px] font-black text-red-600">-{p.totalDeductions.toLocaleString()} (سلف/خصم)</span>}
                          {p.totalBonuses === 0 && p.totalDeductions === 0 && <span className="text-[10px] text-slate-300 italic">لا يوجد</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-6 py-2 bg-blue-50 text-blue-700 font-black rounded-2xl border border-blue-100 shadow-sm text-sm">
                        {p.net.toLocaleString()} ريال
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsMiniCard = ({ title, value, unit, icon, color }: any) => {
  const styles: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`flex-1 min-w-[160px] p-5 rounded-2xl border transition-all hover:shadow-lg ${styles[color]}`}>
       <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">{icon}</span>
          <p className="text-[9px] font-black uppercase tracking-widest">{title}</p>
       </div>
       <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-slate-800">{value}</span>
          <span className="text-[9px] font-bold text-slate-400">{unit}</span>
       </div>
    </div>
  );
};

export default Payroll;
