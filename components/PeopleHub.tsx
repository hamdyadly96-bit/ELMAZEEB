
import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import OrgManagement from './OrgManagement';
import DocumentTracking from './DocumentTracking';
import { Employee, Branch, SystemSettings, Invitation, AttendanceEntry, LeaveRequest, FinancialAdjustment, Shift } from '../types';

interface PeopleHubProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  branches: Branch[];
  setBranches: (b: Branch[]) => void;
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
  invitations: Invitation[];
  setInvitations: (invs: Invitation[]) => void;
  attendance: AttendanceEntry[];
  leaves: LeaveRequest[];
  adjustments: FinancialAdjustment[];
  shifts: Shift[];
  onSimulateJoin: (inv: Invitation) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const PeopleHub: React.FC<PeopleHubProps> = (props) => {
  const subTabs = ['employees', 'org', 'tree', 'docs'];
  const [subTab, setSubTab] = useState<'employees' | 'org' | 'tree' | 'docs'>(
    (props.activeTab && subTabs.includes(props.activeTab) ? props.activeTab : 'employees') as any
  );

  useEffect(() => {
    if (props.activeTab && subTabs.includes(props.activeTab)) {
      setSubTab(props.activeTab as any);
    }
  }, [props.activeTab]);

  const handleSubTabChange = (id: 'employees' | 'org' | 'tree' | 'docs') => {
    setSubTab(id);
    if (props.setActiveTab) props.setActiveTab(id);
  };

  const tabs = [
    { id: 'employees', label: 'الموظفين', icon: '👥' },
    { id: 'tree', label: 'الهيكل', icon: '🌳' },
    { id: 'org', label: 'الفروع', icon: '🏢' },
    { id: 'docs', label: 'الوثائق', icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      <div className="sticky top-16 md:top-0 z-30 bg-[#f8fafc] -mx-4 md:mx-0 px-4 md:px-0 py-2">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active-scale ${
                subTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="page-transition">
        {subTab === 'employees' && (
          <EmployeeList {...props} />
        )}
        {subTab === 'tree' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm text-center min-h-[400px] flex flex-col overflow-x-auto no-scrollbar">
            <h3 className="text-lg md:text-xl font-black text-slate-800 mb-10 flex items-center justify-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              التسلسل الهرمي للمؤسسة
            </h3>
            
            <div className="flex-1 flex flex-col items-center min-w-[500px] md:min-w-0">
               {/* محاكاة شجرة بسيطة */}
               <div className="p-4 md:p-5 bg-slate-900 text-white rounded-2xl font-black text-xs md:text-sm mb-12 relative w-40 md:w-48 shadow-xl">
                 مدير المنشأة
                 <div className="absolute bottom-[-48px] left-1/2 w-px h-[48px] bg-slate-200"></div>
               </div>

               <div className="flex gap-10 md:gap-20 relative">
                 <div className="absolute top-[-48px] left-0 right-0 h-px bg-slate-200 mx-auto w-full max-w-[50%]"></div>
                 {props.settings.departments.slice(0, 3).map(dept => (
                   <div key={dept} className="flex flex-col items-center relative">
                     <div className="absolute top-[-48px] left-1/2 w-px h-[48px] bg-slate-200"></div>
                     <div className="p-4 bg-white border-2 border-blue-100 rounded-2xl text-[10px] md:text-[11px] font-black text-slate-800 w-32 md:w-36 shadow-sm hover:border-blue-500 transition-colors cursor-pointer active-scale">
                       قسم {dept}
                       <div className="text-[8px] md:text-[9px] text-blue-500 mt-1 font-bold">
                         {props.employees.filter(e => e.department === dept).length} موظف
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-16 md:mt-20 p-5 md:p-6 bg-blue-50 border border-blue-100 rounded-[1.5rem] md:rounded-[2rem] max-w-lg text-[10px] md:text-xs font-bold text-blue-800 leading-relaxed mx-auto">
                 ℹ️ الهيكل التنظيمي المرئي يساعد في فهم خطوط المسؤولية. يمكنك سحب الشاشة لليمين واليسار لرؤية كامل الهيكل.
               </div>
            </div>
          </div>
        )}
        {subTab === 'org' && (
          <OrgManagement 
            branches={props.branches} 
            setBranches={props.setBranches} 
            settings={props.settings} 
            setSettings={props.setSettings} 
            employees={props.employees} 
          />
        )}
        {subTab === 'docs' && (
          <DocumentTracking 
            employees={props.employees} 
            settings={props.settings} 
          />
        )}
      </div>
    </div>
  );
};

export default PeopleHub;
