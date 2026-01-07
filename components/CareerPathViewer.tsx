
import React, { useMemo } from 'react';
import { Employee, CareerPath, CareerLevel } from '../types';

interface CareerPathViewerProps {
  employees: Employee[];
  careerPaths: CareerPath[];
}

const CareerPathViewer: React.FC<CareerPathViewerProps> = ({ employees, careerPaths }) => {
  // محاكاة الموظف الحالي (أحمد علي)
  const currentUser = employees.find(e => e.name === 'أحمد علي') || employees[0];
  
  const userPath = useMemo(() => {
    return careerPaths.find(p => p.id === currentUser.careerPathId);
  }, [careerPaths, currentUser]);

  const currentLevelIdx = useMemo(() => {
    if (!userPath) return -1;
    return userPath.levels.findIndex(lv => lv.id === currentUser.currentLevelId);
  }, [userPath, currentUser]);

  const currentLevel = userPath?.levels[currentLevelIdx];
  const nextLevel = userPath?.levels[currentLevelIdx + 1];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {!userPath ? (
        <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
           <span className="text-6xl mb-6 block">🚧</span>
           <h3 className="text-xl font-black text-slate-800 mb-2">المسار الوظيفي قيد الإعداد</h3>
           <p className="text-sm text-slate-400 font-bold px-10">لم يتم تعيين مسار وظيفي محدد لملفك حالياً. يرجى مراجعة إدارة الموارد البشرية لتخطيط نموك المهني.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Progress Tracker */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                 <header className="mb-10">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{userPath.name}</h3>
                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">المستوى الحالي: {currentLevel?.title}</p>
                 </header>

                 <div className="relative space-y-12">
                    {/* Path Line */}
                    <div className="absolute top-0 right-7 w-1 h-full bg-slate-50 -z-0"></div>
                    
                    {userPath.levels.map((lv, idx) => {
                      const isCompleted = idx < currentLevelIdx;
                      const isCurrent = idx === currentLevelIdx;
                      const isLocked = idx > currentLevelIdx;

                      return (
                        <div key={lv.id} className={`flex items-start gap-8 relative z-10 transition-all ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg flex-shrink-0 transition-transform duration-500 ${
                             isCompleted ? 'bg-emerald-500 text-white' : 
                             isCurrent ? 'bg-blue-600 text-white scale-110' : 
                             'bg-white border-2 border-slate-100 text-slate-300'
                           }`}>
                             {isCompleted ? '✓' : idx + 1}
                           </div>
                           
                           <div className={`flex-1 p-6 rounded-3xl border transition-all ${
                             isCurrent ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-100/50' : 'bg-slate-50/50 border-transparent'
                           }`}>
                              <div className="flex justify-between items-start mb-4">
                                 <h4 className="text-lg font-black text-slate-800">{lv.title}</h4>
                                 {isCurrent && <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-lg uppercase animate-pulse">أنت هنا</span>}
                              </div>
                              <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">{lv.description || 'وصف المستوى المهني والمسؤوليات المتوقعة.'}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">المهارات المستهدفة</p>
                                    <div className="flex flex-wrap gap-1.5">
                                       {lv.requiredSkills.map(s => (
                                          <span key={s} className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-600">{s}</span>
                                       ))}
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">متوسط الراتب</p>
                                    <p className="text-xs font-black text-slate-700">{lv.salaryRange.min.toLocaleString()} - {lv.salaryRange.max.toLocaleString()} ر.س</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>

           {/* Next Steps Card */}
           <div className="lg:col-span-4 space-y-6">
              {nextLevel && (
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24">
                   <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                      خطوتك القادمة ✨
                   </h3>
                   <div className="mb-8">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">الهدف القادم</p>
                      <h4 className="text-lg font-black">{nextLevel.title}</h4>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الدورات المطلوبة للترقية</p>
                         {nextLevel.requiredCourses.map(course => (
                            <div key={course} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                               <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-xl">🎓</div>
                               <div className="flex-1">
                                  <p className="text-xs font-black">{course}</p>
                                  <button className="text-[9px] font-bold text-blue-400 hover:underline">طلب التحاق الآن ⬅️</button>
                               </div>
                            </div>
                         ))}
                         {nextLevel.requiredCourses.length === 0 && (
                            <p className="text-xs text-slate-500 italic">لا توجد دورات إلزامية لهذا المستوى.</p>
                         )}
                      </div>

                      <div className="pt-6 border-t border-white/10">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase">جاهزية الترقية</span>
                            <span className="text-xs font-black text-blue-400">45%</span>
                         </div>
                         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[45%] transition-all duration-1000"></div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-10 p-4 bg-blue-600/20 rounded-2xl border border-blue-500/20">
                      <p className="text-[10px] text-blue-200 leading-relaxed font-bold">
                        💡 نصيحة: يفضل البدء بدورات القيادة لزيادة فرصك في الوصول لمستوى {nextLevel.title} خلال الربع القادم.
                      </p>
                   </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2"><span>📈</span> مهاراتك قيد التطوير</h3>
                 <div className="space-y-4">
                    {[
                      { name: 'React Context API', progress: 80 },
                      { name: 'System Design', progress: 30 },
                      { name: 'TypeScript Advanced', progress: 65 }
                    ].map(skill => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                           <span className="text-slate-600">{skill.name}</span>
                           <span className="text-blue-600">{skill.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600" style={{ width: `${skill.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CareerPathViewer;
