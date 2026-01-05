
import React, { useState, useEffect } from 'react';
import AIAssistant from './AIAssistant';
import CareerDevelopment from './CareerDevelopment';
import { Employee, UserRole } from '../types';

interface GrowthHubProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  currentUserRole: UserRole;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const GrowthHub: React.FC<GrowthHubProps> = (props) => {
  const subTabs = ['ai', 'career'];
  const [subTab, setSubTab] = useState<'ai' | 'career'>(
    (props.activeTab && subTabs.includes(props.activeTab) ? props.activeTab : 'ai') as any
  );

  useEffect(() => {
    if (props.activeTab && subTabs.includes(props.activeTab)) {
      setSubTab(props.activeTab as any);
    }
  }, [props.activeTab]);

  const handleSubTabChange = (id: 'ai' | 'career') => {
    setSubTab(id);
    if (props.setActiveTab) props.setActiveTab(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => handleSubTabChange('ai')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            subTab === 'ai' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          ✨ المساعد الذكي
        </button>
        <button
          onClick={() => handleSubTabChange('career')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            subTab === 'career' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🎓 التطوير والمهارات
        </button>
      </div>

      <div className="page-transition">
        {subTab === 'ai' && <AIAssistant employees={props.employees} />}
        {subTab === 'career' && (
          <CareerDevelopment 
            employees={props.employees} 
            setEmployees={props.setEmployees} 
            currentUserRole={props.currentUserRole} 
          />
        )}
      </div>
    </div>
  );
};

export default GrowthHub;
