
import React, { useState, useRef } from 'react';
import { Branch, SystemSettings, Employee, Document as BranchDoc } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { extractEmployeeDataFromDocument } from '../services/geminiService';

interface OrgProps {
  branches: Branch[];
  setBranches: (b: Branch[]) => void;
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
  employees: Employee[];
}

const OrgManagement: React.FC<OrgProps> = ({ branches, setBranches, settings, setSettings, employees }) => {
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });
  const [selectedBranchForDocs, setSelectedBranchForDocs] = useState<Branch | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [confirmState, setConfirmState] = useState<{ 
    isOpen: boolean; 
    id: string | null 
  }>({
    isOpen: false,
    id: null
  });

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;
    setBranches([...branches, { ...newBranch, id: Date.now().toString(), documents: [] }]);
    setNewBranch({ name: '', location: '' });
  };

  const triggerDeleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    const count = employees.filter(emp => emp.branch === branch?.name).length;
    if (count > 0) {
      alert(`لا يمكن حذف فرع "${branch?.name}" لوجود ${count} موظفين تابعين له حالياً.`);
      return;
    }
    setConfirmState({ isOpen: true, id: branchId });
  };

  const handleConfirmedDelete = () => {
    if (confirmState.id) {
      setBranches(branches.filter(b => b.id !== confirmState.id));
    }
    setConfirmState({ isOpen: false, id: null });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBranchForDocs) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fullDataUrl = event.target?.result as string;
      const base64 = fullDataUrl.split(',')[1];
      
      try {
        const data = await extractEmployeeDataFromDocument(base64, file.type);
        
        // محاولة تحديد نوع الوثيقة تلقائياً
        let detectedType: BranchDoc['type'] = 'أخرى';
        if (data?.CRNumber) detectedType = 'سجل تجاري';
        else if (fullDataUrl.includes('tax')) detectedType = 'بطاقة ضريبية';

        const newDoc: BranchDoc = {
          id: Date.now().toString(),
          type: detectedType,
          expiryDate: data?.expiryDate || new Date().toISOString().split('T')[0],
          fileUrl: fullDataUrl
        };

        const updatedBranches = branches.map(b => {
          if (b.id === selectedBranchForDocs.id) {
            return { ...b, documents: [...(b.documents || []), newDoc] };
          }
          return b;
        });

        setBranches(updatedBranches);
        setSelectedBranchForDocs(updatedBranches.find(b => b.id === selectedBranchForDocs.id) || null);
      } catch (error) {
        console.error("AI extraction failed", error);
        const manualDoc: BranchDoc = {
          id: Date.now().toString(),
          type: 'أخرى',
          expiryDate: new Date().toISOString().split('T')[0],
          fileUrl: fullDataUrl
        };
        const updatedBranches = branches.map(b => {
          if (b.id === selectedBranchForDocs.id) {
            return { ...b, documents: [...(b.documents || []), manualDoc] };
          }
          return b;
        });
        setBranches(updatedBranches);
        setSelectedBranchForDocs(updatedBranches.find(b => b.id === selectedBranchForDocs.id) || null);
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (branchId: string, docId: string) => {
    const updatedBranches = branches.map(b => {
      if (b.id === branchId) {
        return { ...b, documents: (b.documents || []).filter(d => d.id !== docId) };
      }
      return b;
    });
    setBranches(updatedBranches);
    if (selectedBranchForDocs?.id === branchId) {
      setSelectedBranchForDocs(updatedBranches.find(b => b.id === branchId) || null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title="حذف الفرع"
        message="هل أنت متأكد؟ سيؤدي هذا الإجراء لإزالة سجل الفرع نهائياً."
        confirmLabel="تأكيد الحذف"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-xl">📍</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الفروع والمواقع</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">التحكم في فروع المنشأة والوثائق الحكومية.</p>
        </div>
        
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي المواقع</p>
          <p className="text-lg font-black text-blue-600">{branches.length} فرع</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-2 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar p-3">
              {branches.map(b => {
                const branchEmps = employees.filter(e => e.branch === b.name).length;
                const docCount = b.documents?.length || 0;
                return (
                  <div key={b.id} className="group flex flex-col p-6 bg-slate-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-blue-100 rounded-[2rem] transition-all">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">🏢</div>
                        <div>
                          <p className="font-black text-base text-slate-800">{b.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{b.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setSelectedBranchForDocs(b); setIsDocModalOpen(true); }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          📄 الوثائق ({docCount})
                        </button>
                        <button 
                          onClick={() => triggerDeleteBranch(b.id)}
                          className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition transform active:scale-90"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <span className="px-3 py-1 bg-white border border-slate-100 text-[9px] font-black text-slate-400 rounded-lg">👥 {branchEmps} موظف</span>
                       {docCount > 0 && <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-600 rounded-lg">✅ {docCount} مستند</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24">
              <h3 className="text-xl font-black mb-6">إضافة موقع جديد</h3>
              <form onSubmit={handleAddBranch} className="space-y-5">
                 <input placeholder="اسم الفرع" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} required />
                 <input placeholder="المدينة / الحي" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition" value={newBranch.location} onChange={e => setNewBranch({...newBranch, location: e.target.value})} required />
                 <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 mt-4">تسجيل الموقع ✨</button>
              </form>
           </div>
        </div>
      </div>

      {/* نافذة إدارة وثائق الفرع */}
      {isDocModalOpen && selectedBranchForDocs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">وثائق فرع {selectedBranchForDocs.name}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">السجلات التجارية والتراخيص الحكومية.</p>
                 </div>
                 <button onClick={() => setIsDocModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition active-scale">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-8">
                 {(selectedBranchForDocs.documents || []).map(doc => (
                    <div key={doc.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">📄</div>
                          <div>
                             <p className="text-xs font-black text-slate-800">{doc.type}</p>
                             <p className="text-[10px] font-bold text-slate-400">تنتهي في: <span className="font-mono">{doc.expiryDate}</span></p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          {doc.fileUrl && (
                             <button 
                              onClick={() => {
                                // محاكاة فتح المعاينة المركزية
                                window.dispatchEvent(new CustomEvent('openPreview', { detail: { url: doc.fileUrl, title: doc.type } }));
                              }}
                              className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition-all"
                             >👁️</button>
                          )}
                          <button onClick={() => removeDoc(selectedBranchForDocs.id, doc.id)} className="w-8 h-8 bg-red-50 text-red-400 rounded-lg flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                 <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting} className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${isExtracting ? 'bg-blue-100 text-blue-400' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                    {isExtracting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span>➕</span>}
                    {isExtracting ? 'جاري قراءة بيانات السجل...' : 'رفع سجل تجاري / وثيقة حكومية'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrgManagement;
