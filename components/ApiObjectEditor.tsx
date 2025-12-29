
import React, { useState } from 'react';
import { ApiObject, FieldMapping, DataSource, Method, FormatterType, ApiCategory } from '../types';
import { Trash2, Plus, Code, FileJson, ServerCog } from 'lucide-react';
import { FormSimulator } from './FormSimulator';

interface Props {
  apiObject: ApiObject;
  dataSources: DataSource[];
  categories: ApiCategory[];
  onChange: (obj: ApiObject) => void;
  onDelete: () => void;
}

export const ApiObjectEditor: React.FC<Props> = ({ apiObject, dataSources, categories, onChange, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');

  const selectedSource = dataSources.find(ds => ds.id === apiObject.dataSourceId);
  const availableVars = selectedSource?.authConfig.responseVariables || [];

  const handleMappingChange = (index: number, field: keyof FieldMapping, value: string) => {
    const newMappings = [...apiObject.mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    onChange({ ...apiObject, mappings: newMappings });
  };

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: Date.now().toString(),
      parameter: '',
      sourcePath: '',
      description: '',
      formatter: 'none'
    };
    onChange({ ...apiObject, mappings: [...apiObject.mappings, newMapping] });
  };

  const removeMapping = (index: number) => {
    const newMappings = apiObject.mappings.filter((_, i) => i !== index);
    onChange({ ...apiObject, mappings: newMappings });
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all text-slate-800 placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl"><Code size={20} /></div>
            <h3 className="font-bold text-slate-900 text-lg">{apiObject.id.includes('new') ? '建立新物件' : '編輯 API 物件'}</h3>
        </div>
        {apiObject.id !== 'new' && (
            <button onClick={onDelete} className="text-slate-400 hover:text-red-600 p-2.5 rounded-lg transition-colors"><Trash2 size={18} /></button>
        )}
      </div>

      <div className="flex border-b border-slate-200 px-6 bg-slate-50/30 shrink-0 gap-6">
        <button onClick={() => setActiveTab('config')} className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'config' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>設定 (Configuration)</button>
        <button onClick={() => setActiveTab('test')} className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'test' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>模擬與測試 (Simulator)</button>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-50/50">
        {activeTab === 'config' ? (
            <div className="p-8 space-y-8 max-w-5xl mx-auto pb-20">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className={labelClass}>物件名稱</label><input type="text" value={apiObject.name} onChange={(e) => onChange({...apiObject, name: e.target.value})} className={inputClass} placeholder="供應商列表" /></div>
                    <div><label className={labelClass}>物件分類 (Category)</label><select value={apiObject.categoryId || ''} onChange={(e) => onChange({...apiObject, categoryId: e.target.value})} className={inputClass}><option value="">(未分類)</option>{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                    <div><label className={labelClass}>所屬資料來源</label><select value={apiObject.dataSourceId} onChange={(e) => onChange({...apiObject, dataSourceId: e.target.value})} className={inputClass}><option value="" disabled>請選擇資料來源...</option>{dataSources.map(ds => (<option key={ds.id} value={ds.id}>{ds.name}</option>))}</select></div>
                    <div><label className={labelClass}>HTTP Method</label><select value={apiObject.method} onChange={(e) => onChange({...apiObject, method: e.target.value as Method})} className={inputClass}><option value="POST">POST</option><option value="GET">GET</option></select></div>
                    <div className="col-span-2"><label className={labelClass}>API 路徑 (Path)</label><div className="relative"><span className="absolute left-3 top-3 text-slate-400 font-mono font-bold">/</span><input type="text" value={apiObject.path.startsWith('/') ? apiObject.path.substring(1) : apiObject.path} onChange={(e) => onChange({...apiObject, path: '/' + e.target.value.replace(/^\//, '')})} className={`${inputClass} pl-6 font-mono`} /></div></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <label className={labelClass}>請求內容 (Request Body JSON)</label>
                    <textarea value={apiObject.requestBodyTemplate || ''} onChange={(e) => onChange({...apiObject, requestBodyTemplate: e.target.value})} className="w-full h-40 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-sky-500 shadow-inner resize-y" />
                    <div className="mt-3 text-[10px] text-slate-500 flex flex-wrap gap-2 items-center font-bold">
                        <span>可用連線變數 (由資料來源定義):</span>
                        {availableVars.length > 0 ? availableVars.map(v => (
                            <span key={v.id} className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{`\${${v.variableName}}`}</span>
                        )) : <span className="text-slate-400 italic font-normal">尚未在連線設定中提取變數</span>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100"><ServerCog size={18} className="text-sky-600" /><label className="text-sm font-bold text-slate-800">資料對應設定 (Response Mapping)</label></div>
                    <div className="mb-6"><label className={labelClass}>資料列表根路徑 (Root Path)</label><input type="text" value={apiObject.responseRootPath || ''} onChange={(e) => onChange({...apiObject, responseRootPath: e.target.value})} className={`${inputClass} font-mono`} placeholder="e.g. data.items" /></div>
                    <div className="flex justify-between items-center mb-4"><label className={labelClass}>回傳欄位對應</label><button onClick={addMapping} className="text-xs flex items-center gap-1.5 text-white bg-sky-500 px-4 py-2 rounded-lg font-bold"><Plus size={14} /> 新增對應</button></div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        {apiObject.mappings.length === 0 ? <div className="p-10 text-center text-slate-400 bg-slate-50"><FileJson size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">尚未定義任何欄位</p></div> : (
                            <div className="divide-y divide-slate-100">
                                <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-3">JSON Key</div>
                                    <div className="col-span-2">參數代碼</div>
                                    <div className="col-span-4">欄位說明</div>
                                    <div className="col-span-2">格式轉換</div>
                                    <div className="col-span-1 text-center">刪除</div>
                                </div>
                                {apiObject.mappings.map((mapping, idx) => (
                                    <div key={mapping.id} className="grid grid-cols-12 gap-3 px-4 py-3 bg-white hover:bg-slate-50 items-center transition-colors">
                                        <div className="col-span-3"><input type="text" value={mapping.sourcePath} onChange={(e) => handleMappingChange(idx, 'sourcePath', e.target.value)} className={`${inputClass} font-mono h-9 text-xs border-slate-200 bg-slate-50/50`} /></div>
                                        <div className="col-span-2"><input type="text" value={mapping.parameter || ''} onChange={(e) => handleMappingChange(idx, 'parameter', e.target.value)} className={`${inputClass} font-mono h-9 text-xs border-sky-200 text-sky-700 bg-sky-50/30`} /></div>
                                        <div className="col-span-4"><input type="text" value={mapping.description || ''} onChange={(e) => handleMappingChange(idx, 'description', e.target.value)} className={`${inputClass} h-9 text-xs`} /></div>
                                        <div className="col-span-2"><select value={mapping.formatter || 'none'} onChange={(e) => handleMappingChange(idx, 'formatter', e.target.value as FormatterType)} className={`${inputClass} h-9 text-xs py-0`}><option value="none">不轉換</option><option value="date_slash">yyyy/MM/dd</option><option value="currency">金額 ($1,000)</option></select></div>
                                        <div className="col-span-1 text-center"><button onClick={() => removeMapping(idx)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <FormSimulator apiObject={apiObject} />
        )}
      </div>
    </div>
  );
};
