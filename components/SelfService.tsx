
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Employee, FinancialAdjustment, SystemSettings, ServiceRequest, AttendanceEntry } from '../types';

interface SelfServiceProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  adjustments: FinancialAdjustment[];
  settings: SystemSettings;
  requests: ServiceRequest[];
  setRequests: (reqs: ServiceRequest[]) => void;
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
  personalNotifications: any[];
}

const SelfService: React.FC<SelfServiceProps> = ({ employees, setEmployees, adjustments, settings, requests, setRequests, attendance, setAttendance, personalNotifications }) => {
  const currentUser = employees.find(e => e.name.includes('سلمان')) || employees[employees.length - 1];
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<ServiceRequest['type']>('تعريف بالراتب');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestAmount, setRequestAmount] = useState<number>(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  if (!currentUser) return null;

  const myRequests = requests.filter(r => r.employeeId === currentUser.id);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.employeeId === currentUser.id && a.date === today);

  const handleGPSClockIn = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع الجغرافي.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRecord: AttendanceEntry = {
          employeeId: currentUser.id,
          date: today,
          status: 'حاضر',
          clockIn: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          location: { lat: latitude, lng: longitude }
        };
        setAttendance([...attendance, newRecord]);
        setGpsLoading(false);
        alert(`تم تسجيل الحضور بنجاح! الموقع: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        alert("فشل في الحصول على موقعك. يرجى تفعيل GPS.");
        setGpsLoading(false);
      }
    );
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ServiceRequest = {
      id: Date.now().toString(),
      employeeId: currentUser.id,
      type: requestType,
      details: requestDetails,
      amount: requestType === 'طلب سلفة' || requestType === 'طلب عهدة' ? requestAmount : undefined,
      status: 'معلق',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRequests([newReq, ...requests]);
    setIsRequestModalOpen(false);
    setRequestDetails('');
    setRequestAmount(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* نافذة المعاينة السريعة */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-10 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-full flex flex-col overflow-hidden shadow-2xl relative">
             <div className="p-6 border-b flex justify-between items-center bg-white">
                <h3 className="font-black text-slate-800">معاينة وثيقتك الشخصية</h3>
                <button onClick={() => setPreviewDocUrl(null)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-500 transition active-scale">✕</button>
             </div>
             <div className="flex-1 bg-slate-50 p-4 flex items-center justify-center overflow-auto custom-scrollbar">
                {previewDocUrl.startsWith('data:application/pdf') ? (
                   <iframe src={previewDocUrl} className="w-full h-full rounded-2xl border-0 shadow-lg" title="Doc"></iframe>
                ) : (
                   <img src={previewDocUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl" alt="Doc" />
                )}
             </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">بوابة الموظف الرقمية</h2>
          <p className="text-sm text-slate-500 font-medium">مرحباً {currentUser.name.split(' ')[0]}، خدماتك الإدارية في مكان واحد.</p>
        </div>
        <div className="flex gap-3">
          {!todayAttendance ? (
            <button 
              onClick={handleGPSClockIn}
              disabled={gpsLoading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <span>{gpsLoading ? '⏳' : '📍'}</span>
              <span>بصمة حضور (GPS)</span>
            </button>
          ) : (
            <div className="px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-xs flex items-center gap-2">
              <span>✅</span>
              <span>تم تسجيل الحضور: {todayAttendance.clockIn}</span>
            </div>
          )}
        </div>
      </header>

      {personalNotifications.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {personalNotifications.map((n, i) => (
            <div key={i} className={`p-5 rounded-[2rem] border flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-slow ${n.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
              <div className="flex items-center gap-4 text-center sm:text-right">
                <span className="text-3xl">{n.type === 'critical' ? '🚨' : '⏳'}</span>
                <div>
                   <p className="font-black text-sm">{n.title}</p>
                   <p className="text-xs font-bold opacity-75">{n.message}</p>
                </div>
              </div>
              <button className={`px-6 py-2.5 rounded-xl font-black text-[10px] shadow-sm transition-all whitespace-nowrap ${n.type === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                تحديث الوثيقة الآن
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
            <div className="relative mt-4">
              <img src={currentUser.avatar} className="w-24 h-24 rounded-3xl mx-auto border-4 border-slate-50 shadow-md object-cover" alt="" />
              <span className="absolute bottom-0 right-1/2 translate-x-6 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></span>
            </div>
            <h3 className="text-lg font-black text-slate-800 mt-4">{currentUser.name}</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{currentUser.role}</p>
            
            <div className="mt-6 space-y-3 text-right border-t border-slate-50 pt-6">
              <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">القسم:</span> <span className="text-slate-700">{currentUser.department}</span></div>
              <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">الفرع:</span> <span className="text-slate-700">{currentUser.branch}</span></div>
              <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">تاريخ التعيين:</span> <span className="text-slate-700">{currentUser.joinDate}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><span>📂</span> وثائقي المرفوعة</h4>
             <div className="space-y-3">
                {currentUser.documents?.map(doc => (
                   <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition group cursor-pointer" onClick={() => doc.fileUrl && setPreviewDocUrl(doc.fileUrl)}>
                      <div>
                        <p className="text-[11px] font-black text-slate-700">{doc.type}</p>
                        <p className="text-[9px] text-slate-400 font-bold">ينتهي: {doc.expiryDate}</p>
                      </div>
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity">👁️</div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ServiceCard title="تعريف بالراتب" icon="📜" desc="تحميل شهادة تعريف رسمية" onClick={() => { setRequestType('تعريف بالراتب'); setIsRequestModalOpen(true); }} />
            <ServiceCard title="طلب سلفة / عهدة" icon="💸" desc="طلب مالي أو عهدة عينية" onClick={() => { setRequestType('طلب سلفة'); setIsRequestModalOpen(true); }} />
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-[350px] flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <h4 className="text-sm font-black text-slate-800">تتبع طلباتي</h4>
               <span className="text-[10px] bg-white px-2 py-1 rounded-lg border font-bold">الكل ({myRequests.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {myRequests.length > 0 ? myRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">📑</div>
                    <div>
                      <p className="text-xs font-black text-slate-800">{req.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{req.createdAt}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black border ${
                    req.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    req.status === 'مرفوض' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {req.status}
                  </span>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <span className="text-4xl mb-4">📂</span>
                  <p className="text-xs font-bold italic">لا توجد طلبات سابقة.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">تقديم {requestType}</h3>
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">نوع الطلب</label>
                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={requestType} onChange={(e) => setRequestType(e.target.value as any)}>
                  <option value="تعريف بالراتب">تعريف بالراتب</option>
                  <option value="طلب سلفة">طلب سلفة مالية</option>
                  <option value="طلب عهدة">طلب عهدة عينية</option>
                  <option value="تحديث بيانات">تحديث بيانات شخصية</option>
                </select>
              </div>

              {(requestType === 'طلب سلفة' || requestType === 'طلب عهدة') && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">المبلغ المطلوب (ريال)</label>
                  <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" value={requestAmount} onChange={(e) => setRequestAmount(Number(e.target.value))} required />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تفاصيل إضافية / المبررات</label>
                <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold" rows={4} value={requestDetails} onChange={(e) => setRequestDetails(e.target.value)} placeholder="يرجى كتابة التفاصيل هنا..." required></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95">إرسال الطلب للاعتماد</button>
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ title, icon, desc, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-right hover:border-blue-200 transition group flex items-center gap-4 active-scale">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-sm">{icon}</div>
    <div>
      <h4 className="font-black text-slate-800 text-sm">{title}</h4>
      <p className="text-[10px] text-slate-400 font-bold">{desc}</p>
    </div>
  </button>
);

export default SelfService;
