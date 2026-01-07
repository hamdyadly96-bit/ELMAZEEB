
import React, { useState, useEffect } from 'react';
import AIAssistant from './AIAssistant.tsx';
import CareerDevelopment from './CareerDevelopment.tsx';
import CareerPathManagement from './CareerPathManagement.tsx';
import CareerPathViewer from './CareerPathViewer.tsx';
import RecruitmentHub from './RecruitmentHub.tsx';
import PeerFeedbackSection from './PeerFeedbackSection.tsx';
import { Employee, UserRole, CareerPath, SystemSettings, PeerFeedback } from '../types.ts';

interface GrowthHubProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  currentUserRole: UserRole;
  careerPaths: CareerPath[];
  setCareerPaths: (paths: CareerPath[]) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  settings: SystemSettings;
  peerFeedback: PeerFeedback[];
  setPeerFeedback: (feedback: PeerFeedback[]) => void;
}

const GrowthHub: React.FC<GrowthHubProps> = (props) => {
  const subTabs = ['ai', 'career', 'paths', 'recruitment', 'feedback'];
  const [subTab, setSubTab] = useState<'ai' | 'career' | 'paths' | 'recruitment' | 'feedback'>(
    (props.activeTab && subTabs.includes(props.activeTab) ? props.activeTab : 'ai') as any
  );

  useEffect(() => {
    if (props.activeTab && subTabs.includes(props.activeTab)) {
      setSubTab(props.activeTab as any);
    }
  }, [props.activeTab]);

  const handleSubTabChange = (id: 'ai' | 'career' | 'paths' | 'recruitment' | 'feedback') => {
    setSubTab(id);
    if (props.setActiveTab) props.setActiveTab(id);
  };

  const isHR = props.currentUserRole === 'ADMIN' || props.currentUserRole === 'HR_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => handleSubTabChange('ai')}
          className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap active-scale ${
            subTab === 'ai' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          ✨ المساعد الذكي
        </button>
        {isHR && (
          <button
            onClick={() => handleSubTabChange('recruitment')}
            className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap active-scale ${
              subTab === 'recruitment' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🎯 التوظيف الذكي
          </button>
        )}
        <button
          onClick={() => handleSubTabChange('career')}
          className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap active-scale ${
            subTab === 'career' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🎓 المهارات والنمو
        </button>
        <button
          onClick={() => handleSubTabChange('feedback')}
          className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap active-scale ${
            subTab === 'feedback' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🤝 صوت الفريق
        </button>
        <button
          onClick={() => handleSubTabChange('paths')}
          className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap active-scale ${
            subTab === 'paths' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🚀 المسارات الوظيفية
        </button>
      </div>

      <div className="page-transition">
        {subTab === 'ai' && <AIAssistant employees={props.employees} />}
        {subTab === 'recruitment' && <RecruitmentHub settings={props.settings} />}
        {subTab === 'feedback' && <PeerFeedbackSection employees={props.employees} feedback={props.peerFeedback} setFeedback={props.setPeerFeedback} />}
        {subTab === 'career' && (
          <CareerDevelopment 
            employees={props.employees} 
            setEmployees={props.setEmployees} 
            currentUserRole={props.currentUserRole} 
          />
        )}
        {subTab === 'paths' && (
          isHR ? (
            <CareerPathManagement 
              careerPaths={props.careerPaths} 
              setCareerPaths={props.setCareerPaths}
              settings={props.settings}
            />
          ) : (
            <CareerPathViewer 
              employees={props.employees}
              careerPaths={props.careerPaths}
            />
          )
        )}
      </div>
    </div>
  );
};

export default GrowthHub;
