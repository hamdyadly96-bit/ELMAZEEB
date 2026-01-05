
import React, { useState, useEffect } from 'react';
// Fixed: Removed 'Course' import as it doesn't exist in the types.ts file.
import { Employee, Skill, UserRole } from '../types';
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
  
  // محاكاة الموظف الحالي للمشاهدة الفردية
  const currentUser = employees.find(e => e.name.includes('أحمد')) || employees[0];

  const handleGetAIRecommendations = async () => {
    setLoadingAI(true);
    // محاكاة بيانات الأداء للذكاء الاصطناعي
    const stats = { lateDays: 2, presentDays: 20, score: '85%' };
    const result = await getTrainingRecommendations(currentUser, stats);
    setAiRecommendations(result);
    setLoadingAI(false);
  };

  const skillsCategories = ['تقنية', 'قيادية', 'ناعمة'];

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
          {/* Skills Distribution Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                 <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                 توزيع مهارات الفريق
              </h3>
              <div className="space-y-5">
                {skillsCategories.map(cat => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-600">{cat}</span>
                      <span className="text-[10px] font-black text-blue-600">70% كفاءة</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">فجوة المهارات</p>
              <h4 className="text-xl font-black mb-4">أعلى المهارات المطلوبة حالياً:</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> إدارة المشاريع الرشيقة (Agile)
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> تحليل البيانات الضخمة
                </li>
              </ul>
            </div>
          </div>

          {/* Detailed Skills Matrix Table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">المهارات التقنية</th>
                    <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">المهارات الناعمة</th>
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
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">React</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">SQL</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-bold border border-emerald-100">التواصل</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black">A+</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard 
            title="إدارة الموارد البشرية الاستراتيجية" 
            provider="LinkedIn Learning" 
            duration="12 ساعة" 
            category="إدارية"
            status="متاح"
          />
          <CourseCard 
            title="أساسيات البرمجة بلغة TypeScript" 
            provider="Udemy" 
            duration="20 ساعة" 
            category="تقنية"
            status="متاح"
          />
          <CourseCard 
            title="الذكاء الاصطناعي في الأعمال" 
            provider="Coursera" 
            duration="15 ساعة" 
            category="تقنية"
            status="مكتمل"
          />
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">مساعدك المهني الذكي ✨</h3>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-xl mb-8">
                  بناءً على ملفك الوظيفي، تقييمات الأداء الأخيرة، وفجوات المهارات في قسمك؛ سيقوم الذكاء الاصطناعي برسم مسار تعلم مخصص لك.
                </p>
                <button 
                  onClick={handleGetAIRecommendations}
                  disabled={loadingAI}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-50 transition transform active:scale-95 disabled:opacity-50"
                >
                  {loadingAI ? 'جاري تحليل مسارك المهني...' : 'احصل على توصياتي الآن'}
                </button>
             </div>
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.length > 0 ? aiRecommendations.map((rec, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all group">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">🎓</div>
                <h4 className="font-black text-slate-800 text-sm mb-2">{rec.courseName}</h4>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed">{rec.reason}</p>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase">{rec.targetSkill}</span>
              </div>
            )) : !loadingAI && (
              <div className="col-span-full py-20 text-center opacity-30">
                <div className="text-6xl mb-4">🧠</div>
                <p className="text-xs font-bold text-slate-500 italic">اضغط على الزر أعلاه ليبدأ الذكاء الاصطناعي بالتحليل.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ title, provider, duration, category, status }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-500 rounded-xl border">{category}</span>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${status === 'مكتمل' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{status}</span>
    </div>
    <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">{title}</h4>
    <p className="text-xs text-slate-400 font-bold mb-6">بواسطة: {provider}</p>
    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
        <span>⏱️</span> {duration}
      </div>
      <button className="text-[10px] font-black text-blue-600 hover:underline">بدء التعلم ⬅️</button>
    </div>
  </div>
);

export default CareerDevelopment;
