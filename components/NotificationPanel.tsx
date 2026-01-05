
import React from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning';
  date: string;
  isOwn: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onViewAction: (id: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onViewAction }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute left-0 mt-4 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-sm">مركز التنبيهات</h3>
          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg">{notifications.length} جديد</span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-5 hover:bg-slate-50 transition cursor-pointer group"
                  onClick={() => onViewAction(notif.id)}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${notif.type === 'critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                      {notif.type === 'critical' ? '🚨' : '⚠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black mb-1 truncate ${notif.isOwn ? 'text-blue-600' : 'text-slate-800'}`}>
                        {notif.isOwn && '✨ '}{notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-bold">{notif.message}</p>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-300 font-mono uppercase">{notif.date}</span>
                         <span className="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">تحديث الآن ←</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-30">
               <div className="text-4xl mb-4">💤</div>
               <p className="text-xs font-black italic text-slate-500">لا توجد تنبيهات جديدة حالياً.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-50 bg-slate-50/30">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-white text-slate-600 text-[10px] font-black rounded-xl border border-slate-100 hover:bg-slate-100 transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
