
import React, { useMemo, useState, useEffect } from 'react';
import { Employee, SystemSettings, Branch, Document as DocType } from '../types';

interface DocTrackingProps {
  employees: Employee[];
  settings: SystemSettings;
  branches: Branch[];
}

const DocumentTracking: React.FC<DocTrackingProps> = ({ employees, settings, branches }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [zoomScale, setZoomScale] = useState(1);

  // استقبال طلبات المعاينة من المكونات الأخرى (مثل OrgManagement)
  useEffect(() => {
    const handleExternalPreview = (e: any) => {
      if (e.detail?.url) {
        setPreviewUrl(e.detail.url);
        setPreviewTitle(e.detail.title || 'معاينة وثيقة');
        setZoomScale(1);
      }
    };
    window.addEventListener('openPreview', handleExternalPreview);
    return () => window.removeEventListener('openPreview', handleExternalPreview);
  }, []);

  const allDocs = useMemo(() => {
    const docs: any[] = [];
    employees.forEach(emp => {
      emp.documents?.forEach(doc => {
        docs.push({ ...doc, ownerName: emp.name, ownerType: 'موظف', ownerId: emp.id });
      });
    });
    branches.forEach(branch => {
      branch.documents?.forEach(doc => {
        docs.push({ ...doc, ownerName: branch.name, ownerType: 'فرع', ownerId: branch.id });
      });
    });
    return docs.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [employees, branches]);

  const getStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { id: 'expired', label: 'منتهية', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', barColor: 'bg-rose-500', icon: '🚨' };
    if (diffDays <= settings.alertThresholdDays) return { id: 'expiring', label: 'تنبيه تجديد', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', barColor: 'bg-amber-500', icon: '⏳' };
    return { id: 'active', label: 'سارية المفعول', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', barColor: 'bg-emerald-500', icon: '✅' };
  };

  const stats = useMemo(() => {
    const counts = { active: 0, expiring: 0, expired: 0, total: allDocs.length };
    allDocs.forEach(doc => {
      const status = getStatus(doc.expiryDate);
      if (status.id === 'expired') counts.expired++;
      else if (status.id === 'expiring') counts.expiring++;
      else counts.active++;
    });
    const complianceScore = counts.total > 0 ? Math.round(((counts.active + counts.expiring) / counts.total) * 100) : 100;
    return { ...counts, complianceScore };
  }, [allDocs, settings.alertThresholdDays]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* نافذة المعاينة المتقدمة */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-lg z-[500] flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden relative shadow-2xl">
             <div className="p-8 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-200">📄</div>
                   <div>
                      <h3 className="font-black text-slate-800 text-xl leading-none">{previewTitle}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">معاينة المستند الرسمي</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 no-print">
                   <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 ml-4">
                      <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 transition" title="تصغير">➖</button>
                      <span className="px-4 flex items-center text-[11px] font-black text-slate-600 w-16 justify-center">%{Math.round(zoomScale * 100)}</span>
                      <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 transition" title="تكبير">➕</button>
                   </div>
                   <button onClick={() => setPreviewUrl(null)} className="w-14 h-14 flex items-center justify-center bg-slate-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-slate-200 text-xl font-bold">✕</button>
                </div>
             </div>
             
             <div className="flex-1 bg-slate-200/50 p-6 flex items-center justify-center overflow-auto custom-scrollbar relative">
                <div 
                  className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-w-full min-h-full"
                  style={{ transform: `scale(${zoomScale})` }}
                >
                  {previewUrl.startsWith('data:application/pdf') ? (
                     <iframe src={previewUrl} className="w-full h-[80vh] rounded-[2rem] border-0 bg-white shadow-2xl" title="PDF Preview"></iframe>
                  ) : (
                     <img src={previewUrl} className="max-w-full max-h-[85vh] object-contain rounded-[2rem] shadow-2xl border-[12px] border-white" alt="Preview" />
                  )}
                </div>
             </div>

             <div className="p-8 bg-white border-t flex justify-between items-center no-print">
                <button onClick={() => window.print()} className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition active-scale">طباعة المستند 🖨️</button>
                <a href={previewUrl} download={previewTitle} className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition active-scale">تحميل نسخة أصلية 📥</a>
             </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl">📂</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">مركز الأرشيف والرقابة الذكية</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">مراقبة سريان مفعول تراخيص الفروع ووثائق الكوادر البشرية.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المحفوظات</span>
           <span className="text-2xl font-black text-blue-600">{allDocs.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">نسبة الالتزام العامة</p>
               <p className="text-5xl font-black tracking-tighter">{stats.complianceScore}%</p>
               <div className="mt-8 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.complianceScore}%` }}></div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
          <StatCard label="سارية المفعول" count={stats.active} total={stats.total} variant="success" icon="🛡️" />
          <StatCard label="تنبيه تجديد" count={stats.expiring} total={stats.total} variant="warning" icon="⏳" />
          <StatCard label="منتهية الصلاحية" count={stats.expired} total={stats.total} variant="danger" icon="🚨" />
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">جهة الإصدار / المالك</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">نوع الوثيقة</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">تاريخ الانتهاء</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">حالة الصلاحية</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allDocs.map((doc, idx) => {
                  const status = getStatus(doc.expiryDate);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black shadow-sm ${doc.ownerType === 'فرع' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>{doc.ownerType}</span>
                          <div>
                             <div className="font-black text-slate-800 text-base group-hover:text-blue-600 transition-colors">{doc.ownerName}</div>
                             <div className="text-[10px] text-slate-300 font-bold uppercase mt-1">ID: #{doc.ownerId.slice(-5)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg shadow-inner">📄</span>
                            <span className="text-xs font-black text-slate-600">{doc.type}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8 text-center">
                         <span className="font-mono text-xs font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                           {doc.expiryDate}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <span className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] font-black border shadow-sm ${status.color}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center">
                        {doc.fileUrl ? (
                          <button 
                            onClick={() => { 
                              setPreviewUrl(doc.fileUrl!); 
                              setPreviewTitle(`${doc.type} - ${doc.ownerName}`); 
                              setZoomScale(1);
                            }}
                            className="w-14 h-14 bg-white border border-slate-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active-scale"
                            title="فتح المعاينة"
                          >
                             👁️
                          </button>
                        ) : (
                           <span className="text-[10px] text-slate-300 font-bold italic">لا يوجد ملف</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </table>
          {allDocs.length === 0 && (
             <div className="py-32 text-center opacity-30">
                <span className="text-8xl block mb-8 grayscale">📁</span>
                <p className="text-xl font-black italic">الأرشيف الرقمي فارغ حالياً</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, total, variant, icon }: any) => {
  const colors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-50',
    danger: 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50'
  };
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`p-10 rounded-[3rem] border ${colors[variant as keyof typeof colors]} flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-8">
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
            <p className="text-4xl font-black tracking-tighter">{count}</p>
         </div>
         <div className="text-4xl group-hover:scale-125 transition-transform">{icon}</div>
      </div>
      <div className="space-y-3">
         <div className="flex justify-between text-[10px] font-black opacity-50">
            <span>معدل الحيازة</span>
            <span>{percentage}%</span>
         </div>
         <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-current opacity-80" style={{ width: `${percentage}%` }}></div>
         </div>
      </div>
    </div>
  );
};

export default DocumentTracking;
