
import React, { useState } from 'react';
import { CareerPath, CareerLevel, SystemSettings } from '../types';

interface CareerPathManagementProps {
  careerPaths: CareerPath[];
  setCareerPaths: (paths: CareerPath[]) => void;
  settings: SystemSettings;
}

const CareerPathManagement: React.FC<CareerPathManagementProps> = ({ careerPaths, setCareerPaths, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activePathId, setActivePathId] = useState<string | null>(null);

  const [pathData, setPathData] = useState<Partial<CareerPath>>({
    name: '',
    department: settings.departments[0],
    levels: []
  });

  const openAddModal = () => {
    setIsEditing(false);
    setActivePathId(null);
    setPathData({ name: '', department: settings.departments[0], levels: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (path: CareerPath) => {
    setIsEditing(true);
    setActivePathId(path.id);
    setPathData({ ...path });
    setIsModalOpen(true);
  };

  const handleSavePath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathData.name) return;

    if (isEditing && activePathId) {
      setCareerPaths(careerPaths.map(p => p.id === activePathId ? { ...pathData as CareerPath } : p));
    } else {
      const path: CareerPath = {
        id: `path_${Date.now()}`,
        name: pathData.name!,
        department: pathData.department!,
        levels: pathData.levels || []
      };
      setCareerPaths([...careerPaths, path]);
    }
    setIsModalOpen(false);
  };

  const addLevel = () => {
    const level: CareerLevel = {
      id: `lv_${Date.now()}`,
      title: 'مستوى جديد',
      description: '',
      requiredSkills: [],
      requiredCourses: [],
      salaryRange: { min: 5000, max: 8000 }
    };
    setPathData({ ...pathData, levels: [...(pathData.levels || []), level] });
  };

  const removeLevel = (id: string) => {
    setPathData({ ...pathData, levels: (pathData.levels || []).filter(l => l.id !== id) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة مسارات النمو</h2>
          <p className="text-sm text-slate-500 font-medium">تحديد مستويات الترقية والمتطلبات المهارية.</p>
        </div>
        <button onClick={openAddModal} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active-scale"><span>🚀</span> إنشاء مسار جديد</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careerPaths.map(path => (
          <div key={path.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <h3 className="text-xl font-black text-slate-800 mb-4">{path.name}</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-6 tracking-widest">{path.department}</p>
            <div className="space-y-3 mb-8">
              {path.levels.map((lv, i) => (
                <div key={lv.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-50 border flex items-center justify-center text-[10px] font-black">{i+1}</span>
                  <span className="text-xs font-bold text-slate-600">{lv.title}</span>
                </div>
              ))}
            </div>
            <button onClick={() => openEditModal(path)} className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">تعديل تفاصيل المسار ✏️</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black text-slate-800 mb-8">{isEditing ? 'تعديل مسار وظيفي' : 'تعريف مسار جديد'}</h3>
            <form onSubmit={handleSavePath} className="space-y-6">
              <input className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="اسم المسار" value={pathData.name} onChange={e => setPathData({...pathData, name: e.target.value})} required />
              <select className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold outline-none" value={pathData.department} onChange={e => setPathData({...pathData, department: e.target.value})}>
                {settings.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h4 className="text-xs font-black uppercase">المستويات</h4><button type="button" onClick={addLevel} className="text-xs text-blue-600 font-bold">+ إضافة مستوى</button></div>
                {pathData.levels?.map((lv, idx) => (
                  <div key={lv.id} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative">
                    <button type="button" onClick={() => removeLevel(lv.id)} className="absolute top-2 left-2 text-red-400">✕</button>
                    <input className="w-full bg-white rounded-xl p-2 text-xs font-bold" placeholder="مسمى المستوى" value={lv.title} onChange={e => {
                      const newLevels = [...pathData.levels!];
                      newLevels[idx].title = e.target.value;
                      setPathData({...pathData, levels: newLevels});
                    }} />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black">حفظ التغييرات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPathManagement;
