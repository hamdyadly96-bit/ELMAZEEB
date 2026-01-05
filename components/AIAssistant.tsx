
import React, { useState } from 'react';
import { getHRInsights, generateJobDescription } from '../services/geminiService';
import { Employee } from '../types';

interface AIAssistantProps {
  employees: Employee[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ employees }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleGetInsights = async () => {
    setLoading(true);
    const result = await getHRInsights(employees);
    setInsight(result);
    setLoading(false);
  };

  const handleGenerateJD = async () => {
    if (!jobRole) return;
    setLoading(true);
    const result = await generateJobDescription(jobRole);
    if (result) setJobDescription(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">المساعد الذكي للموارد البشرية</h2>
        <p className="text-slate-500">استخدم قوة الذكاء الاصطناعي لتحليل بياناتك وإنجاز مهامك بسرعة.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analytics Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="text-lg font-bold text-slate-800">تحليل القوى العاملة</h3>
              <p className="text-xs text-slate-500">تحليل تلقائي لهيكل الرواتب وتوزيع الأقسام.</p>
            </div>
          </div>
          <button
            onClick={handleGetInsights}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'جاري التحليل...' : 'توليد تقرير ذكي'}
            <span>✨</span>
          </button>
          {insight && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl text-slate-700 leading-relaxed whitespace-pre-line border border-blue-100">
              {insight}
            </div>
          )}
        </div>

        {/* Job Description Generator */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📝</span>
            <div>
              <h3 className="text-lg font-bold text-slate-800">منشئ الوصف الوظيفي</h3>
              <p className="text-xs text-slate-500">اكتب اسم الوظيفة وسيقوم المساعد بكتابة التفاصيل.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="مثال: مطور ويب، مدير مبيعات..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
            <button
              onClick={handleGenerateJD}
              disabled={loading || !jobRole}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
            >
              إنشاء
            </button>
          </div>
          {jobDescription && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-slate-700 leading-relaxed max-h-64 overflow-y-auto border border-purple-100 custom-scrollbar">
              <h4 className="font-bold mb-2 border-b border-purple-200 pb-1">الوصف الوظيفي المقترح:</h4>
              <div className="text-sm whitespace-pre-line">
                {jobDescription}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick AI Tools Mockup */}
      <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">هل لديك استفسار محدد؟</h3>
            <p className="text-slate-300 mb-6">اسأل المساعد عن أي شيء يخص قوانين العمل، أو نصائح لإدارة الفريق، أو تحسين بيئة العمل.</p>
            <div className="flex gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
              <input 
                type="text" 
                placeholder="اسألني أي شيء..."
                className="bg-transparent border-0 flex-1 px-4 py-2 outline-none text-white placeholder:text-white/50"
              />
              <button className="bg-white text-slate-800 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition">ارسال</button>
            </div>
          </div>
          <div className="text-8xl opacity-20">🤖</div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </div>
    </div>
  );
};

export default AIAssistant;
