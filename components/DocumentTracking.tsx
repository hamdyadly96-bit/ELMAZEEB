
import React, { useMemo, useState } from 'react';
import { Employee, SystemSettings, Document as EmployeeDoc } from '../types';

interface DocTrackingProps {
  employees: Employee[];
  settings: SystemSettings;
}

const DocumentTracking: React.FC<DocTrackingProps> = ({ employees, settings }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const docs = useMemo(() => {
    const allDocs: any[] = [];
    employees.forEach(emp => {
      emp.documents?.forEach(doc => {
        allDocs.push({ ...doc, empName: emp.name, empId: emp.id });
      });
    });
    return allDocs.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [employees]);

  const getStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { id: 'expired', label: 'منتهية', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', barColor: 'bg-rose-500', icon: '🚨' };
    if (diffDays <= settings.alertThresholdDays) return { id: 'expiring', label: 'تنتهي قريباً', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', barColor: 'bg-amber-500', icon: '⏳' };
    return { id: 'active', label: 'سارية المفعول', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', barColor: 'bg-emerald-500', icon: '✅' };
  };

  const stats = useMemo(() => {
    const counts = { active: 0, expiring: 0, expired: 0, total: docs.length };
    docs.forEach(doc => {
      const status = getStatus(doc.expiryDate);
      if (status.id === 'expired') counts.expired++;
      else if (status.id === 'expiring') counts.expiring++;
      else counts.active++;
    });
    
    const complianceScore = counts.total > 0 
      ? Math.round(((counts.active + counts.expiring) / counts.total) * 100) 
      : 100;

    return { ...counts, complianceScore };
  }, [docs, settings.alertThresholdDays]);

  const openPreview = (fileUrl: string, type: string, empName: string) => {
    setPreviewUrl(fileUrl);
    setPreviewTitle(`${type} - ${empName}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* مودال المعاينة الداخلي */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-full flex flex-col overflow-hidden relative shadow-2xl">
             <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">📄</div>
                   <h3 className="font-black text-slate-800">{previewTitle}</h3>
                </div>
                <button onClick={() => setPreviewUrl(null)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-500 transition active-scale">✕</button>
             </div>
             <div className="flex-1 bg-slate-50 p-4 md:p-8 flex items-center justify-center overflow-auto custom-scrollbar">
                {previewUrl.startsWith('data:application/pdf') ? (
                   <iframe src={previewUrl} className="w-full h-full rounded-2xl border-0 shadow-lg" title="PDF Preview"></iframe>
                ) : (
                   <img src={previewUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl border-4 border-white" alt="Document Preview" />
                )}
             </div>
             <div className="p-4 bg-white border-t flex justify-end gap-3">
                <a href={previewUrl} download={previewTitle} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 active-scale">تحميل نسخة 📥</a>
                <button onClick={() => setPreviewUrl(null)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black active-scale">إغلاق المعاينة</button>
             </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">📂</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الأرشيف الرقمي</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">مراقبة صلاحية الوثائق القانونية والشهادات المهنية لجميع الكوادر.</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase">عتبة التنبيه</span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg font-black text-xs border border-amber-100">{settings.alertThresholdDays} يوم</span>
        </div>
      </header>

      <section className="relative">
        <div className="flex items-center gap-2 mb-6 px-2">
           <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">ملخص حالة الامتثال</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">إجمالي الوثائق</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{stats.total}</span>
                  <span className="text-xs text-slate-400 font-bold">ملف مؤرشف</span>
                </div>
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.complianceScore}%` }}></div>
                   </div>
                   <span className="text-[10px] font-black text-blue-400">{stats.complianceScore}% آمن</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <StatCard label="وثائق سارية" count={stats.active} total={stats.total} variant="success" description="مستندات محدثة ولا تتطلب إجراء" icon="🛡️" />
          <StatCard label="تنتهي قريباً" count={stats.expiring} total={stats.total} variant="warning" description="تحتاج تجديد خلال أيام العمل القادمة" icon="⏳" />
          <StatCard label="وثائق منتهية" count={stats.expired} total={stats.total} variant="danger" description="مخاطر قانونية تتطلب معالجة فورية" icon="🚨" />
        </div>
      </section>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
           <h4 className="text-sm font-black text-slate-800">سجل التفاصيل الكامل</h4>
           <div className="flex gap-2">
              <span className="px-3 py-1 bg-white border rounded-lg text-[10px] font-bold text-slate-500">فلترة ذكية مفعّلة</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[750px]">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الموظف المعني</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">تصنيف الوثيقة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">تاريخ الانتهاء</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة الحالية</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.map((doc, idx) => {
                const status = getStatus(doc.expiryDate);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{doc.empName}</div>
                      <div className="text-[10px] text-slate-400 font-bold">المعرف: #{doc.empId.slice(-5)}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm shadow-inner group-hover:bg-blue-50 transition-colors">📄</div>
                        <span className="text-xs font-black text-slate-600">{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-black text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-xl inline-block">
                        {doc.expiryDate}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black border ${status.color} shadow-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {doc.fileUrl && (
                          <button 
                            onClick={() => openPreview(doc.fileUrl, doc.type, doc.empName)}
                            className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition flex items-center justify-center shadow-sm"
                            title="معاينة الملف"
                          >
                            👁️
                          </button>
                        )}
                        <button className="px-4 h-10 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100">
                          طلب تحديث
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {docs.length === 0 && (
            <div className="p-24 text-center">
              <div className="text-7xl mb-6 grayscale opacity-20">📂</div>
              <h5 className="text-lg font-black text-slate-300 italic">الأرشيف فارغ حالياً</h5>
              <p className="text-xs text-slate-400 font-bold mt-2">لا توجد وثائق مسجلة لمطابقتها بالنظام.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, total, variant, description, icon }: { label: string, count: number, total: number, variant: 'success' | 'warning' | 'danger', description: string, icon: string }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/20'
  };

  const barStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500'
  };

  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative flex flex-col`}>
       <div className="flex justify-between items-start mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-500 group-hover:rotate-12 ${styles[variant]}`}>
            {icon}
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
             <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{count}</p>
          </div>
       </div>
       
       <p className="text-[10px] text-slate-400 font-bold mb-6 flex-1">{description}</p>
       
       <div className="space-y-2">
          <div className="flex justify-between text-[9px] font-black text-slate-400">
             <span>معدل الانتشار</span>
             <span>{percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-1000 ${barStyles[variant]}`} 
               style={{ width: `${percentage}%` }}
             ></div>
          </div>
       </div>
    </div>
  );
};

export default DocumentTracking;
