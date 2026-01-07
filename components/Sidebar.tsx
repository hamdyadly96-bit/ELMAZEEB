
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCount: number;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onSwitchRole: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, alertCount, isOpen, onClose, role, onSwitchRole }) => {
  
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) onClose();
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'people_hub', label: 'إدارة الكوادر', icon: '👥', badge: alertCount, roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'time_hub', label: 'الوقت والدوام', icon: '⏱️', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'finance_hub', label: 'المالية والرواتب', icon: '💸', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'growth_hub', label: 'الذكاء والنمو', icon: '🚀', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'self-service', label: 'بوابة الموظف', icon: '👤', roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  if (role === 'ADMIN') {
    menuItems.push({ id: 'settings', label: 'الإعدادات', icon: '⚙️', roles: ['ADMIN'] });
  }

  const isCurrentTab = (id: string) => {
    if (activeTab === id) return true;
    const parentTabs: Record<string, string[]> = {
      'people_hub': ['employees', 'org', 'docs', 'tree', 'depts'],
      'time_hub': ['attendance', 'leaves', 'shifts', 'biometric'],
      'finance_hub': ['payroll', 'adjustments', 'approvals'],
      'growth_hub': ['career', 'ai', 'recruitment', 'paths']
    };
    return parentTabs[id]?.includes(activeTab);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[85] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed right-0 top-0 h-full bg-white border-l border-slate-100 flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-[90] w-[280px] lg:w-72 
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-10 flex-shrink-0 relative">
          <button 
            onClick={onClose} 
            className="lg:hidden absolute left-4 top-10 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all shadow-sm"
          >
            ✕
          </button>
          
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <div className="w-16 h-16 bg-[#1b3152] rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-[#1b3152]/20 mb-3 group hover:rotate-6 transition-transform">
               <span className="text-white text-3xl font-black">M</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-[#1b3152] leading-tight">أسواق المعازيب</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">HR Intelligence System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto no-scrollbar pb-10">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-5 mb-5 mt-4">القائمة الرئيسية</p>
          {menuItems.filter(item => item.roles.includes(role)).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full text-right flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-300 active-scale group ${
                isCurrentTab(item.id)
                  ? 'bg-[#1b3152] text-white premium-shadow'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-transform group-hover:scale-110 ${isCurrentTab(item.id) ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${isCurrentTab(item.id) ? 'bg-[#76bc43] text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button onClick={onSwitchRole} className="w-full text-right p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 active-scale transition-all hover:bg-slate-100 flex items-center gap-4 group">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl border border-slate-100 group-hover:bg-[#76bc43] group-hover:text-white transition-colors">🎭</div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">تبديل الهوية</p>
              <p className="text-xs font-bold text-[#1b3152]">إلى {role === 'ADMIN' ? 'الخدمة الذاتية' : 'إدارة النظام'}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
