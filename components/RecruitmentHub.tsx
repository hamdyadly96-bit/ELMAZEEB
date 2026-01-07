
import React, { useState, useMemo } from 'react';
import { JobOpening, Candidate, SystemSettings } from '../types';
import { analyzeResumeMatching } from '../services/geminiService';

const RecruitmentHub: React.FC<{ settings: SystemSettings }> = ({ settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'openings' | 'candidates'>('openings');
  const [jobs, setJobs] = useState<JobOpening[]>([
    { id: 'job_1', title: 'مطور واجهات أمامية', department: 'التطوير', location: 'الرياض', type: 'دوام كامل', status: 'نشط', description: 'خبير في React و Tailwind CSS', createdAt: '2024-05-10' },
    { id: 'job_2', title: 'محاسب مالي', department: 'المالية', location: 'جدة', type: 'دوام كامل', status: 'نشط', description: 'إجادة العمل على ERP و Excel', createdAt: '2024-05-12' }
  ]);
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 'c1', jobId: 'job_1', name: 'خالد المنصور', email: 'khaled@example.com', phone: '0511111111', status: 'مقابلة', aiScore: 85, aiFeedback: 'مناسب جداً من الناحية التقنية.', createdAt: '2024-05-15' },
    { id: 'c2', jobId: 'job_1', name: 'نورة السعد', email: 'noura@example.com', phone: '0522222222', status: 'جديد', aiScore: 72, aiFeedback: 'تحتاج لخبرة أكثر في TypeScript.', createdAt: '2024-05-16' }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStatusChange = (candidateId: string, newStatus: Candidate['status']) => {
    setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">مركز استقطاب المواهب (ATS)</h2>
          <p className="text-sm text-slate-500 font-medium">إدارة الشواغر الوظيفية وتتبع رحلة المتقدمين المدعومة بالذكاء الاصطناعي.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => setActiveSubTab('openings')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'openings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>الوظائف النشطة</button>
          <button onClick={() => setActiveSubTab('candidates')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'candidates' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>المتقدمون</button>
        </div>
      </header>

      {activeSubTab === 'openings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">💼</div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100">{job.status}</span>
               </div>
               <h3 className="text-lg font-black text-slate-800 mb-1">{job.title}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{job.department} • {job.location}</p>
               <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400">نُشرت في: {job.createdAt}</p>
                  <span className="text-[10px] font-black text-blue-600 underline cursor-pointer">إدارة الشاغر ←</span>
               </div>
            </div>
          ))}
          <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-blue-400 transition-all active-scale">
             <span className="text-3xl mb-2">➕</span>
             <span className="text-xs font-black">إضافة وظيفة جديدة</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/50 border-b">
              <tr>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest">المتقدم</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest">الوظيفة</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-center">مطابقة الذكاء الاصطناعي</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {candidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{candidate.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{candidate.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-600">{jobs.find(j => j.id === candidate.jobId)?.title}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl font-black border border-purple-100">
                       <span className="text-sm">{candidate.aiScore}%</span>
                       <span className="text-[10px]">✨</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                      candidate.status === 'عرض عمل' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      candidate.status === 'مرفوض' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                       <button onClick={() => handleStatusChange(candidate.id, 'مقابلة')} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm">📞</button>
                       <button onClick={() => handleStatusChange(candidate.id, 'مرفوض')} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecruitmentHub;
