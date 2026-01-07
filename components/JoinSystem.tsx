import React, { useState, useRef } from 'react';
import { Invitation, Employee, EmployeeStatus, SystemSettings, Document as EmployeeDoc } from '../types';
import { extractEmployeeDataFromDocument } from '../services/geminiService';

interface JoinSystemProps {
  invitation: Invitation;
  settings: SystemSettings;
  onJoin: (newEmployee: Employee) => void;
}

const JoinSystem: React.FC<JoinSystemProps> = ({ invitation, settings, onJoin }) => {
  const [step, setStep] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    iban: '',
    password: '',
    isSaudi: true,
    gender: 'ذكر' as 'ذكر' | 'أنثى',
    customFields: {} as any,
    documents: [] as EmployeeDoc[]
  });

  const handleJoinFinal = () => {
    // Fixed: Added missing required 'gender' property to Employee interface.
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: formData.name,
      email: invitation.email,
      role: invitation.role,
      userRole: 'EMPLOYEE',
      department: invitation.department,
      branch: invitation.branch,
      salary: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: EmployeeStatus.ACTIVE,
      avatar: `https://picsum.photos/seed/${invitation.email}/200`,
      isSaudi: formData.isSaudi,
      gender: formData.gender,
      phone: formData.phone,
      iban: formData.iban,
      documents: formData.documents,
      customFields: formData.customFields,
      onboardingTasks: [
        { id: 'profile', label: 'إكمال ملف البيانات الشخصية', completed: true },
        { id: 'docs', label: 'رفع الوثائق الرسمية', completed: formData.documents.length > 0 },
        { id: 'policy', label: 'الموافقة على سياسة العمل', completed: false },
        { id: 'tour', label: 'جولة تعريفية في النظام', completed: false }
      ]
    };
    onJoin(newEmp);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const newDoc: EmployeeDoc = {
            id: Date.now().toString(),
            type: formData.isSaudi ? 'أخرى' : 'إقامة',
            expiryDate: data.expiryDate || '',
            fileUrl: fullDataUrl
          };
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            iban: data.iban || prev.iban,
            documents: [...prev.documents, newDoc]
          }));
        }
      } catch (error) {
        console.error("AI extraction failed during onboarding", error);
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const steps = [
    { id: 1, label: 'البيانات الأساسية', icon: '👤' },
    { id: 2, label: 'الوثائق الثبوتية', icon: '📄' },
    { id: 3, label: 'تأكيد الحساب', icon: '✨' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 w-full max-w-2xl overflow-hidden relative">
        {/* Progress Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                  step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 text-white/40'
                }`}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] font-bold ${step >= s.id ? 'text-white' : 'text-white/30'}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-2"></div>
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
              <header className="text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-2">أهلاً بك في الفريق!</h1>
                <p className="text-slate-500 font-medium">لنبدأ بتجهيز ملفك الشخصي في {settings.companyName}</p>
              </header>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">الاسم الكامل (كما في الهوية)</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition"
                    placeholder="محمد علي صالح..."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">رقم الجوال</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition"
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">رقم الآيبان (IBAN)</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition font-mono"
                      placeholder="SA..."
                      value={formData.iban}
                      onChange={e => setFormData({...formData, iban: e.target.value})}
                    />
                  </div>
                </div>
                {/* Fixed: Added gender selection and placed it in a grid with isSaudi checkbox */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">الجنس</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-black outline-none transition"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value as any})}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mt-6">
                    <input 
                      type="checkbox" 
                      id="isSaudi"
                      className="w-5 h-5 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500"
                      checked={formData.isSaudi}
                      onChange={e => setFormData({...formData, isSaudi: e.target.checked})}
                    />
                    <label htmlFor="isSaudi" className="text-sm font-black text-blue-800 cursor-pointer">أنا مواطن سعودي 🇸🇦</label>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-600 transition-all disabled:opacity-30 transform active:scale-95"
              >
                متابعة الخطوات ⬅️
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 text-center">
              <header>
                <h2 className="text-2xl font-black text-slate-800 mb-2">رفع الوثائق الرسمية</h2>
                <p className="text-sm text-slate-500 font-medium">ارفع صورة من الهوية/الإقامة وسيقوم النظام بتعبئة البيانات آلياً.</p>
              </header>

              <div className="relative group">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className={`w-full border-4 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center transition-all ${
                    isExtracting ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  {isExtracting ? (
                    <>
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      <p className="font-black text-blue-600 animate-pulse">جاري قراءة بيانات الوثيقة...</p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-4">📸</div>
                      <p className="text-lg font-black text-slate-700">اضغط لرفع صورة الهوية</p>
                      <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">يدعم صور (JPG, PNG) وملفات (PDF)</p>
                    </>
                  )}
                </button>
              </div>

              {formData.documents.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-300">
                  <span className="text-2xl">✅</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-800">تم استلام الوثيقة بنجاح</p>
                    <p className="text-[10px] text-emerald-600 font-bold">يمكنك إضافة المزيد لاحقاً من لوحة التحكم الخاصة بك.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-600 transition transform active:scale-95"
                >
                  تأكيد البيانات ⬅️
                </button>
                <button onClick={() => setStep(1)} className="flex-1 text-slate-400 text-xs font-bold hover:text-slate-600">رجوع</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <header className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">أنت الآن جاهز للانضمام!</h2>
                <p className="text-sm text-slate-500 font-medium">يرجى تعيين كلمة مرور لحسابك الوظيفي الجديد.</p>
              </header>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">كلمة المرور الجديدة</label>
                  <input 
                    type="password"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-sm font-bold outline-none transition"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-400 leading-relaxed font-bold">
                  💡 تلميح: عند تسجيل الدخول، ستظهر لك قائمة مهام لتهيئتك وتعريفك بنظام الشركة وسياساتها الداخلية.
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleJoinFinal}
                  disabled={!formData.password}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-30"
                >
                  بدأ رحلتي في المنظومة ✨
                </button>
                <button onClick={() => setStep(2)} className="flex-1 text-slate-400 text-xs font-bold hover:text-slate-600">رجوع</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinSystem;