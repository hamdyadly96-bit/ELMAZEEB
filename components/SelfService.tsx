
import React, { useState } from 'react';
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
        alert(`تم تسجيل الحضور بنجاح! أسواق المعازيب تتمنى لك يوماً سعيداً.`);
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
    <div className="space-y-8 animate-in slide-up duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-[#1b3152] tracking-tight">بوابة الموظف الذكية</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">مرحباً {currentUser.name.split(' ')[0]}، كيف يمكننا مساعدتك في أسواق المعازيب اليوم؟</p>
        </div>
        <div className="flex gap-4">
          {!todayAttendance ? (
            <button 
              onClick={handleGPSClockIn}
              disabled={gpsLoading}
              className="px-8 py-4 bg-[#76bc43] text-white rounded-[1.75rem] font-black shadow-xl shadow-[#76bc43]/20 hover:bg-[#68a63a] transition-all flex items-center gap-3 active-scale"
            >
              <span className="text-xl">{gpsLoading ? '⏳' : '📍'}</span>
              <span>تسجيل بصمة الدخول</span>
            </button>
          ) : (
            <div className="px-8 py-4 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-[1.75rem] font-black flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-[10px] uppercase opacity-60">وقت الدخول</p>
                <p className="text-sm">{todayAttendance.clockIn}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm text-center relative overflow-hidden group">
            <div className="relative mt-2">
              <div className="w-28 h-28 rounded-[2.5rem] mx-auto p-1 bg-gradient-to-tr from-[#76bc43] to-[#1b3152] shadow-xl transform group-hover:rotate-3 transition-transform duration-500">
                <img src={currentUser.avatar} className="w-full h-full rounded-[2.25rem] object-cover border-4 border-white" alt="" />
              </div>
              <span className="absolute -bottom-1 right-1/2 translate-x-12 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white text-xs">✓</span>
            </div>
            <h3 className="text-2xl font-black text-[#1b3152] mt-6">{currentUser.name}</h3>
            <p className="text-xs font-black text-[#76bc43] uppercase tracking-widest mt-1">{currentUser.role}</p>
            
            <div className="mt-10 grid grid-cols-2 gap-4 text-right border-t border-slate-50 pt-8">
               <div className="bg-slate-50 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 mb-1">القسم</p>
                 <p className="text-xs font-black text-[#1b3152]">{currentUser.department}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 mb-1">الرقم الوظيفي</p>
                 <p className="text-xs font-black text-[#1b3152]">#{currentUser.id.slice(-4)}</p>
               </div>
            </div>
          </div>

          <div className="bg-[#1b3152] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-lg font-black mb-6 flex items-center gap-3">
                 <span className="w-1.5 h-6 bg-[#76bc43] rounded-full"></span>
                 أحدث التعميمات
               </h4>
               <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="text-xs font-black mb-1">خطة مبيعات رمضان القادمة</p>
                    <p className="text-[10px] opacity-40">منذ ساعتين • الإدارة العليا</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="text-xs font-black mb-1">تحديث جدول المناوبات للفرع الرئيسي</p>
                    <p className="text-[10px] opacity-40">منذ يوم • الموارد البشرية</p>
                  </div>
               </div>
             </div>
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#76bc43]/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceCard 
              title="تعريف بالراتب" 
              icon="📄" 
              desc="إصدار وتحميل شهادة تعريف رسمية" 
              onClick={() => { setRequestType('تعريف بالراتب'); setIsRequestModalOpen(true); }} 
              color="green"
            />
            <ServiceCard 
              title="طلب سلفة مالية" 
              icon="💰" 
              desc="تقديم طلب سلفة على الراتب القادم" 
              onClick={() => { setRequestType('طلب سلفة'); setIsRequestModalOpen(true); }} 
              color="navy"
            />
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <span className="text-2xl">📋</span>
                  <h4 className="text-lg font-black text-[#1b3152]">تتبع طلباتي الإدارية</h4>
               </div>
               <span className="px-4 py-1.5 bg-white border rounded-xl text-xs font-black text-[#76bc43]">
                 {myRequests.length} طلبات إجمالية
               </span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-5">
              {myRequests.length > 0 ? myRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-[#76bc43]/20 hover:bg-white transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">📑</div>
                    <div>
                      <p className="text-sm font-black text-[#1b3152]">{req.type}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">{req.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {req.amount && <span className="text-xs font-black text-slate-600 ml-4">{req.amount.toLocaleString()} ر.س</span>}
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black border-2 ${
                      req.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      req.status === 'مرفوض' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <span className="text-6xl mb-6">📁</span>
                  <p className="text-base font-black italic">لم تقم بتقديم أي طلبات حتى الآن.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-[#1b3152]/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 md:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-[#1b3152] mb-4">تقديم طلب جديد</h3>
            <p className="text-slate-500 mb-10 font-medium">املأ البيانات المطلوبة وسيتم الرد عليك خلال 24 ساعة.</p>
            
            <form onSubmit={handleSubmitRequest} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">نوع الخدمة المطلوبة</label>
                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-[#76bc43] rounded-3xl p-5 text-sm font-black outline-none transition" value={requestType} onChange={(e) => setRequestType(e.target.value as any)}>
                  <option value="تعريف بالراتب">تعريف بالراتب</option>
                  <option value="طلب سلفة">طلب سلفة مالية</option>
                  <option value="طلب عهدة">طلب عهدة عينية</option>
                  <option value="تحديث بيانات">تحديث بيانات شخصية</option>
                </select>
              </div>

              {(requestType === 'طلب سلفة' || requestType === 'طلب عهدة') && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">المبلغ (ريال سعودي)</label>
                  <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-[#76bc43] rounded-3xl p-5 text-sm font-black outline-none transition" value={requestAmount} onChange={(e) => setRequestAmount(Number(e.target.value))} required />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">مبررات الطلب / ملاحظات</label>
                <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-[#76bc43] rounded-3xl p-5 text-sm font-black outline-none transition" rows={4} value={requestDetails} onChange={(e) => setRequestDetails(e.target.value)} placeholder="اكتب مبرراتك هنا بوضوح..." required></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-[#1b3152] text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-[#13243d] transition-all active-scale">إرسال الطلب للاعتماد</button>
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black active-scale">تجاهل</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ title, icon, desc, onClick, color }: any) => (
  <button onClick={onClick} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-right hover:shadow-xl transition-all group flex items-center gap-6 active-scale">
    <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm ${color === 'green' ? 'bg-[#76bc43]/10 text-[#76bc43]' : 'bg-[#1b3152]/10 text-[#1b3152]'}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-black text-[#1b3152] text-base">{title}</h4>
      <p className="text-[11px] text-slate-400 font-bold mt-1">{desc}</p>
    </div>
  </button>
);

export default SelfService;
