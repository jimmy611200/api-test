
import React, { useState } from 'react';
import { FormElement, FormElementType, FormElementOption, ApiObject, ApiBinding } from '../types';
import { 
  Type, Hash, Calendar, List, CheckSquare, CircleDot, 
  AlignLeft, Settings2, Trash2, GripVertical, Plus, X, Copy,
  MousePointer2, Square, Link2, Info
} from 'lucide-react';

interface Props {
  apiObjects: ApiObject[];
}

export const FormDesigner: React.FC<Props> = ({ apiObjects = [] }) => {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  // --- Actions ---

  const addElement = (type: FormElementType) => {
    const id = `el_${Date.now()}`;
    const newElement: FormElement = {
        id,
        type,
        label: getDefaultLabel(type),
        fieldKey: `field_${Date.now()}`,
        required: false,
        width: 'full',
        options: (type === 'select' || type === 'radio' || type === 'checkbox') 
            ? [{ label: '選項 1', value: 'opt1' }, { label: '選項 2', value: 'opt2' }] 
            : undefined
    };
    setElements([...elements, newElement]);
    setSelectedId(id);
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newId = `el_${Date.now()}`;
    const newEl = { 
        ...el, 
        id: newId, 
        fieldKey: `${el.fieldKey}_copy`, 
        label: `${el.label} (複製)` 
    };
    setElements([...elements, newEl]);
    setSelectedId(newId);
  };

  // --- Binding Actions ---
  
  const handleBindingChange = (field: keyof ApiBinding, value: string) => {
      if (!selectedElement) return;
      
      const newBinding: ApiBinding = {
          ...(selectedElement.apiBinding || { apiObjectId: '' }),
          [field]: value
      };
      
      // Reset child mappings if API changes
      if (field === 'apiObjectId') {
          newBinding.valueMappingId = '';
          newBinding.labelMappingId = '';
          newBinding.fillMappingId = '';
      }

      updateElement(selectedElement.id, { apiBinding: newBinding });
  };

  // --- Helpers ---

  const getDefaultLabel = (type: FormElementType) => {
    const map: Record<FormElementType, string> = {
        text: '單行文字',
        textarea: '多行文字',
        number: '數值輸入',
        date: '日期選擇',
        select: '下拉選單',
        radio: '單選按鈕',
        checkbox: '多選核取',
        section: '區塊標題'
    };
    return map[type];
  };

  const getIcon = (type: FormElementType, size = 16) => {
    const icons: Record<FormElementType, React.ReactNode> = {
        text: <Type size={size} />,
        textarea: <AlignLeft size={size} />,
        number: <Hash size={size} />,
        date: <Calendar size={size} />,
        select: <List size={size} />,
        radio: <CircleDot size={size} />,
        checkbox: <CheckSquare size={size} />,
        section: <Square size={size} />
    };
    return icons[type];
  };

  // --- Property Editors ---

  const handleOptionChange = (idx: number, key: 'label' | 'value', val: string) => {
    if (!selectedElement || !selectedElement.options) return;
    const newOpts = [...selectedElement.options];
    newOpts[idx] = { ...newOpts[idx], [key]: val };
    updateElement(selectedElement.id, { options: newOpts });
  };

  const addOption = () => {
    if (!selectedElement || !selectedElement.options) return;
    updateElement(selectedElement.id, { 
        options: [...selectedElement.options, { label: '新選項', value: `opt${Date.now()}` }] 
    });
  };

  const removeOption = (idx: number) => {
    if (!selectedElement || !selectedElement.options) return;
    updateElement(selectedElement.id, { 
        options: selectedElement.options.filter((_, i) => i !== idx) 
    });
  };

  // Style constants
  const inputClass = "w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide";

  // Helper to check if element supports binding
  const isListType = (type: FormElementType) => ['select', 'radio', 'checkbox'].includes(type);
  const isValueType = (type: FormElementType) => ['text', 'number', 'date', 'textarea'].includes(type);

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden">
        
        {/* Left: Toolbox */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
            <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MousePointer2 size={16} className="text-indigo-600" />
                    元件工具箱
                </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3">
                    {(['text', 'number', 'textarea', 'date', 'select', 'radio', 'checkbox', 'section'] as FormElementType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => addElement(type)}
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md transition-all group"
                        >
                            <div className="text-slate-500 group-hover:text-indigo-600 transition-colors">
                                {getIcon(type, 20)}
                            </div>
                            <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">{getDefaultLabel(type)}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center">
                點擊上方元件加入表單
            </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex flex-col items-center" onClick={() => setSelectedId(null)}>
            <div className="w-full max-w-2xl bg-white min-h-[calc(100vh-8rem)] rounded-xl shadow-sm border border-slate-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                {/* Canvas Header */}
                <div className="h-16 bg-indigo-600 rounded-t-xl flex items-center px-8 shadow-sm">
                    <h1 className="text-white text-lg font-bold">新表單設計</h1>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-8 space-y-2">
                    {elements.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 m-4">
                            <MousePointer2 size={48} className="mb-4 opacity-50" />
                            <p className="text-sm font-medium">從左側點擊元件開始設計表單</p>
                        </div>
                    ) : (
                        elements.map((el) => (
                            <div 
                                key={el.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                                className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                    selectedId === el.id 
                                    ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-500/10' 
                                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {/* Form Element Render */}
                                <div className="pointer-events-none"> {/* Prevent input interaction while designing */}
                                    {el.type === 'section' ? (
                                        <div className="border-b-2 border-slate-800 pb-2 mt-4 mb-2">
                                            <h3 className="text-lg font-bold text-slate-800">{el.label}</h3>
                                            {el.description && <p className="text-sm text-slate-500 font-normal mt-1">{el.description}</p>}
                                        </div>
                                    ) : (
                                        <div className={el.width === 'half' ? 'w-1/2' : el.width === 'third' ? 'w-1/3' : 'w-full'}>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                                <span>{el.label} {el.required && <span className="text-red-500">*</span>}</span>
                                                {el.apiBinding?.apiObjectId && (
                                                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-indigo-100">
                                                        <Link2 size={10} /> API
                                                    </span>
                                                )}
                                            </label>
                                            
                                            {/* Input Preview */}
                                            {el.type === 'text' && <input type="text" className={inputClass} placeholder={el.placeholder} disabled />}
                                            {el.type === 'number' && <input type="number" className={inputClass} placeholder={el.placeholder} disabled />}
                                            {el.type === 'date' && <input type="date" className={inputClass} disabled />}
                                            {el.type === 'textarea' && <textarea className={inputClass + " h-24 resize-none"} placeholder={el.placeholder} disabled />}
                                            {el.type === 'select' && (
                                                <select className={inputClass} disabled>
                                                    <option>請選擇...</option>
                                                    {el.apiBinding?.apiObjectId ? <option>(API 資料選項)</option> : el.options?.map((opt, i) => <option key={i}>{opt.label}</option>)}
                                                </select>
                                            )}
                                            {(el.type === 'radio' || el.type === 'checkbox') && (
                                                <div className="space-y-2">
                                                    {el.apiBinding?.apiObjectId ? (
                                                        <div className="text-xs text-slate-400 italic pl-1 flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                                                            API 動態選項...
                                                        </div>
                                                    ) : (
                                                        el.options?.map((opt, i) => (
                                                            <label key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                                <input type={el.type} disabled className="text-indigo-600 focus:ring-indigo-500" />
                                                                {opt.label}
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                            
                                            {el.description && (
                                                <p className="text-xs text-slate-500 mt-1.5">{el.description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions (Show on hover or select) */}
                                {(selectedId === el.id) && (
                                    <div className="absolute right-2 top-2 flex gap-1 bg-white shadow-sm border border-slate-200 rounded-lg p-1 animate-in fade-in duration-200 z-10">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600" title="複製"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                            className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600" title="刪除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Right: Property Panel */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 shadow-sm transition-all">
            <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Settings2 size={16} className="text-slate-500" />
                    屬性設定 (Properties)
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
                {selectedElement ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                {getIcon(selectedElement.type)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">{getDefaultLabel(selectedElement.type)}</div>
                                <div className="text-xs text-slate-400 font-mono">{selectedElement.id}</div>
                            </div>
                        </div>

                        {/* Common Fields */}
                        <div>
                            <label className={labelClass}>欄位標題 (Label)</label>
                            <input 
                                type="text"
                                value={selectedElement.label}
                                onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>系統代號 (Field Key)</label>
                            <input 
                                type="text"
                                value={selectedElement.fieldKey}
                                onChange={(e) => updateElement(selectedElement.id, { fieldKey: e.target.value })}
                                className={`${inputClass} font-mono text-slate-600`}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">用於資料庫儲存與 API 對應</p>
                        </div>

                        {selectedElement.type !== 'section' && (
                            <>
                                <div className="flex items-center gap-2 pt-2">
                                    <input 
                                        type="checkbox"
                                        id="req_chk"
                                        checked={selectedElement.required}
                                        onChange={(e) => updateElement(selectedElement.id, { required: e.target.checked })}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <label htmlFor="req_chk" className="text-sm font-medium text-slate-700 cursor-pointer select-none">設為必填欄位 (Required)</label>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <label className={`${labelClass} col-span-3`}>寬度 (Width)</label>
                                    {(['full', 'half', 'third'] as const).map(w => (
                                        <button
                                            key={w}
                                            onClick={() => updateElement(selectedElement.id, { width: w })}
                                            className={`text-xs py-1.5 px-2 rounded border text-center ${
                                                selectedElement.width === w 
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            {w === 'full' ? '100%' : w === 'half' ? '50%' : '33%'}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <label className={labelClass}>提示文字 (Placeholder)</label>
                                    <input 
                                        type="text"
                                        value={selectedElement.placeholder || ''}
                                        onChange={(e) => updateElement(selectedElement.id, { placeholder: e.target.value })}
                                        className={inputClass}
                                        placeholder="輸入提示..."
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className={labelClass}>說明文字 (Description)</label>
                                    <textarea 
                                        value={selectedElement.description || ''}
                                        onChange={(e) => updateElement(selectedElement.id, { description: e.target.value })}
                                        className={inputClass + " h-20 resize-none"}
                                        placeholder="顯示在欄位下方的輔助說明"
                                    />
                                </div>
                            </>
                        )}

                        {/* --- Data Binding Section (New) --- */}
                        {(isListType(selectedElement.type) || isValueType(selectedElement.type)) && (
                            <div className="pt-4 border-t border-slate-100 mt-6 bg-slate-50 -mx-5 px-5 pb-5">
                                <div className="flex items-center gap-2 mb-3 pt-3">
                                    <Link2 size={16} className="text-indigo-600" />
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">資料來源綁定 (Data Binding)</label>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className={labelClass}>API 物件來源</label>
                                        <select 
                                            value={selectedElement.apiBinding?.apiObjectId || ''}
                                            onChange={(e) => handleBindingChange('apiObjectId', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">(無綁定 - 使用手動輸入)</option>
                                            {apiObjects.map(api => (
                                                <option key={api.id} value={api.id}>{api.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dependent Fields based on selected API */}
                                    {selectedElement.apiBinding?.apiObjectId && (() => {
                                        const selectedApi = apiObjects.find(a => a.id === selectedElement.apiBinding?.apiObjectId);
                                        if (!selectedApi) return null;

                                        return (
                                            <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
                                                {isListType(selectedElement.type) ? (
                                                    <>
                                                        <div>
                                                            <label className={labelClass}>選項值欄位 (Value Field)</label>
                                                            <select 
                                                                value={selectedElement.apiBinding?.valueMappingId || ''}
                                                                onChange={(e) => handleBindingChange('valueMappingId', e.target.value)}
                                                                className={inputClass}
                                                            >
                                                                <option value="">-- 選擇對應 --</option>
                                                                {selectedApi.mappings.map(m => (
                                                                    <option key={m.id} value={m.id}>{m.sourcePath} ({m.targetProperty})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className={labelClass}>顯示文字欄位 (Label Field)</label>
                                                            <select 
                                                                value={selectedElement.apiBinding?.labelMappingId || ''}
                                                                onChange={(e) => handleBindingChange('labelMappingId', e.target.value)}
                                                                className={inputClass}
                                                            >
                                                                <option value="">-- 選擇對應 --</option>
                                                                {selectedApi.mappings.map(m => (
                                                                    <option key={m.id} value={m.id}>{m.sourcePath} ({m.targetProperty})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 bg-blue-50 p-2 rounded border border-blue-100 flex gap-2">
                                                            <Info size={14} className="shrink-0 text-blue-500" />
                                                            設定後，手動選項將被 API 回傳的列表覆蓋。
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <label className={labelClass}>預設值欄位 (Fill Value)</label>
                                                        <select 
                                                            value={selectedElement.apiBinding?.fillMappingId || ''}
                                                            onChange={(e) => handleBindingChange('fillMappingId', e.target.value)}
                                                            className={inputClass}
                                                        >
                                                            <option value="">-- 選擇對應 --</option>
                                                            {selectedApi.mappings.map(m => (
                                                                <option key={m.id} value={m.id}>{m.sourcePath} ({m.formatter || 'raw'})</option>
                                                            ))}
                                                        </select>
                                                        <p className="text-[10px] text-slate-400 mt-1">表單載入時將自動填入此欄位的值。</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Manual Options Editor (Only if NO API bound or user wants fallback) */}
                        {isListType(selectedElement.type) && !selectedElement.apiBinding?.apiObjectId && (
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className={labelClass + " mb-0"}>手動選項設定</label>
                                    <button 
                                        onClick={addOption}
                                        className="text-[10px] flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold transition-colors"
                                    >
                                        <Plus size={12} /> 新增
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedElement.options?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group">
                                            <GripVertical size={14} className="text-slate-300 cursor-move" />
                                            <input 
                                                type="text"
                                                value={opt.label}
                                                onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                                                placeholder="顯示文字"
                                            />
                                            <input 
                                                type="text"
                                                value={opt.value}
                                                onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                                                className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-slate-600 placeholder-slate-400"
                                                placeholder="值"
                                            />
                                            <button 
                                                onClick={() => removeOption(idx)}
                                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                        <Settings2 size={40} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">尚未選取任何元件</p>
                        <p className="text-xs mt-2 opacity-60">點擊中間畫布上的欄位<br/>以編輯屬性</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
