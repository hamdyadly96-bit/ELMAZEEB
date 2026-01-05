
import React, { useState, useEffect } from 'react';
import Attendance from './Attendance';
import ShiftManagement from './ShiftManagement';
import BiometricSync from './BiometricSync';
import LeaveManagement from './LeaveManagement';
import { Employee, AttendanceEntry, Shift, SystemSettings, LeaveRequest } from '../types';

interface TimeHubProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  attendance: AttendanceEntry[];
  setAttendance: (records: AttendanceEntry[]) => void;
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
  settings: SystemSettings;
  leaves: LeaveRequest[];
  setLeaves: (leaves: LeaveRequest[]) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TimeHub: React.FC<TimeHubProps> = (props) => {
  const subTabs = ['attendance', 'leaves', 'shifts', 'biometric'];
  const [subTab, setSubTab] = useState<'attendance' | 'leaves' | 'shifts' | 'biometric'>(
    (props.activeTab && subTabs.includes(props.activeTab) ? props.activeTab : 'attendance') as any
  );

  useEffect(() => {
    if (props.activeTab && subTabs.includes(props.activeTab)) {
      setSubTab(props.activeTab as any);
    }
  }, [props.activeTab]);

  const handleSubTabChange = (id: 'attendance' | 'leaves' | 'shifts' | 'biometric') => {
    setSubTab(id);
    if (props.setActiveTab) props.setActiveTab(id);
  };

  const tabs = [
    { id: 'attendance', label: 'الحضور', icon: '📅' },
    { id: 'leaves', label: 'الإجازات', icon: '🏖️' },
    { id: 'shifts', label: 'الورديات', icon: '🕒' },
    { id: 'biometric', label: 'البصمة', icon: '📟' },
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
                subTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="page-transition">
        {subTab === 'attendance' && (
          <Attendance 
            employees={props.employees} 
            attendance={props.attendance} 
            setAttendance={props.setAttendance} 
            shifts={props.shifts} 
          />
        )}
        {subTab === 'leaves' && (
          <LeaveManagement 
            employees={props.employees} 
            leaves={props.leaves} 
            setLeaves={props.setLeaves} 
          />
        )}
        {subTab === 'shifts' && (
          <ShiftManagement 
            shifts={props.shifts} 
            setShifts={props.setShifts} 
            employees={props.employees} 
            setEmployees={props.setEmployees}
            settings={props.settings} 
          />
        )}
        {subTab === 'biometric' && (
          <BiometricSync 
            employees={props.employees} 
            attendance={props.attendance} 
            setAttendance={props.setAttendance} 
          />
        )}
      </div>
    </div>
  );
};

export default TimeHub;
