
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PeopleHub from './components/PeopleHub.tsx';
import TimeHub from './components/TimeHub.tsx';
import FinanceHub from './components/FinanceHub.tsx';
import GrowthHub from './components/GrowthHub.tsx';
import SelfService from './components/SelfService.tsx';
import Settings from './components/Settings.tsx';
import { INITIAL_EMPLOYEES, INITIAL_BRANCHES, DEPARTMENTS, INITIAL_CAREER_PATHS } from './constants.tsx';
import { Employee, AttendanceEntry, LeaveRequest, Branch, FinancialAdjustment, SystemSettings, Invitation, Shift, UserRole, ServiceRequest, BiometricDevice, CareerPath, PeerFeedback } from './types.ts';

const STORAGE_KEYS = {
  EMPLOYEES: 'hr_employees_v7',
  ATTENDANCE: 'hr_attendance_v7',
  LEAVES: 'hr_leaves_v7',
  BRANCHES: 'hr_branches_v7',
  ADJUSTMENTS: 'hr_adj_v7',
  SETTINGS: 'hr_settings_v7',
  INVITATIONS: 'hr_invitations_v7',
  SHIFTS: 'hr_shifts_v7',
  REQUESTS: 'hr_requests_v7',
  DEVICES: 'hr_biometric_devices_v7',
  CAREER_PATHS: 'hr_career_paths_v7',
  PEER_FEEDBACK: 'hr_peer_feedback_v7',
};

const DEFAULT_SETTINGS: SystemSettings = {
  alertThresholdDays: 30,
  companyName: 'أسواق المعازيب',
  autoSyncBiometric: false,
  departments: DEPARTMENTS,
  customFieldDefinitions: [
    { id: 'cf_emergency', label: 'رقم الطوارئ', type: 'text', placeholder: 'اسم ورقم الشخص للاتصال به' },
  ],
  officeLocation: { lat: 24.7136, lng: 46.6753, radius: 500 }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('hr_current_user_role');
    return (saved as UserRole) || 'ADMIN';
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : [];
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return saved ? JSON.parse(saved) : [];
  });

  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [devices, setDevices] = useState<BiometricDevice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
    return saved ? JSON.parse(saved) : [];
  });

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAREER_PATHS);
    return saved ? JSON.parse(saved) : INITIAL_CAREER_PATHS;
  });

  const [peerFeedback, setPeerFeedback] = useState<PeerFeedback[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PEER_FEEDBACK);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(serviceRequests));
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    localStorage.setItem(STORAGE_KEYS.CAREER_PATHS, JSON.stringify(careerPaths));
    localStorage.setItem(STORAGE_KEYS.PEER_FEEDBACK, JSON.stringify(peerFeedback));
    localStorage.setItem('hr_current_user_role', currentUserRole);
  }, [employees, attendance, leaves, branches, adjustments, shifts, settings, invitations, serviceRequests, devices, currentUserRole, careerPaths, peerFeedback]);

  const currentTabLabel = useMemo(() => {
    const labels: Record<string, string> = {
      dashboard: 'مركز القيادة',
      people_hub: 'إدارة الكوادر البشرية',
      time_hub: 'نظام الوقت والالتزام',
      finance_hub: 'الشؤون المالية والرواتب',
      growth_hub: 'الذكاء والنمو المهني',
      'self-service': 'بوابة الخدمة الذاتية',
      settings: 'إعدادات المنظومة',
      docs: 'إدارة الوثائق والرقابة',
      leaves: 'نظام طلبات الإجازات'
    };
    return labels[activeTab] || 'الرئيسية';
  }, [activeTab]);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={serviceRequests.filter(r => r.status === 'معلق').length} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        role={currentUserRole}
        onSwitchRole={() => setCurrentUserRole(prev => prev === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN')}
      />

      <main className="flex-1 min-w-0 lg:mr-72 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 md:h-24 border-b border-slate-100 glass-header sticky top-0 z-40 flex items-center justify-between px-8 md:px-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 text-slate-600 bg-slate-50 rounded-2xl active-scale">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="flex flex-col">
               <h2 className="text-sm md:text-lg font-black text-[#1b3152] tracking-tight">{currentTabLabel}</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="hidden md:flex flex-col items-end">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">مدير النظام</p>
                <p className="text-xs font-black text-[#1b3152]">سلمان العتيبي</p>
             </div>
             <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-[#1b3152] to-[#3b82f6] border-4 border-white shadow-xl flex items-center justify-center text-xs font-black text-white">SA</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto p-8 md:p-12">
            {activeTab === 'dashboard' && <Dashboard employees={employees} attendance={attendance} shifts={shifts} settings={settings} onNavigate={setActiveTab} />}
            
            {(activeTab === 'people_hub' || activeTab === 'docs' || activeTab === 'depts' || activeTab === 'org') && (
              <PeopleHub employees={employees} setEmployees={setEmployees} branches={branches} setBranches={setBranches} settings={settings} setSettings={setSettings} invitations={invitations} setInvitations={setInvitations} attendance={attendance} leaves={leaves} adjustments={adjustments} setAdjustments={setAdjustments} shifts={shifts} onSimulateJoin={() => {}} activeTab={activeTab} />
            )}

            {(activeTab === 'time_hub' || activeTab === 'leaves' || activeTab === 'attendance' || activeTab === 'shifts' || activeTab === 'biometric') && (
              <TimeHub employees={employees} setEmployees={setEmployees} attendance={attendance} setAttendance={setAttendance} shifts={shifts} setShifts={setShifts} settings={settings} leaves={leaves} setLeaves={setLeaves} devices={devices} setDevices={setDevices} activeTab={activeTab} />
            )}

            {activeTab === 'finance_hub' && <FinanceHub employees={employees} attendance={attendance} shifts={shifts} adjustments={adjustments} setAdjustments={setAdjustments} settings={settings} requests={serviceRequests} setRequests={setServiceRequests} />}
            {activeTab === 'growth_hub' && (
              <GrowthHub 
                employees={employees} 
                setEmployees={setEmployees} 
                currentUserRole={currentUserRole} 
                careerPaths={careerPaths} 
                setCareerPaths={setCareerPaths} 
                settings={settings}
                peerFeedback={peerFeedback}
                setPeerFeedback={setPeerFeedback}
              />
            )}
            {activeTab === 'self-service' && <SelfService employees={employees} adjustments={adjustments} setEmployees={setEmployees} settings={settings} requests={serviceRequests} setRequests={setServiceRequests} attendance={attendance} setAttendance={setAttendance} personalNotifications={[]} />}
            {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
