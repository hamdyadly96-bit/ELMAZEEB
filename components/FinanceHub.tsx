
import React, { useState, useEffect } from 'react';
import Payroll from './Payroll.tsx';
import Financials from './Financials.tsx';
import { Employee, FinancialAdjustment, SystemSettings, ServiceRequest, AttendanceEntry, Shift } from '../types.ts';

interface FinanceHubProps {
  employees: Employee[];
  attendance: AttendanceEntry[];
  shifts: Shift[];
  adjustments: FinancialAdjustment[];
  setAdjustments: (adj: FinancialAdjustment[]) => void;
  settings: SystemSettings;
  requests: ServiceRequest[];
  setRequests: (reqs: ServiceRequest[]) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const FinanceHub: React.FC<FinanceHubProps> = (props) => {
  const subTabs = ['payroll', 'adjustments', 'approvals'];
  const [subTab, setSubTab] = useState<'payroll' | 'adjustments' | 'approvals'>(
    (props.activeTab && subTabs.includes(props.activeTab) ? props.activeTab : 'payroll') as any
  );

  useEffect(() => {
    if (props.activeTab && subTabs.includes(props.activeTab)) {
      setSubTab(props.activeTab as any);
    }
  }, [props.activeTab]);

  const handleSubTabChange = (id: 'payroll' | 'adjustments' | 'approvals') => {
    setSubTab(id);
    if (props.setActiveTab) props.setActiveTab(id);
  };

  const pendingFinanceRequests = props.requests.filter(r => r.status === 'معلق' && (r.type === 'طلب سلفة' || r.type === 'طلب عهدة'));

  const handleApproveRequest = (id: string, status: 'مقبول' | 'مرفوض') => {
    const req = props.requests.find(r => r.id === id);
    if (!req) return;

    if (status === 'مقبول' && req.amount) {
      const newAdj: FinancialAdjustment = {
        id: Date.now().toString(),
        employeeId: req.employeeId,
        type: req.type === 'طلب سلفة' ? 'سلفة' : 'مكافأة',
        amount: req.amount,
        reason: `${req.type}: ${req.details}`,
        date: new Date().toISOString().split('T')[0]
      };
      props.setAdjustments([newAdj, ...props.adjustments]);
    }

    props.setRequests(props.requests.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-16 md:top-0 z-30 bg-[#f8fafc] -mx-4 md:mx-0 px-4 md:px-0 py-2">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => handleSubTabChange('payroll')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active-scale ${
              subTab === 'payroll' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            📄 مسير الرواتب
          </button>
          <button
            onClick={() => handleSubTabChange('approvals')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 active-scale ${
              subTab === 'approvals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            ⚖️ اعتمادات العهد
            {pendingFinanceRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {pendingFinanceRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSubTabChange('adjustments')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active-scale ${
              subTab === 'adjustments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            💰 المؤثرات اليدوية
          </button>
        </div>
      </div>

      <div className="page-transition">
        {subTab === 'payroll' && (
          <Payroll 
            employees={props.employees} 
            attendance={props.attendance} 
            shifts={props.shifts} 
            settings={props.settings} 
            adjustments={props.adjustments}
          />
        )}
        
        {subTab === 'approvals' && (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/20">
              <h3 className="text-base md:text-lg font-black text-slate-800">مركز الاعتمادات المالية الرقمي</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-1">طلبات السلف والعهد المعلقة التي تحتاج موافقة المحاسب.</p>
            </div>
            
            <div className="p-4 md:p-6">
              {pendingFinanceRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingFinanceRequests.map(req => {
                    const emp = props.employees.find(e => e.id === req.employeeId);
                    return (
                      <div key={req.id} className="bg-white border border-slate-100 p-5 md:p-6 rounded-3xl shadow-sm hover:border-blue-200 transition">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <img src={emp?.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{emp?.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold">{req.type}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-xs md:text-sm font-black text-blue-600">{req.amount?.toLocaleString()} ر.س</p>
                            <p className="text-[8px] text-slate-400 font-bold">{req.createdAt}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-[10px] text-slate-600 font-bold mb-6">
                          {req.details}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button 
                            onClick={() => handleApproveRequest(req.id, 'مقبول')}
                            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100 active-scale"
                          >
                            موافقة ✅
                          </button>
                          <button 
                            onClick={() => handleApproveRequest(req.id, 'مرفوض')}
                            className="flex-1 bg-white text-red-600 border border-red-100 py-3 rounded-xl text-[10px] font-black active-scale"
                          >
                            رفض ❌
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center opacity-30">
                  <span className="text-5xl mb-4">⚖️</span>
                  <p className="text-sm font-black italic">لا توجد طلبات معلقة بانتظار الاعتماد.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {subTab === 'adjustments' && (
          <Financials 
            employees={props.employees} 
            adjustments={props.adjustments} 
            setAdjustments={props.setAdjustments} 
            settings={props.settings} 
          />
        )}
      </div>
    </div>
  );
};

export default FinanceHub;
