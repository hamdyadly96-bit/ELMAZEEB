
import React, { useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { getTrainingRecommendations } from '../services/geminiService';

interface CareerProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  currentUserRole: UserRole;
}

const CareerDevelopment: React.FC<CareerProps> = ({ employees, setEmployees, currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'courses' | 'ai'>('matrix');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  
  // أهداف الشركة الاستراتيجية (يمكن تخزينها في الإعدادات لاحقاً)
  const [strategicGoals] = useState([
    "رفع كفاءة الأتمتة والتحول الرقمي بنسبة 30%",
    "تحسين جودة تجربة المستخدم في المنتجات التقنية",
    "تطوير القيادات الشابة لتولي مناصب إدارية"
  ]);

  const currentUser = employees.find(e => e.name.includes('أحمد')) || employees[0];

  const handleGetAIRecommendations = async () => {
    setLoadingAI(true);
    // سياق الأداء المتقدم
    const performanceContext = {
      scores: { quality: 9, speed: 7, communication: 8 },
      gaps: ["إدارة الأنظمة السحابية", "التفكير الاستراتيجي القيادي"],
      recentFeedback: "أداء تقني ممتاز ولكن يحتاج لتطوير مهارات التوجيه للفريق"
    };

    const result = await getTrainingRecommendations(currentUser, performanceContext, strategicGoals);
    setAiRecommendations(result);
    setLoadingAI(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">مركز التطوير والمهارات</h2>
          <p className="text-sm text-slate-500 font-medium">بناء الكفاءات المؤسسية وتخطيط التعاقب الوظيفي الذكي.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200">
          <button onClick={() => setActiveTab('matrix')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>المحفظة المهارية</button>
          <button onClick={() => setActiveTab('courses')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>الدورات التدريبية</button>
          <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'ai' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>مستشار التعلم ✨</button>
        </div>
      </header>

      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                 <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                 أهداف المنشأة الاستراتيجية
              </h3>
              <div className="space-y-4">
                {strategicGoals.map((goal, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-blue-600 font-black">0{i+1}</span>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">تخطيط التعاقب</p>
              <h4 className="text-xl font-black mb-4">أعلى الكفاءات الواعدة:</h4>
              <div className="flex -space-x-3 rtl:space-x-reverse mb-6">
                {employees.slice(0, 3).map(e => (
                  <img key={e.id} src={e.avatar} className="w-10 h-10 rounded-full border-4 border-slate-800 object-cover" title={e.name} />
                ))}
              </div>
              <p className="text-xs text-slate-400">هؤلاء الموظفين حققوا 90% من مهارات المستوى التالي.</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm">مصفوفة كفايات القسم</h3>
                  <button className="text-[10px] font-black text-blue-600">تحميل التقرير 📥</button>
               </div>
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">المهارات التقنية</th>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-center">مؤشر الجدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border" alt="" />
                          <span className="font-bold text-slate-800">{emp.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">AI Integration</span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-bold border border-indigo-100">Project Mgmt</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                            </div>
                            <span className="font-black text-[9px] text-emerald-600">85%</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-purple-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-purple-500/20">🧠</div>
                   <div>
                      <h3 className="text-2xl font-black">مستشار التعلم الاستراتيجي</h3>
                      <p className="text-slate-400 text-sm font-bold">توليد مسارات تعلم تربط طموحك برؤية الشركة</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-purple-400 uppercase">سياق الأداء الحالي</p>
                      <ul className="text-xs space-y-2 font-bold text-slate-300">
                         <li>• معدل إنجاز المهام: 92%</li>
                         <li>• نقاط القوة: التفكير التحليلي، العمل الجماعي</li>
                         <li>• فجوات التطوير: التقنيات السحابية (Cloud)</li>
                      </ul>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-blue-400 uppercase">التوجه الاستراتيجي</p>
                      <ul className="text-xs space-y-2 font-bold text-slate-300">
                         <li>• التحول نحو البنية السحابية</li>
                         <li>• أتمتة العمليات الإدارية</li>
                      </ul>
                   </div>
                </div>

                <button 
                  onClick={handleGetAIRecommendations}
                  disabled={loadingAI}
                  className="w-full md:w-auto bg-purple-600 text-white px-10 py-5 rounded-[1.75rem] font-black shadow-xl hover:bg-purple-700 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loadingAI ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> جاري تحليل البيانات...</>
                  ) : (
                    <>إنشاء خطة تطوير مخصصة ✨</>
                  )}
                </button>
             </div>
             <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.map((rec, i) => (
              <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-purple-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <span className={`px-3 py-1 rounded-xl text-[9px] font-black border ${
                      rec.priorityLevel === 'عالي' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                   }`}>{rec.priorityLevel || 'تطويري'}</span>
                   <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">🎓</div>
                </div>
                
                <h4 className="font-black text-slate-800 text-base mb-2">{rec.courseName}</h4>
                <p className="text-xs text-slate-400 font-bold mb-6 leading-relaxed flex-1">{rec.reason}</p>
                
                <div className="mt-auto space-y-4">
                   <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الربط الاستراتيجي 💹</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{rec.strategicAlignment}</p>
                   </div>
                   <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black active:scale-95 transition">اعتماد في خطتي ⬅️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerDevelopment;
