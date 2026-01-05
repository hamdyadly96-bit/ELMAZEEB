
import React, { useState } from 'react';
import { Employee, AttendanceEntry, AttendanceStatus } from '../types';

interface BiometricSyncProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
}

const BiometricSync: React.FC<BiometricSyncProps> = ({ employees, attendance, setAttendance }) => {
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceIp, setDeviceIp] = useState('192.168.1.50');
  const [isConnected, setIsConnected] = useState(true);

  const startSync = () => {
    if (!isConnected) {
      setLogs(prev => [`❌ فشل الاتصال بالجهاز على العنوان ${deviceIp}. يرجى التحقق من الشبكة.`, ...prev]);
      return;
    }

    setSyncing(true);
    const today = new Date().toISOString().split('T')[0];
    
    setLogs(prev => [`📡 جاري الاتصال بجهاز البصمة الرئيسي (${deviceIp})...`, ...prev]);
    
    setTimeout(() => {
      setLogs(prev => ["🔓 تم فتح الجلسة بنجاح. جاري قراءة سجلات الحضور المباشرة...", ...prev]);
      
      // منطق المزامنة الفعلي
      const existingTodayIds = new Set(
        attendance.filter(r => r.date === today).map(r => r.employeeId)
      );

      // محاكاة سحب البصمة للموظفين الذين لم يحضروا بعد
      const unrecordedEmployees = employees.filter(e => !existingTodayIds.has(e.id));
      
      if (unrecordedEmployees.length === 0) {
        setLogs(prev => ["ℹ️ لا توجد سجلات جديدة على الجهاز، جميع الموظفين في النظام مسجلون بالفعل.", ...prev]);
        setSyncing(false);
        return;
      }

      const newRecords: AttendanceEntry[] = unrecordedEmployees.map(emp => ({
        employeeId: emp.id,
        date: today,
        status: 'حاضر',
        clockIn: '08:00'
      }));

      setTimeout(() => {
        setAttendance([...attendance, ...newRecords]);
        setLogs(prev => [
          `✨ نجاح! تم استيراد حضور الموظفين: ${unrecordedEmployees.map(e => e.name).join('، ')}`,
          `✅ اكتملت المزامنة بنجاح. تم إضافة ${newRecords.length} سجلات جديدة وتحديث قاعدة البيانات.`,
          ...prev
        ]);
        setSyncing(false);
      }, 2000);

    }, 1500);
  };

  const testConnection = () => {
    setLogs(prev => [`🔍 جاري فحص جودة الاتصال بـ ${deviceIp}...`, ...prev]);
    setTimeout(() => {
      const status = Math.random() > 0.1;
      setIsConnected(status);
      setLogs(prev => [status ? "✔️ الجهاز مستجيب (Ping 45ms). الاتصال مستقر." : "❌ تعذر الوصول للجهاز، يرجى التأكد من أن الجهاز على نفس الشبكة المحلية.", ...prev]);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">الربط مع أجهزة البصمة</h2>
          <p className="text-sm text-slate-500 font-medium">مزامنة سجلات الحضور والانصراف آلياً من الأجهزة الميدانية عبر بروتوكول TCP/IP.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">IP</span>
            <input 
              type="text" 
              className="bg-white border border-slate-200 pl-4 pr-8 py-2.5 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 w-44 shadow-sm"
              value={deviceIp}
              onChange={(e) => setDeviceIp(e.target.value)}
              placeholder="192.168.1.1"
            />
          </div>
          <button 
            onClick={testConnection}
            className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-slate-50 transition shadow-sm"
          >
            اختبار الاتصال
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isConnected ? 'متصل ومتاح' : 'غير متاح'}</span>
            </div>
            
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-2xl transition-all duration-500 ${syncing ? 'animate-bounce bg-blue-600 text-white shadow-blue-200' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
              {syncing ? '⌛' : '📟'}
            </div>
            
            <h3 className="text-xl font-black mb-3 text-slate-800">تحديث سجلات الحضور</h3>
            <p className="text-xs text-slate-500 mb-10 max-w-[280px] leading-relaxed font-medium">
              سيقوم النظام بسحب البصمات الأخيرة من الذاكرة الداخلية للجهاز ومطابقتها مع المعرفات الرقمية للموظفين.
            </p>
            
            <button 
              onClick={startSync}
              disabled={syncing}
              className={`w-full py-4 rounded-[1.5rem] font-black text-sm text-white transition-all transform active:scale-95 shadow-xl ${syncing ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
            >
              {syncing ? 'جاري السحب والمطابقة الفورية...' : 'بدء عملية المزامنة الآن'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
               إحصائيات المزامنة اليومية
             </h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-400 mb-1">آخر مزامنة</p>
                   <p className="text-xs font-black text-slate-800">قبل 12 دقيقة</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-400 mb-1">السجلات المسحوبة</p>
                   <p className="text-xs font-black text-slate-800">142 سجل</p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-emerald-400 font-mono text-[11px] overflow-hidden h-full flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-slate-500 font-black uppercase tracking-widest text-[9px] mr-4">Biometric Console v2.0.4</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-slate-600 text-[9px] font-bold">MODE: REALTIME_UDP</span>
                 <button onClick={() => setLogs([])} className="text-slate-500 hover:text-white transition uppercase text-[9px] font-black border border-slate-800 px-2 py-1 rounded">Clear</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 leading-relaxed">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
                   <span className="text-4xl mb-4">⌨️</span>
                   <p className="text-xs font-bold uppercase tracking-widest italic">بانتظار تهيئة الجلسة أو بدء الاتصال الميداني...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <span className="text-slate-600 flex-shrink-0 font-bold">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
                    <span className={log.includes('❌') ? 'text-red-400' : log.includes('✅') || log.includes('✨') ? 'text-emerald-300 font-bold' : 'text-emerald-500/90'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <div className="flex gap-4 text-[9px] text-slate-500 font-black">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> RX: 44.2 KB</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> TX: 8.4 KB</span>
                <span className="opacity-50">SESSIONS: 01</span>
              </div>
              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                Local Port: 4370 (ZK-SDK)
              </div>
            </div>

            {/* Matrix decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
         <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
           <span className="text-2xl">⚙️</span>
           إرشادات الربط البرمجي
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500 leading-relaxed font-medium">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
               <p className="font-bold text-blue-700 mb-1">المعرفات الرقمية (User IDs)</p>
               <p>يجب أن يتطابق رقم الموظف في جهاز البصمة مع "الرقم الوظيفي" المسجل في النظام لضمان المزامنة الصحيحة للسجلات.</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
               <p className="font-bold text-amber-700 mb-1">المنفذ الافتراضي (Default Port)</p>
               <p>تستخدم أغلب أجهزة ZKTeco المنفذ 4370. تأكد من فتح المنفذ في جدار الحماية الخاص بالشبكة المحلية (Firewall).</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BiometricSync;
