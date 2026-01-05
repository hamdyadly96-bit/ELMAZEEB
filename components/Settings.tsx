
import React, { useState } from 'react';
import { SystemSettings, CustomFieldDefinition } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'textarea'>('text');

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    const newField: CustomFieldDefinition = {
      id: `cf_${Date.now()}`,
      label: newFieldName,
      type: newFieldType,
      placeholder: `أدخل ${newFieldName}...`
    };
    setSettings({
      ...settings,
      customFieldDefinitions: [...(settings.customFieldDefinitions || []), newField]
    });
    setNewFieldName('');
  };

  const removeCustomField = (id: string) => {
    setSettings({
      ...settings,
      customFieldDefinitions: settings.customFieldDefinitions.filter(f => f.id !== id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">إعدادات النظام</h2>
        <p className="text-slate-500">تخصيص معايير العمل والحقول الإضافية.</p>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Custom Fields Management */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>📝</span> إدارة الحقول المخصصة
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">ميزة متقدمة</span>
          </div>
          
          <p className="text-xs text-slate-400 mb-6">
            يمكنك إضافة حقول إضافية لملفات الموظفين مثل (رقم الطوارئ، الخبرات السابقة، فصيلة الدم) وستظهر تلقائياً عند إضافة موظف جديد.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم الحقل</label>
              <input 
                type="text" 
                placeholder="مثلاً: هاتف الطوارئ"
                className="w-full border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={newFieldName}
                onChange={e => setNewFieldName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">نوع البيانات</label>
              <select 
                className="w-full border rounded-xl p-2 text-sm outline-none"
                value={newFieldType}
                onChange={e => setNewFieldType(e.target.value as any)}
              >
                <option value="text">نص قصير</option>
                <option value="textarea">نص طويل</option>
                <option value="number">رقم</option>
                <option value="date">تاريخ</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={addCustomField}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
              >
                إضافة الحقل
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {settings.customFieldDefinitions?.map(field => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-100 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">
                    {field.type === 'text' ? 'abc' : field.type === 'textarea' ? 'TXT' : field.type === 'number' ? '123' : '📅'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{field.label}</p>
                    <p className="text-[10px] text-slate-400">نوع: {
                      field.type === 'text' ? 'نص قصير' : 
                      field.type === 'textarea' ? 'نص طويل' :
                      field.type === 'number' ? 'رقم' : 'تاريخ'
                    }</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeCustomField(field.id)}
                  className="text-slate-300 hover:text-red-500 p-2 transition opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            ))}
            {(!settings.customFieldDefinitions || settings.customFieldDefinitions.length === 0) && (
              <p className="text-center text-xs text-slate-400 py-4 italic">لا توجد حقول مخصصة معرّفة حالياً.</p>
            )}
          </div>
        </div>

        {/* Existing Alerts Configuration */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🔔</span> إعدادات التنبيهات والوثائق
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">فترة التنبيه المسبق (بالأيام)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="7" 
                  max="180" 
                  step="7"
                  className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={settings.alertThresholdDays}
                  onChange={(e) => setSettings({...settings, alertThresholdDays: parseInt(e.target.value)})}
                />
                <span className="w-20 text-center bg-blue-50 text-blue-700 font-bold py-1 rounded-xl border border-blue-100">
                  {settings.alertThresholdDays} يوم
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🏢</span> معلومات المنشأة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم الشركة / المؤسسة</label>
              <input 
                type="text" 
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-sm">المزامنة التلقائية مع البصمة</p>
                <p className="text-xs text-slate-500">تحديث الحضور تلقائياً كل 24 ساعة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoSyncBiometric}
                  onChange={(e) => setSettings({...settings, autoSyncBiometric: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
