
import React, { useState, useMemo } from 'react';
import { Employee, PeerFeedback } from '../types';

interface PeerFeedbackProps {
  employees: Employee[];
  feedback: PeerFeedback[];
  setFeedback: (f: PeerFeedback[]) => void;
}

const PeerFeedbackSection: React.FC<PeerFeedbackProps> = ({ employees, feedback, setFeedback }) => {
  // محاكاة الموظف الحالي (سلمان)
  const currentUser = employees.find(e => e.name.includes('سلمان')) || employees[0];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    toEmployeeId: '',
    skillName: 'التواصل الفعال',
    rating: 5,
    comment: ''
  });

  const skills = ['التواصل الفعال', 'القيادة', 'جودة العمل', 'روح الفريق', 'الإبداع', 'حل المشكلات'];

  const receivedFeedback = useMemo(() => 
    feedback.filter(f => f.toEmployeeId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [feedback, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.toEmployeeId || !newFeedback.comment) return;

    const entry: PeerFeedback = {
      id: Date.now().toString(),
      fromEmployeeId: currentUser.id,
      toEmployeeId: newFeedback.toEmployeeId,
      skillName: newFeedback.skillName,
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      date: new Date().toISOString().split('T')[0]
    };

    setFeedback([entry, ...feedback]);
    setIsModalOpen(false);
    setNewFeedback({ toEmployeeId: '', skillName: 'التواصل الفعال', rating: 5, comment: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">صوت الفريق 🤝</h2>
          <p className="text-sm text-slate-500 font-medium">شارك زملاءك الإشادة والتقدير، وابنِ ثقافة النمو المشترك.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-[1.75rem] font-black text-xs shadow-xl active-scale flex items-center gap-2"
        >
          <span>✨</span> تقديم إشادة لزميل
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ملخص المهارات */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#1b3152] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-lg font-black mb-6">قوة مهاراتك (من الزملاء)</h3>
              <div className="space-y-5">
                 {skills.slice(0, 4).map(skill => {
                   const skillFeedback = receivedFeedback.filter(f => f.skillName === skill);
                   const avg = skillFeedback.length > 0 ? (skillFeedback.reduce((a, b) => a + b.rating, 0) / skillFeedback.length) : 0;
                   return (
                     <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black opacity-60">
                           <span>{skill}</span>
                           <span>{avg.toFixed(1)} / 5</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-[#76bc43] transition-all duration-1000" style={{ width: `${(avg / 5) * 100}%` }}></div>
                        </div>
                     </div>
                   );
                 })}
              </div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#76bc43]/10 rounded-full blur-2xl"></div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">آخر إحصائيات التقدير</h4>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                 <span className="text-[10px] font-black">إجمالي الإشادات المستلمة</span>
                 <span className="text-xl font-black text-blue-600">{receivedFeedback.length}</span>
              </div>
           </div>
        </div>

        {/* قائمة التقييمات */}
        <div className="lg:col-span-2 space-y-4">
           {receivedFeedback.length > 0 ? receivedFeedback.map(f => {
              const fromEmp = employees.find(e => e.id === f.fromEmployeeId);
              return (
                <div key={f.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-100 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                         <img src={fromEmp?.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50" alt="" />
                         <div>
                            <p className="text-xs font-black text-slate-800">إشادة من {fromEmp?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{f.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                           <span key={i} className={`text-sm ${i < f.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                         ))}
                      </div>
                   </div>
                   <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                      <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">المهارة المتميزة: {f.skillName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-bold italic">"{f.comment}"</p>
                   </div>
                </div>
              );
           }) : (
             <div className="h-64 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="text-5xl mb-4">🗣️</span>
                <p className="text-sm font-black">لا توجد إشادات من الزملاء حالياً.</p>
                <p className="text-[10px] mt-1 font-bold">ابدأ بإرسال أول تقييم لزملائك لتفعيل ثقافة التقدير!</p>
             </div>
           )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-[#1b3152] mb-4">تقديم إشادة لزميل ✨</h3>
              <p className="text-xs text-slate-500 font-bold mb-10">اختر زميلك والمهارة التي أبدع فيها اليوم.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">اختر الزميل</label>
                    <select 
                      className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newFeedback.toEmployeeId}
                      onChange={e => setNewFeedback({...newFeedback, toEmployeeId: e.target.value})}
                      required
                    >
                       <option value="">-- اختر من القائمة --</option>
                       {employees.filter(e => e.id !== currentUser.id).map(e => (
                         <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                       ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">نوع المهارة</label>
                       <select 
                         className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none"
                         value={newFeedback.skillName}
                         onChange={e => setNewFeedback({...newFeedback, skillName: e.target.value})}
                       >
                          {skills.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">التقييم (النجوم)</label>
                       <select 
                         className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-black outline-none"
                         value={newFeedback.rating}
                         onChange={e => setNewFeedback({...newFeedback, rating: Number(e.target.value)})}
                       >
                          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} نجوم</option>)}
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">كلمة تقدير</label>
                    <textarea 
                      className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-sm font-bold outline-none h-32"
                      placeholder="اكتب ملاحظاتك الإيجابية هنا..."
                      value={newFeedback.comment}
                      onChange={e => setNewFeedback({...newFeedback, comment: e.target.value})}
                      required
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.75rem] font-black shadow-xl hover:bg-blue-700 active-scale">إرسال التقدير 🚀</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.75rem] font-black active-scale">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PeerFeedbackSection;
