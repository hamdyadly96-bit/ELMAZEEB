
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PeopleHub from './components/PeopleHub';
import TimeHub from './components/TimeHub';
import FinanceHub from './components/FinanceHub';
import GrowthHub from './components/GrowthHub';
import SelfService from './components/SelfService';
import Settings from './components/Settings';
import JoinSystem from './components/JoinSystem';
import NotificationPanel from './components/NotificationPanel';
import { INITIAL_EMPLOYEES, INITIAL_BRANCHES, DEPARTMENTS } from './constants';
import { Employee, AttendanceEntry, LeaveRequest, Branch, FinancialAdjustment, SystemSettings, Invitation, Shift, UserRole, ServiceRequest } from './types';

const STORAGE_KEYS = {
  EMPLOYEES: 'hr_employees_v5',
  ATTENDANCE: 'hr_attendance_v5',
  LEAVES: 'hr_leaves_v5',
  BRANCHES: 'hr_branches_v5',
  ADJUSTMENTS: 'hr_adj_v5',
  SETTINGS: 'hr_settings_v5',
  INVITATIONS: 'hr_invitations_v5',
  SHIFTS: 'hr_shifts_v5',
  REQUESTS: 'hr_requests_v5',
};

const DEFAULT_SETTINGS: SystemSettings = {
  alertThresholdDays: 30,
  companyName: 'مجموعة الرؤية المتطورة',
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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
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
    localStorage.setItem('hr_current_user_role', currentUserRole);
  }, [employees, attendance, leaves, branches, adjustments, shifts, settings, invitations, serviceRequests, currentUserRole]);

  const notifications = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + settings.alertThresholdDays);

    const currentUser = employees.find(e => e.name.includes('سلمان')) || employees[0];

    employees.forEach(emp => {
      emp.documents?.forEach(doc => {
        const expiry = new Date(doc.expiryDate);
        if (expiry <= thresholdDate) {
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isManager = currentUserRole === 'ADMIN' || currentUserRole === 'HR_MANAGER';
          const isOwnDoc = emp.id === currentUser.id;

          if (isManager || isOwnDoc) {
            alerts.push({
              id: `${emp.id}_${doc.id}`,
              title: isOwnDoc ? `وثيقتك (${doc.type}) تنتهي قريباً` : `انتهاء وثيقة للموظف: ${emp.name}`,
              message: diffDays < 0 ? `الوثيقة منتهية منذ ${Math.abs(diffDays)} يوم!` : `الوثيقة تنتهي خلال ${diffDays} يوم.`,
              type: diffDays < 0 ? 'critical' : 'warning',
              date: doc.expiryDate,
              isOwn: isOwnDoc
            });
          }
        }
      });
    });
    return alerts;
  }, [employees, settings.alertThresholdDays, currentUserRole]);

  const cycleRole = () => {
    let newRole: UserRole;
    if (currentUserRole === 'ADMIN') newRole = 'HR_MANAGER';
    else if (currentUserRole === 'HR_MANAGER') newRole = 'EMPLOYEE';
    else newRole = 'ADMIN';

    setCurrentUserRole(newRole);
    setActiveTab(newRole === 'EMPLOYEE' ? 'self-service' : 'dashboard');
    setSidebarOpen(false);
  };

  const currentTabLabel = useMemo(() => {
    const labels: Record<string, string> = {
      dashboard: 'لوحة التحكم',
      people_hub: 'شؤون الموظفين',
      employees: 'قائمة الكوادر',
      org: 'الهيكل التنظيمي',
      docs: 'الأرشيف الرقمي',
      time_hub: 'إدارة الوقت',
      attendance: 'سجل الحضور',
      leaves: 'طلبات الإجازات',
      shifts: 'جدولة الورديات',
      biometric: 'مزامنة البصمة',
      finance_hub: 'المالية',
      payroll: 'مسير الرواتب',
      adjustments: 'المؤثرات المالية',
      approvals: 'الاعتمادات',
      growth_hub: 'التطوير والذكاء',
      ai: 'المساعد الذكي',
      career: 'المسار المهني',
      'self-service': 'بوابة الخدمة الذاتية',
      settings: 'إعدادات النظام'
    };
    return labels[activeTab] || 'الرئيسية';
  }, [activeTab]);

  return (
    <div className="min-h-screen flex bg-[#fbfcfd]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={notifications.length} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        role={currentUserRole}
        onSwitchRole={cycleRole}
      />

      <main className="flex-1 min-w-0 lg:mr-64 flex flex-col h-screen overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>
        
        <header className="fixed lg:sticky top-0 right-0 left-0 lg:right-auto h-16 md:h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-40 flex items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-[1rem] active-scale">
               <span className="text-xl">☰</span>
             </button>
             <div className="flex flex-col">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                 <span className="opacity-50">النظام</span>
                 <span className="opacity-30">/</span>
                 <span className="text-blue-600 uppercase">{activeTab.split('_')[0]}</span>
               </div>
               <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight">{currentTabLabel}</h2>
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`w-11 h-11 rounded-[1.1rem] flex items-center justify-center transition-all active-scale ${isNotifOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600'}`}
              >
                <span className="text-xl">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              {isNotifOpen && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setIsNotifOpen(false)} 
                  onViewAction={(id) => {
                    setActiveTab(currentUserRole === 'EMPLOYEE' ? 'self-service' : 'people_hub');
                    setIsNotifOpen(false);
                  }}
                />
              )}
            </div>
            
            <div className="hidden xs:flex items-center gap-3 bg-slate-50 border border-slate-100 pl-4 pr-1 py-1 rounded-[1.25rem] hover:bg-white transition-all cursor-pointer group shadow-sm" onClick={cycleRole}>
              <div className="text-left">
                <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors">سلمان العتيبي</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-left">{currentUserRole === 'ADMIN' ? 'مدير النظام' : 'موظف'}</p>
              </div>
              <img 
                src={currentUserRole === 'ADMIN' ? 'https://picsum.photos/seed/admin/100' : 'https://picsum.photos/seed/emp/100'} 
                className="w-9 h-9 rounded-xl object-cover shadow-sm ring-2 ring-white" 
                alt="Profile" 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 bg-transparent relative z-10">
          <div className="max-w-6xl mx-auto page-transition safe-bottom">
            {activeTab === 'dashboard' && <Dashboard employees={employees} attendance={attendance} shifts={shifts} settings={settings} />}
            
            {['people_hub', 'employees', 'org', 'tree', 'docs'].includes(activeTab) && (
              <PeopleHub 
                employees={employees} 
                setEmployees={setEmployees} 
                branches={branches} 
                setBranches={setBranches}
                settings={settings} 
                setSettings={setSettings}
                invitations={invitations} 
                setInvitations={setInvitations} 
                attendance={attendance} 
                leaves={leaves} 
                adjustments={adjustments} 
                shifts={shifts}
                onSimulateJoin={() => {}}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {['time_hub', 'attendance', 'leaves', 'shifts', 'biometric'].includes(activeTab) && (
              <TimeHub 
                employees={employees} 
                setEmployees={setEmployees}
                attendance={attendance} 
                setAttendance={setAttendance} 
                shifts={shifts} 
                setShifts={setShifts}
                settings={settings}
                leaves={leaves}
                setLeaves={setLeaves}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {['finance_hub', 'payroll', 'adjustments', 'approvals'].includes(activeTab) && (
              <FinanceHub 
                employees={employees} 
                attendance={attendance}
                shifts={shifts}
                adjustments={adjustments} 
                setAdjustments={setAdjustments} 
                settings={settings}
                requests={serviceRequests}
                setRequests={setServiceRequests}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {['growth_hub', 'ai', 'career'].includes(activeTab) && (
              <GrowthHub 
                employees={employees} 
                setEmployees={setEmployees} 
                currentUserRole={currentUserRole} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'self-service' && (
              <SelfService 
                employees={employees} 
                adjustments={adjustments} 
                setEmployees={setEmployees} 
                settings={settings}
                requests={serviceRequests}
                setRequests={setServiceRequests}
                attendance={attendance}
                setAttendance={setAttendance}
                personalNotifications={notifications.filter(n => n.isOwn)}
              />
            )}

            {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
