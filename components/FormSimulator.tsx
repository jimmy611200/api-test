
import React, { useState, useMemo, useEffect } from 'react';
import { ApiObject, DataSource, FormatterType } from '../types';
import { Play, LayoutTemplate, ArrowRight, Loader2, Code2, List, Type, CheckSquare, Calendar, RefreshCw, MousePointerClick, CircleDot, Database, ArrowDownToLine, ScanLine } from 'lucide-react';

interface Props {
  apiObject: ApiObject;
  dataSource?: DataSource;
}

const formatValue = (value: any, type?: FormatterType): string => {
    if (value === undefined || value === null) return '';
    const strVal = String(value);
    
    switch (type) {
        case 'date_slash': return strVal.replace(/-/g, '/').split('T')[0];
        case 'date_dash': return strVal.replace(/\//g, '-').split('T')[0];
        case 'currency': return !isNaN(Number(strVal)) ? `$${Number(strVal).toLocaleString()}` : strVal;
        case 'boolean_yn': return (strVal === 'true' || strVal === '1' || strVal === 'Y') ? 'Y' : 'N';
        case 'uppercase': return strVal.toUpperCase();
        case 'lowercase': return strVal.toLowerCase();
        default: return strVal;
    }
};

const getValueByPath = (obj: any, path: string) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const setDeepValue = (obj: any, path: string, value: any) => {
    if (!path) return;
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
};

type PreviewType = 'select' | 'radio' | 'checkbox' | 'text' | 'date';

export const FormSimulator: React.FC<Props> = ({ apiObject }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseData, setResponseData] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Selection States
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<PreviewType>('select');

  // Auto-select first mapping when loaded
  useEffect(() => {
      if (apiObject.mappings.length > 0 && !selectedMappingId) {
          setSelectedMappingId(apiObject.mappings[0].id);
      }
  }, [apiObject.mappings]);

  const activeMapping = apiObject.mappings.find(m => m.id === selectedMappingId);

  const generateMockData = () => {
    const mockCount = 5; // Generate 5 items for list simulation
    const mocks = [];

    for (let i = 0; i < mockCount; i++) {
        const row: any = {};
        
        apiObject.mappings.forEach(m => {
            if (!m.sourcePath) return;

            let val: any = null;
            const suffix = ` ${i + 1}`; 

            const fieldName = m.sourcePath.toLowerCase();
            
            if (m.formatter?.includes('date') || fieldName.includes('date') || fieldName.includes('time')) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                val = d.toISOString().split('T')[0];
            } else if (m.formatter === 'currency' || m.formatter === 'number' || fieldName.includes('amount') || fieldName.includes('price')) {
                val = (i + 1) * 1000 + 500;
            } else if (m.formatter === 'boolean_yn' || fieldName.startsWith('is') || fieldName.startsWith('has')) {
                val = i % 2 === 0 ? 'Y' : 'N';
            } else if (fieldName.includes('email')) {
                val = `user${i+1}@example.com`;
            } else if (fieldName.includes('id') || fieldName.includes('code') || fieldName.includes('no')) {
                val = `CODE-${1000 + i}`;
            } else {
                val = `${m.description || m.parameter || m.sourcePath}${suffix}`;
            }

            setDeepValue(row, m.sourcePath, val);
        });

        if (apiObject.mappings.length === 0) {
            row['id'] = i + 1;
            row['value'] = `Sample Data ${i + 1}`;
        }
        mocks.push(row);
    }
    return mocks;
  };

  const executeSimulation = () => {
    setStatus('loading');
    setResponseData([]);
    setRawResponse(null);

    setTimeout(() => {
        const mocks = generateMockData();
        setResponseData(mocks);
        
        let raw: any = mocks;
        if (apiObject.responseRootPath) {
            const rootParts = apiObject.responseRootPath.split('.');
            // Reduce right to build the nested object: Data -> PayeeList -> [Array]
            raw = rootParts.reduceRight((acc, part) => ({ [part]: acc }), mocks);
        }
        
        setRawResponse({ 
            Status: "Success",
            StatusCode: 200,
            Data: raw,
            Message: "Simulation Completed"
        });
        
        setStatus('success');
    }, 500);
  };

  // Helper to get formatted values for the active mapping
  const getPreviewValues = () => {
      if (!activeMapping) return [];
      return responseData.map(item => {
          const raw = getValueByPath(item, activeMapping.sourcePath);
          return formatValue(raw, activeMapping.formatter);
      });
  };

  const previewValues = getPreviewValues();
  const isCollectionMode = ['select', 'radio', 'checkbox'].includes(previewType);

  return (
    // Replaced h-full with min-h-full to allow scrolling if content is tall
    <div className="flex flex-col min-h-full bg-slate-50">
        
        {/* TOP SECTION: Execution & JSON */}
        {/* Reduced height to 200px to give more room to the bottom section */}
        <div className="h-[200px] bg-slate-900 flex flex-col shrink-0 border-b border-slate-800 shadow-md z-20">
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between bg-slate-950 border-b border-white/10">
                 <div className="flex items-center gap-3">
                    <div className="text-sky-400 p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                         <Code2 size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200 text-sm tracking-wide">模擬資料生成 (Data Simulation)</h3>
                </div>

                <div className="flex items-center gap-4">
                    {status === 'success' && (
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            HTTP 200 OK • {responseData.length} Items
                        </span>
                    )}
                    <button 
                        onClick={executeSimulation}
                        disabled={status === 'loading'}
                        className="flex items-center gap-2 bg-sky-500 text-white px-4 py-1.5 rounded-lg hover:bg-sky-400 transition-all shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
                    >
                        {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                        {status === 'loading' ? 'Generating...' : 'Execute API'}
                    </button>
                </div>
            </div>

            {/* Content: Raw JSON */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-900/50 relative">
                <pre className={`text-xs font-mono leading-relaxed whitespace-pre-wrap ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                    {(status === 'success' || status === 'error') && rawResponse 
                        ? JSON.stringify(rawResponse, null, 2) 
                        : <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <RefreshCw size={24} className="mb-2" />
                            <span className="text-xs">點擊上方按鈕執行模擬</span>
                          </div>
                    }
                </pre>
            </div>
        </div>

        {/* BOTTOM SECTION */}
        {/* Enforced min-h-[600px] to make it tall */}
        <div className="flex-1 flex min-h-[600px] bg-white">
            
            {/* LEFT: Mapping Selection */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                        <List size={14} className="text-sky-600" />
                        1. 選擇回傳參數 (Mappings)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                        點擊下方參數以綁定至預覽元件
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {apiObject.mappings.length === 0 ? (
                         <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                            尚未設定回傳欄位
                        </div>
                    ) : (
                        apiObject.mappings.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMappingId(m.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all relative group ${
                                    selectedMappingId === m.id 
                                    ? 'bg-sky-50 border-sky-200 shadow-sm ring-1 ring-sky-500/20' 
                                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold font-mono ${selectedMappingId === m.id ? 'text-sky-700' : 'text-slate-600'}`}>
                                        {m.parameter || '(無別名)'}
                                    </span>
                                    {selectedMappingId === m.id && <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate" title={m.description || m.sourcePath}>
                                    {m.description || m.sourcePath}
                                </div>
                                {m.formatter && m.formatter !== 'none' && (
                                    <span className="absolute right-2 bottom-2 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                        {m.formatter}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Form Preview Canvas */}
            <div className="flex-1 flex flex-col bg-sky-50/20 relative">
                {/* Toolbar */}
                <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                        <LayoutTemplate size={14} className="text-emerald-600" />
                        2. 表單元件互動預覽
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {[
                            { id: 'select', icon: List, label: '選單' },
                            { id: 'radio', icon: CircleDot, label: '單選' },
                            { id: 'checkbox', icon: CheckSquare, label: '複選' },
                            { id: 'text', icon: Type, label: '文字' },
                            { id: 'date', icon: Calendar, label: '日期' },
                        ].map((btn) => (
                            <button 
                                key={btn.id}
                                onClick={() => setPreviewType(btn.id as PreviewType)}
                                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${
                                    previewType === btn.id 
                                    ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <btn.icon size={13} /> <span>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center">
                    <div className="w-full max-w-lg">
                        {status !== 'success' ? (
                            <div className="text-center py-20 opacity-50">
                                <ArrowRight size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">請先執行上方的模擬以產生資料</p>
                            </div>
                        ) : !activeMapping ? (
                             <div className="text-center py-20 opacity-50">
                                <MousePointerClick size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">請從左側選擇一個參數進行預覽</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                
                                {/* Context Information Card */}
                                <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                                    isCollectionMode 
                                    ? 'bg-sky-50 border-sky-200 text-sky-900' 
                                    : 'bg-orange-50 border-orange-200 text-orange-900'
                                }`}>
                                    <div className="mt-0.5">
                                        {isCollectionMode ? <Database size={18} /> : <ScanLine size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold mb-1">
                                            {isCollectionMode ? '情境 A：清單選項來源 (List Source)' : '情境 B：單筆資料回填 (Auto-Fill)'}
                                        </h4>
                                        <p className="text-xs opacity-80 leading-relaxed mb-2">
                                            {isCollectionMode 
                                                ? '您選擇了集合型元件 (選單/Radio)。系統會讀取 JSON 陣列中的「每一筆」資料來產生選項列表。' 
                                                : '您選擇了單值型元件 (Text/Date)。系統會模擬「選取特定列」後，擷取該列的欄位值填入。'}
                                        </p>
                                        <div className="text-[10px] font-mono bg-white/50 px-2 py-1 rounded inline-block border border-black/5">
                                            JSON Path: {apiObject.responseRootPath ? `${apiObject.responseRootPath}[*].` : 'Root[*].'}{activeMapping.sourcePath}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl ring-4 ring-slate-100 animate-in fade-in zoom-in-95 duration-300">
                                    <label className="block text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
                                        <span>{activeMapping.description || activeMapping.parameter || '預覽欄位'}</span>
                                        <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                            {activeMapping.parameter || activeMapping.sourcePath}
                                        </span>
                                    </label>

                                    {/* WIDGETS RENDER */}
                                    <div className="space-y-2">
                                        {previewType === 'select' && (
                                            <div className="relative">
                                                <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm appearance-none">
                                                    <option value="">請選擇...</option>
                                                    {previewValues.map((val, idx) => (
                                                        <option key={idx} value={val}>{val}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                                    <List size={16} />
                                                </div>
                                                <p className="text-xs text-sky-600 mt-2 flex items-center gap-1">
                                                    <ArrowDownToLine size={12} />
                                                    已讀取 {previewValues.length} 筆資料作為選項
                                                </p>
                                            </div>
                                        )}

                                        {previewType === 'radio' && (
                                            <div className="space-y-3">
                                                {previewValues.map((val, idx) => (
                                                    <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <input type="radio" name="preview_radio" className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500" />
                                                        <span className="text-sm text-slate-700">{val}</span>
                                                    </label>
                                                ))}
                                                <p className="text-xs text-sky-600 mt-2 flex items-center gap-1">
                                                    <ArrowDownToLine size={12} />
                                                    已讀取 {previewValues.length} 筆資料作為選項
                                                </p>
                                            </div>
                                        )}

                                        {previewType === 'checkbox' && (
                                            <div className="space-y-3">
                                                {previewValues.map((val, idx) => (
                                                    <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <input type="checkbox" className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                                                        <span className="text-sm text-slate-700">{val}</span>
                                                    </label>
                                                ))}
                                                <p className="text-xs text-sky-600 mt-2 flex items-center gap-1">
                                                    <ArrowDownToLine size={12} />
                                                    已讀取 {previewValues.length} 筆資料作為選項
                                                </p>
                                            </div>
                                        )}

                                        {previewType === 'text' && (
                                            <div>
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={previewValues[0] || ''}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none" 
                                                />
                                                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                                    <ScanLine size={12} />
                                                    模擬鎖定第 1 筆資料 (Index 0) 進行回填
                                                </p>
                                            </div>
                                        )}

                                        {previewType === 'date' && (
                                            <div className="relative">
                                                <input 
                                                    type="date" 
                                                    readOnly 
                                                    value={(() => {
                                                        const val = previewValues[0];
                                                        return val && val.match(/^\d{4}-\d{2}-\d{2}$/) ? val : new Date().toISOString().split('T')[0];
                                                    })()}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none" 
                                                />
                                                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                                    <ScanLine size={12} />
                                                    模擬鎖定第 1 筆資料 (Index 0) 進行回填
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
