
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import { Employee, SystemSettings, AttendanceEntry, Shift, FinancialAdjustment } from '../types.ts';

interface PayrollProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  shifts: Shift[];
  settings: SystemSettings;
  adjustments: FinancialAdjustment[];
}

// مكون قسيمة الراتب الرسمي المصمم خصيصاً للطباعة بدقة A4
const PayslipContent = ({ p, settings, startMonth, endMonth, isBulk = false }: { p: any, settings: SystemSettings, startMonth: string, endMonth: string, isBulk?: boolean }) => (
  <div 
    className={`bg-white text-slate-900 ${isBulk ? 'page-break' : ''}`}
    dir="rtl"
    style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '20mm',
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: 'white'
    }}
  >
    {/* الترويسة الرسمية */}
    <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
      <div className="space-y-1 text-right">
        <h2 className="text-2xl font-black text-slate-900">{settings.companyName}</h2>
        <p className="text-xs font-bold text-slate-500">إدارة الموارد البشرية والشؤون المالية</p>
        <p className="text-[10px] text-slate-400">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>
      <div className="text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-2 shadow-lg">
           <span className="text-white text-3xl font-black">M</span>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200">Official Document</div>
      </div>
      <div className="text-left">
        <h1 className="text-3xl font-black text-slate-900 mb-1">قسيمة راتب</h1>
        <p className="text-sm font-bold text-slate-500">للفترة: {startMonth} - {endMonth}</p>
        <div className="mt-2 text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-md inline-block">رقم القسيمة: #{p.id.slice(-6).toUpperCase()}</div>
      </div>
    </div>

    {/* تفاصيل الموظف */}
    <div className="grid grid-cols-2 gap-8 mb-12">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
         <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">اسم الموظف:</span> <span className="text-sm font-black">{p.name}</span></div>
         <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">الرقم الوظيفي:</span> <span className="text-sm font-black">#{p.id.slice(-6)}</span></div>
         <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">القسم:</span> <span className="text-sm font-black">{p.department}</span></div>
      </div>
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
         <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">المسمى الوظيفي:</span> <span className="text-sm font-black">{p.role}</span></div>
         <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">نوع التعاقد:</span> <span className="text-sm font-black">{p.isSaudi ? 'سعودي' : 'مقيم'}</span></div>
         <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">حالة الدفع:</span> <span className="text-sm font-black text-emerald-600 font-bold">معتمدة</span></div>
      </div>
    </div>

    {/* الجدول المالي */}
    <div className="grid grid-cols-2 gap-12 mb-12">
      <div className="space-y-5">
        <h3 className="text-sm font-black text-emerald-700 border-b-2 border-emerald-100 pb-2 flex items-center gap-2">
          <span>💰</span> المستحقات والإضافات
        </h3>
        <div className="space-y-3">
          <Row label="الراتب الأساسي" value={p.basic} />
          <Row label="بدل السكن (25%)" value={p.housing} />
          <Row label="بدل النقل (10%)" value={p.transport} />
          {p.totalBonuses > 0 && <Row label="مكافآت وحوافز" value={p.totalBonuses} color="text-emerald-600 font-black" />}
          <div className="pt-4 mt-4 border-t-2 border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900">إجمالي المستحقات</span>
            <span className="text-sm font-black text-slate-900">{(p.basic + p.housing + p.transport + p.totalBonuses).toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-black text-rose-700 border-b-2 border-rose-100 pb-2 flex items-center gap-2">
          <span>📉</span> الاستقطاعات والخصومات
        </h3>
        <div className="space-y-3">
          <Row label="التأمينات الاجتماعية (9%)" value={p.insurance} />
          {p.totalDeductions > 0 && <Row label="خصومات وسلف" value={p.totalDeductions} color="text-rose-600 font-black" />}
          <div className="pt-24 mt-4 border-t-2 border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900">إجمالي الاستقطاعات</span>
            <span className="text-sm font-black text-slate-900">{(p.insurance + p.totalDeductions).toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>
    </div>

    {/* الصافي الختامي */}
    <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 flex justify-between items-center shadow-2xl" style={{ backgroundColor: '#1b3152 !important' }}>
       <div className="text-right">
          <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">صافي المبلغ المستحق للدفع</p>
          <p className="text-5xl font-black">{p.net.toLocaleString()}</p>
       </div>
       <div className="text-left">
          <p className="text-4xl font-black opacity-10">SAR</p>
          <p className="text-xs font-bold opacity-60">ريال سعودي</p>
       </div>
    </div>

    {/* التواقيع */}
    <div className="mt-24 pt-12 border-t border-slate-100 grid grid-cols-3 gap-10 text-center">
       <div className="space-y-12">
          <p className="text-[10px] font-black text-slate-400 uppercase italic">اعتماد الموارد البشرية</p>
          <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto border-2 border-dashed border-slate-200 flex items-center justify-center text-[8px] text-slate-300">ختم الإدارة</div>
       </div>
       <div className="flex flex-col items-center justify-center opacity-20">
          <div className="w-16 h-16 bg-slate-200 rounded-xl mb-2 flex items-center justify-center text-2xl">QR</div>
          <p className="text-[8px] font-bold">موثق إلكترونياً</p>
       </div>
       <div className="space-y-12">
          <p className="text-[10px] font-black text-slate-400 uppercase italic">توقيع الموظف المستلم</p>
          <div className="border-b-2 border-slate-200 w-32 mx-auto"></div>
       </div>
    </div>

    {/* تذييل الصفحة */}
    <div className="absolute bottom-10 left-10 right-10 text-center">
       <p className="text-[9px] font-bold text-slate-300">هذه وثيقة سرية مخصصة للاستخدام الداخلي في {settings.companyName} فقط.</p>
    </div>
  </div>
);

const Row = ({ label, value, color = "text-slate-700" }: any) => (
  <div className="flex justify-between items-center text-xs">
    <span className="font-bold text-slate-400">{label}</span>
    <span className={`${color} font-bold`}>{value.toLocaleString()} ر.س</span>
  </div>
);

const Payroll: React.FC<PayrollProps> = ({ employees, attendance, shifts, settings, adjustments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // حالات الطباعة
  const [printMode, setPrintMode] = useState<'none' | 'all' | 'single'>('none');
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  // مراقبة الحالة للبدء بالطباعة فور جاهزية البيانات في الـ Portal
  useEffect(() => {
    if (printMode !== 'none') {
      const timer = setTimeout(() => {
        window.print();
        // إعادة التعيين بعد إغلاق نافذة الطباعة
        // ملحوظة: onafterprint قد لا يعمل في كل المتصفحات، لذا نستخدم مؤقتاً طويلاً كبديل
      }, 1000);
      
      const handleAfterPrint = () => {
        setPrintMode('none');
        setIsPreparing(false);
        setSelectedPayslip(null);
      };
      
      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [printMode]);

  const payrollData = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'الكل' || emp.department === selectedDept;
        return matchesSearch && matchesDept;
      })
      .map(emp => {
        const s = new Date(startMonth + "-01");
        const e = new Date(endMonth + "-01");
        const monthDiff = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
        
        const basic = emp.salary * monthDiff;
        const housing = basic * 0.25;
        const transport = basic * 0.1;
        const insurance = basic * 0.09;
        
        const empAdjustments = adjustments.filter(adj => 
          adj.employeeId === emp.id && 
          adj.date.slice(0, 7) >= startMonth && 
          adj.date.slice(0, 7) <= endMonth
        );

        const totalBonuses = empAdjustments.filter(a => ['مكافأة', 'بدل سكن', 'بدل نقل'].includes(a.type)).reduce((sum, a) => sum + a.amount, 0);
        const totalDeductions = empAdjustments.filter(a => ['سلفة', 'خصم'].includes(a.type)).reduce((sum, a) => sum + a.amount, 0);
        const net = Math.round(basic + housing + transport - insurance + totalBonuses - totalDeductions);

        return { ...emp, basic, housing, transport, insurance, totalBonuses, totalDeductions, net };
      });
  }, [employees, adjustments, startMonth, endMonth, searchTerm, selectedDept]);

  const handlePrintAll = () => {
    if (payrollData.length === 0) return;
    setIsPreparing(true);
    setPrintMode('all');
  };

  const handlePrintSingle = (p: any) => {
    setIsPreparing(true);
    setSelectedPayslip(p);
    setPrintMode('single');
  };

  const handleTestPrintAhmed = () => {
    const ahmed = payrollData.find(p => p.name.includes('أحمد علي'));
    if (ahmed) {
      handlePrintSingle(ahmed);
    } else {
      alert('الموظف أحمد علي غير موجود في القائمة الحالية (تأكد من الفلترة)');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = payrollData.map(p => ({
      'الموظف': p.name,
      'القسم': p.department,
      'الراتب الأساسي': p.basic,
      'إجمالي الإضافات': p.totalBonuses,
      'إجمالي الخصومات': p.totalDeductions,
      'الصافي المستحق': p.net
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, `Payroll_Report_${startMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* شاشة التحميل للطباعة */}
      {isPreparing && (
        <div className="print-loader-overlay no-print">
           <div className="loader-pulse">📥</div>
           <h3 className="text-2xl font-black mb-2">جاري تجهيز المستندات</h3>
           <p className="text-blue-200 font-bold opacity-70">يتم الآن رسم القسائم وتنسيقها للـ PDF...</p>
           <button onClick={() => { setIsPreparing(false); setPrintMode('none'); }} className="mt-8 px-6 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/20">إلغاء</button>
        </div>
      )}

      {/* بوابة الطباعة الرسمية (Portals) */}
      {printMode !== 'none' && createPortal(
        <div id="print-root-content" className="print-only">
          {printMode === 'all' && payrollData.map(p => (
            <PayslipContent key={p.id} p={p} settings={settings} startMonth={startMonth} endMonth={endMonth} isBulk={true} />
          ))}
          {printMode === 'single' && selectedPayslip && (
            <PayslipContent p={selectedPayslip} settings={settings} startMonth={startMonth} endMonth={endMonth} isBulk={false} />
          )}
        </div>,
        document.getElementById('print-root')!
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="animate-in slide-in-from-right duration-500">
          <h2 className="text-3xl font-black text-slate-800">مسير الرواتب الذكي</h2>
          <p className="text-sm text-slate-500 font-medium">إدارة شاملة للمستحقات مع ميزة التصدير الفوري.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleTestPrintAhmed}
            className="flex-1 md:flex-none px-6 py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl font-black text-xs hover:bg-blue-100 transition active-scale shadow-sm"
          >
            اختبار طباعة (أحمد علي) 🧪
          </button>
          <button 
            type="button"
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-50 transition active-scale shadow-sm"
          >
            تصدير Excel 📊
          </button>
          <button 
            type="button"
            onClick={handlePrintAll}
            disabled={payrollData.length === 0}
            className="flex-[2] md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl active-scale flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <span>📥</span> تحميل كافة القسائم (PDF)
          </button>
        </div>
      </header>

      {/* فلترة البيانات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
        <div className="md:col-span-1 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الفترة الزمنية</label>
          <div className="flex items-center gap-1">
            <input type="month" className="flex-1 bg-slate-50 border-0 rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition" value={startMonth} onChange={e => setStartMonth(e.target.value)} />
            <input type="month" className="flex-1 bg-slate-50 border-0 rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition" value={endMonth} onChange={e => setEndMonth(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-1 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">القسم الإداري</label>
          <select className="w-full bg-slate-50 border-0 rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="الكل">جميع الأقسام</option>
            {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 relative group self-end">
           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
           <input 
            type="text" 
            placeholder="بحث باسم الموظف..." 
            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-0 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
           />
        </div>
      </div>

      {/* جدول مسير الرواتب */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden no-print animate-in slide-in-from-bottom-10 duration-700">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">الأساسي</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">المستحقات (+)</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">الخصومات (-)</th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">الصافي</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">تحميل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payrollData.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={p.avatar} className="w-11 h-11 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                        {p.isSaudi && <span className="absolute -top-1 -right-1 text-[10px]">🇸🇦</span>}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-none mb-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.department} • {p.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="font-mono font-black text-slate-700 bg-slate-50 px-3 py-1 rounded-lg text-xs">{p.basic.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="text-xs font-black text-emerald-600">+{ (p.housing + p.transport + p.totalBonuses).toLocaleString() }</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="text-xs font-black text-rose-600">-{ (p.insurance + p.totalDeductions).toLocaleString() }</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                     <div className="inline-flex flex-col items-center">
                        <span className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                          {p.net.toLocaleString()}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 mt-1 uppercase">ريال سعودي</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handlePrintSingle(p); }}
                      className="w-11 h-11 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active-scale shadow-sm flex items-center justify-center text-lg"
                      title="تحميل القسيمة الفردية"
                    >
                      📄
                    </button>
                  </td>
                </tr>
              ))}
              {payrollData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center opacity-30">
                     <span className="text-6xl block mb-4 grayscale">💸</span>
                     <p className="text-lg font-black italic">لا توجد بيانات رواتب مطابقة للبحث.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
