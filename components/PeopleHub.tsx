
import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList.tsx';
import OrgManagement from './OrgManagement.tsx';
import DepartmentManagement from './DepartmentManagement.tsx';
import DocumentTracking from './DocumentTracking.tsx';
import { Employee, Branch, SystemSettings, Invitation, AttendanceEntry, LeaveRequest, FinancialAdjustment, Shift } from '../types.ts';

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
  setAdjustments: (adj: FinancialAdjustment[]) => void;
  shifts: Shift[];
  onSimulateJoin: (inv: Invitation) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const PeopleHub: React.FC<PeopleHubProps> = (props) => {
  const [subTab, setSubTab] = useState<'employees' | 'depts' | 'org' | 'docs'>('employees');

  // الاستجابة للتغييرات الخارجية في التبويب (مثل التنقل من لوحة التحكم)
  useEffect(() => {
    if (props.activeTab === 'docs') setSubTab('docs');
    else if (props.activeTab === 'org') setSubTab('org');
    else if (props.activeTab === 'depts') setSubTab('depts');
    else if (props.activeTab === 'people_hub') setSubTab('employees');
  }, [props.activeTab]);

  const tabs = [
    { id: 'employees', label: 'الموظفين', icon: '👥' },
    { id: 'depts', label: 'الأقسام', icon: '🏢' },
    { id: 'org', label: 'الفروع', icon: '📍' },
    { id: 'docs', label: 'الوثائق', icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              subTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="page-transition">
        {subTab === 'employees' && <EmployeeList {...props} />}
        {subTab === 'depts' && <DepartmentManagement settings={props.settings} setSettings={props.setSettings} employees={props.employees} />}
        {subTab === 'org' && <OrgManagement branches={props.branches} setBranches={props.setBranches} settings={props.settings} setSettings={props.setSettings} employees={props.employees} />}
        {subTab === 'docs' && <DocumentTracking employees={props.employees} settings={props.settings} branches={props.branches} />}
      </div>
    </div>
  );
};

export default PeopleHub;
