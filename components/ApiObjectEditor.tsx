
import React, { useState } from 'react';
import { ApiObject, FieldMapping, DataSource, Method, FormatterType } from '../types';
import { Trash2, Plus, Code, ArrowRight, FileJson, Info, PlayCircle, Target, ArrowDown } from 'lucide-react';
import { FormSimulator } from './FormSimulator';

interface Props {
  apiObject: ApiObject;
  dataSources: DataSource[];
  onChange: (obj: ApiObject) => void;
  onDelete: () => void;
}

export const ApiObjectEditor: React.FC<Props> = ({ apiObject, dataSources, onChange, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');

  const handleMappingChange = (index: number, field: keyof FieldMapping, value: string) => {
    const newMappings = [...apiObject.mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    onChange({ ...apiObject, mappings: newMappings });
  };

  const addMapping = () => {
    const newMapping: FieldMapping = {
      id: Date.now().toString(),
      sourcePath: '',
      targetProperty: 'extra',
      targetExtraName: '',
      formatter: 'none'
    };
    onChange({ ...apiObject, mappings: [...apiObject.mappings, newMapping] });
  };

  const removeMapping = (index: number) => {
    const newMappings = apiObject.mappings.filter((_, i) => i !== index);
    onChange({ ...apiObject, mappings: newMappings });
  };

  // Styles
  const inputClass = "w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-slate-800 placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                <Code size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">
                    {apiObject.id.includes('new') ? '建立新物件' : '編輯 API 物件'}
                </h3>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {apiObject.id !== 'new' && (
                <button onClick={onDelete} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="刪除物件">
                    <Trash2 size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-white">
        <button 
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            設定 (Configuration)
        </button>
        <button 
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'test' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            模擬與測試 (Simulator)
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden bg-slate-50/50">
        {activeTab === 'config' ? (
            <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className={labelClass}>物件名稱 (用於表單設計器)</label>
                            <input 
                                type="text" 
                                value={apiObject.name}
                                onChange={(e) => onChange({...apiObject, name: e.target.value})}
                                className={inputClass}
                                placeholder="例如: 供應商列表 (供下拉選單使用)"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>所屬資料來源</label>
                            <select
                                value={apiObject.dataSourceId}
                                onChange={(e) => onChange({...apiObject, dataSourceId: e.target.value})}
                                className={inputClass}
                            >
                                <option value="" disabled>請選擇資料來源...</option>
                                {dataSources.map(ds => (
                                    <option key={ds.id} value={ds.id}>{ds.name} ({ds.host})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>HTTP Method</label>
                            <select
                                value={apiObject.method}
                                onChange={(e) => onChange({...apiObject, method: e.target.value as Method})}
                                className={inputClass}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>API 路徑 (Path)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400 text-sm font-mono">/</span>
                                <input 
                                    type="text" 
                                    value={apiObject.path.startsWith('/') ? apiObject.path.substring(1) : apiObject.path}
                                    onChange={(e) => onChange({...apiObject, path: '/' + e.target.value.replace(/^\//, '')})}
                                    className={`${inputClass} pl-6 font-mono`}
                                    placeholder="api/v1/users"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Request Body */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <label className={labelClass}>請求內容 (Request Body JSON)</label>
                            {apiObject.method === 'GET' && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium border border-orange-100">GET 請求通常不需要 Body</span>}
                        </div>
                        <textarea 
                            value={apiObject.requestBodyTemplate || ''}
                            onChange={(e) => onChange({...apiObject, requestBodyTemplate: e.target.value})}
                            className="w-full h-40 bg-white border border-slate-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-y"
                            placeholder="{ ... }"
                        />
                        <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                            <span>可用變數:</span>
                            <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{'${SessionID}'}</span> 
                            <span>引用 Token，或</span> 
                            <span className="font-mono text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">{'${表單欄位}'}</span> 
                            <span>建立動態參數。</span>
                        </div>
                    </div>

                    {/* Response Mapping (The Core Part) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        
                        {/* 1. Root Path */}
                        <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="col-span-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <label className={labelClass + " mb-0"}>資料列表根路徑 (Response Root Path)</label>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                        選填
                                    </span>
                                </div>
                                <input 
                                    type="text" 
                                    value={apiObject.responseRootPath || ''}
                                    onChange={(e) => onChange({...apiObject, responseRootPath: e.target.value})}
                                    className={`${inputClass} font-mono`}
                                    placeholder="例如: data.items 或 PayeeList (若回傳直接為陣列請留空)"
                                />
                                <p className="text-xs text-slate-400 mt-2">告訴系統陣列資料在哪裡，例如: <code>{`{ "data": [ ... ] }`}</code> 則填入 <code>data</code></p>
                            </div>
                        </div>

                        {/* 2. Visual Guide */}
                        <div className="mb-6 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                                <Target size={18} />
                                如何設定欄位對應？
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-center">
                                    <div className="font-bold text-slate-700 mb-1">1. 來源 (API)</div>
                                    <div className="font-mono text-slate-500 mb-2">VendorCode</div>
                                    <ArrowDown size={14} className="mx-auto text-indigo-300 mb-1" />
                                    <div className="font-bold text-emerald-600">儲存值 (Value)</div>
                                    <div className="text-slate-400 mt-1">寫入資料庫的 ID</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-center">
                                    <div className="font-bold text-slate-700 mb-1">1. 來源 (API)</div>
                                    <div className="font-mono text-slate-500 mb-2">VendorName</div>
                                    <ArrowDown size={14} className="mx-auto text-indigo-300 mb-1" />
                                    <div className="font-bold text-blue-600">顯示文字 (Label)</div>
                                    <div className="text-slate-400 mt-1">使用者看到的選項</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-center">
                                    <div className="font-bold text-slate-700 mb-1">1. 來源 (API)</div>
                                    <div className="font-mono text-slate-500 mb-2">TaxID</div>
                                    <ArrowDown size={14} className="mx-auto text-indigo-300 mb-1" />
                                    <div className="font-bold text-purple-600">連動欄位 (Extra)</div>
                                    <div className="text-slate-400 mt-1">自動填入 "統編欄位"</div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Mapping List */}
                        <div className="flex justify-between items-center mb-4">
                            <label className={labelClass}>對應規則列表 (Mapping Rules)</label>
                            <button onClick={addMapping} className="text-xs flex items-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm font-medium">
                                <Plus size={14} /> 新增規則
                            </button>
                        </div>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                            {apiObject.mappings.length === 0 ? (
                                <div className="p-10 text-center text-slate-400">
                                    <FileJson size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">尚未設定任何規則</p>
                                    <p className="text-xs mt-1 opacity-70">點擊上方按鈕，告訴系統如何使用 API 回傳的資料</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {/* Header */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <div className="col-span-3">API 來源欄位 (JSON Key)</div>
                                        <div className="col-span-4">用途 (表單對應)</div>
                                        <div className="col-span-3">格式轉換</div>
                                        <div className="col-span-2 text-center">操作</div>
                                    </div>

                                    {/* Rows */}
                                    {apiObject.mappings.map((mapping, idx) => (
                                        <div key={mapping.id} className="grid grid-cols-12 gap-4 px-4 py-3 bg-white hover:bg-slate-50 items-start group transition-colors">
                                            {/* Source */}
                                            <div className="col-span-3 pt-1">
                                                <input 
                                                    type="text" 
                                                    value={mapping.sourcePath}
                                                    onChange={(e) => handleMappingChange(idx, 'sourcePath', e.target.value)}
                                                    className={`${inputClass} font-mono h-9 text-xs`} 
                                                    placeholder="e.g. PayeeCode"
                                                />
                                            </div>

                                            {/* Target */}
                                            <div className="col-span-4 pt-1">
                                                <select 
                                                    value={mapping.targetProperty}
                                                    onChange={(e) => handleMappingChange(idx, 'targetProperty', e.target.value as any)}
                                                    className={`${inputClass} h-9 text-xs cursor-pointer font-medium ${
                                                        mapping.targetProperty === 'value' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                                        mapping.targetProperty === 'label' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                                        'text-purple-700 bg-purple-50 border-purple-200'
                                                    }`}
                                                >
                                                    <option value="value">🟢 作為主要儲存值 (Value)</option>
                                                    <option value="label">🔵 作為顯示文字 (Label)</option>
                                                    <option value="extra">🟣 連動填入其他欄位 (Extra)</option>
                                                </select>
                                                
                                                {/* Extra Field Name Input */}
                                                {mapping.targetProperty === 'extra' && (
                                                    <div className="mt-2 animate-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <ArrowRight size={12} className="text-slate-400" />
                                                            <span className="text-[10px] text-slate-500 font-bold">填入哪個表單欄位?</span>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={mapping.targetExtraName || ''}
                                                            onChange={(e) => handleMappingChange(idx, 'targetExtraName', e.target.value)}
                                                            className={`${inputClass} h-8 text-xs font-mono placeholder:text-slate-300 border-purple-200 focus:border-purple-500 focus:ring-purple-500`}
                                                            placeholder="輸入該欄位的 Field Key"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Helper Text */}
                                                <div className="mt-1 text-[10px] text-slate-400">
                                                    {mapping.targetProperty === 'value' && '表單送出時，資料庫會儲存這個值。'}
                                                    {mapping.targetProperty === 'label' && '使用者在下拉選單中會看到這個文字。'}
                                                    {mapping.targetProperty === 'extra' && '當使用者選擇此項目時，自動將值填入指定欄位。'}
                                                </div>
                                            </div>

                                            {/* Formatter */}
                                            <div className="col-span-3 pt-1">
                                                <select 
                                                    value={mapping.formatter || 'none'}
                                                    onChange={(e) => handleMappingChange(idx, 'formatter', e.target.value as FormatterType)}
                                                    className={`${inputClass} h-9 text-xs text-slate-600 cursor-pointer`}
                                                >
                                                    <option value="none">不轉換 (原始值)</option>
                                                    <option value="date_slash">日期 (yyyy/MM/dd)</option>
                                                    <option value="date_dash">日期 (yyyy-MM-dd)</option>
                                                    <option value="currency">金額 (千分位+錢字號)</option>
                                                    <option value="boolean_yn">布林值 (Y/N)</option>
                                                    <option value="uppercase">轉大寫 (UPPER)</option>
                                                    <option value="lowercase">轉小寫 (lower)</option>
                                                </select>
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-2 text-center pt-1">
                                                <button onClick={() => removeMapping(idx)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <FormSimulator 
                apiObject={apiObject} 
                dataSource={dataSources.find(ds => ds.id === apiObject.dataSourceId)} 
            />
        )}
      </div>
    </div>
  );
};
