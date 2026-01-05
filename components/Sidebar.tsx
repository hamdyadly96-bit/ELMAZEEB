
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
    { id: 'people_hub', label: 'الموظفين', icon: '👥', badge: alertCount, roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'time_hub', label: 'الوقت والدوام', icon: '⏱️', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'finance_hub', label: 'المالية والرواتب', icon: '💸', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'growth_hub', label: 'الذكاء والنمو', icon: '🚀', roles: ['ADMIN', 'HR_MANAGER'] },
    { id: 'self-service', label: 'خدماتي', icon: '👤', roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  if (role === 'ADMIN') {
    menuItems.push({ id: 'settings', label: 'الإعدادات', icon: '⚙️', roles: ['ADMIN'] });
  }

  const isCurrentTab = (id: string) => {
    if (activeTab === id) return true;
    if (id === 'people_hub' && ['employees', 'org', 'docs', 'tree'].includes(activeTab)) return true;
    if (id === 'time_hub' && ['attendance', 'leaves', 'shifts', 'biometric'].includes(activeTab)) return true;
    if (id === 'finance_hub' && ['payroll', 'adjustments', 'approvals'].includes(activeTab)) return true;
    if (id === 'growth_hub' && ['career', 'ai'].includes(activeTab)) return true;
    return false;
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[85] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed right-0 top-0 h-full bg-white border-l border-slate-100 shadow-2xl flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-[90] w-72 lg:w-64 
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-6 lg:p-8 flex-shrink-0 relative">
          <button 
            onClick={onClose} 
            className="lg:hidden absolute left-4 top-6 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-200">R</div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">رؤية</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">HR Pro</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar no-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">القائمة الرئيسية</p>
          {menuItems.filter(item => item.roles.includes(role)).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full text-right flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group active-scale ${
                isCurrentTab(item.id)
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`text-xl transition-transform group-hover:scale-110 ${isCurrentTab(item.id) ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${isCurrentTab(item.id) ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}

          <div className="pt-8 mt-8 border-t border-slate-50">
            <button onClick={onSwitchRole} className="w-full text-right group p-1 bg-slate-50 rounded-[1.5rem] border border-slate-100 active-scale transition-all hover:bg-white hover:shadow-lg">
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">🎭</div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تبديل الواجهة</p>
                  <p className="text-[11px] font-bold text-slate-700">إلى {role === 'ADMIN' ? 'مدير' : role === 'HR_MANAGER' ? 'موظف' : 'مسؤول'}</p>
                </div>
                <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all ml-1">←</span>
              </div>
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-100">
             <div className="relative z-10">
                <p className="text-[10px] font-black opacity-60 uppercase mb-1">المستخدم الحالي</p>
                <p className="font-black text-sm mb-1">سلمان العتيبي</p>
                <p className="text-[10px] font-bold opacity-80">مدير تنفيذي</p>
             </div>
             <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
             <span className="absolute top-4 left-4 text-xl opacity-30">✨</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
