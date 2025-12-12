
import React, { useState, useMemo } from 'react';
import { ApiObject, DataSource, FormatterType } from '../types';
import { Play, LayoutTemplate, ArrowRight, Loader2, Database, AlertCircle, Code2 } from 'lucide-react';

interface Props {
  apiObject: ApiObject;
  dataSource?: DataSource;
}

const formatValue = (value: any, type?: FormatterType): string => {
    if (!value) return '';
    const strVal = String(value);
    
    switch (type) {
        case 'date_slash': // 2023-01-01 -> 2023/01/01
            return strVal.replace(/-/g, '/').split('T')[0];
        case 'date_dash': // 2023/01/01 -> 2023-01-01
            return strVal.replace(/\//g, '-').split('T')[0];
        case 'currency': // 1000 -> $1,000
            return !isNaN(Number(strVal)) ? `$${Number(strVal).toLocaleString()}` : strVal;
        case 'boolean_yn': // true/1 -> Y, false/0 -> N
            return (strVal === 'true' || strVal === '1' || strVal === 'Y') ? 'Y' : 'N';
        case 'uppercase':
            return strVal.toUpperCase();
        case 'lowercase':
            return strVal.toLowerCase();
        default:
            return strVal;
    }
};

const getValueByPath = (obj: any, path: string) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const FormSimulator: React.FC<Props> = ({ apiObject, dataSource }) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseData, setResponseData] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Extract variables from request template (e.g. ${DeptID})
  const variables = useMemo(() => {
    const matches = apiObject.requestBodyTemplate?.match(/\${(.*?)}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.replace(/[${}]/g, ''))))
      .filter(v => v !== 'SessionID'); 
  }, [apiObject.requestBodyTemplate]);

  const handleParamChange = (key: string, val: string) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  const simulateCall = () => {
    setStatus('loading');
    setResponseData([]);
    setSelectedValue('');

    // Mock API Call
    setTimeout(() => {
        // Generate mock data based on mappings
        const mockItem1: any = {};
        const mockItem2: any = {};
        const mockItem3: any = {};

        apiObject.mappings.forEach(m => {
            const key = m.sourcePath.split('.').pop() || 'field';
            if (key.includes('Date')) {
                mockItem1[key] = "2023-10-01";
                mockItem2[key] = "2023-11-15";
                mockItem3[key] = "2023-12-20";
            } else if (key.includes('Amount') || key.includes('Price')) {
                mockItem1[key] = 5000;
                mockItem2[key] = 12500;
                mockItem3[key] = 300;
            } else if (key.includes('Name')) {
                mockItem1[key] = "測試項目 A";
                mockItem2[key] = "測試項目 B";
                mockItem3[key] = "測試項目 C";
            } else if (key.includes('Code') || key.includes('ID')) {
                mockItem1[key] = "A001";
                mockItem2[key] = "B002";
                mockItem3[key] = "C003";
            } else {
                mockItem1[key] = "Demo Data 1";
                mockItem2[key] = "Demo Data 2";
                mockItem3[key] = "Demo Data 3";
            }
        });

        setResponseData([mockItem1, mockItem2, mockItem3]);
        setStatus('success');
    }, 1000);
  };

  const valueMapping = apiObject.mappings.find(m => m.targetProperty === 'value');
  const labelMapping = apiObject.mappings.find(m => m.targetProperty === 'label');
  const extraMappings = apiObject.mappings.filter(m => m.targetProperty === 'extra');

  const selectedItem = useMemo(() => {
    if (!valueMapping) return undefined;
    return responseData.find(item => String(getValueByPath(item, valueMapping.sourcePath)) === selectedValue);
  }, [selectedValue, responseData, valueMapping]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
        
        {/* Main Simulation Area */}
        <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-12 divide-x divide-slate-200">
                
                {/* Left: Params Input */}
                <div className="col-span-4 bg-white p-6 flex flex-col overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <Database size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">來源參數模擬</h3>
                            <p className="text-xs text-slate-500">輸入表單欄位值以模擬 API 請求</p>
                        </div>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        {variables.length > 0 ? (
                            variables.map(v => (
                                <div key={v}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">
                                        表單欄位: {v}
                                    </label>
                                    <input 
                                        type="text"
                                        value={params[v] || ''}
                                        onChange={(e) => handleParamChange(v, e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                        placeholder={`輸入測試值...`}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                此 API 物件無動態參數
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={simulateCall}
                        disabled={status === 'loading'}
                        className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none active:scale-[0.98]"
                    >
                        {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                        {status === 'loading' ? '請求處理中...' : '執行模擬 (Simulate)'}
                    </button>
                </div>

                {/* Right: Form Preview */}
                <div className="col-span-8 bg-slate-50/50 p-8 flex flex-col items-center justify-center relative">
                    <div className="absolute top-6 left-8 flex items-center gap-2 text-slate-800">
                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                            <LayoutTemplate size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold">表單互動預覽</h3>
                            <p className="text-xs text-slate-500">預覽資料回填效果</p>
                        </div>
                    </div>

                    <div className="w-full max-w-lg">
                        {status === 'idle' && (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <ArrowRight size={32} />
                                </div>
                                <p className="text-slate-500 font-medium">請先於左側輸入參數並執行模擬</p>
                            </div>
                        )}

                        {status === 'loading' && (
                            <div className="text-center py-20">
                                <Loader2 size={40} className="mb-4 animate-spin text-blue-600 mx-auto opacity-80" />
                                <p className="text-slate-500 font-medium">正在與 API 進行資料交換...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Form Preview</span>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">API Connected</span>
                                </div>
                                <div className="p-8 space-y-8">
                                    {/* Main Selector */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            {apiObject.name} <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all cursor-pointer hover:border-blue-300"
                                            value={selectedValue}
                                            onChange={(e) => setSelectedValue(e.target.value)}
                                        >
                                            <option value="">-- 請選擇 --</option>
                                            {responseData.map((item, i) => {
                                                const val = valueMapping ? getValueByPath(item, valueMapping.sourcePath) : JSON.stringify(item);
                                                const label = labelMapping ? getValueByPath(item, labelMapping.sourcePath) : 'Label Not Set';
                                                const formattedLabel = formatValue(label, labelMapping?.formatter);
                                                return (
                                                    <option key={i} value={val}>{formattedLabel}</option>
                                                );
                                            })}
                                        </select>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">儲存值 (Value):</span>
                                            <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                                                {selectedValue || 'null'}
                                            </code>
                                        </div>
                                    </div>

                                    {/* Extra Fields */}
                                    {extraMappings.length > 0 && (
                                        <div className="pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="h-px flex-1 bg-slate-200"></span>
                                                <span className="text-xs font-medium text-slate-400">連動欄位自動回填</span>
                                                <span className="h-px flex-1 bg-slate-200"></span>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {extraMappings.map(m => {
                                                    const rawValue = selectedItem ? getValueByPath(selectedItem, m.sourcePath) : '';
                                                    const finalValue = formatValue(rawValue, m.formatter);
                                                    
                                                    return (
                                                        <div key={m.id} className="grid grid-cols-12 gap-4 items-center group">
                                                            <label className="col-span-4 text-sm font-medium text-slate-500 text-right group-hover:text-blue-600 transition-colors">
                                                                {m.targetExtraName || '未命名欄位'}
                                                            </label>
                                                            <div className="col-span-8 relative">
                                                                <input 
                                                                    type="text" 
                                                                    readOnly
                                                                    value={finalValue}
                                                                    className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 cursor-not-allowed font-medium"
                                                                    placeholder="系統自動帶入..."
                                                                />
                                                                {m.formatter && m.formatter !== 'none' && (
                                                                    <div className="absolute right-2 top-2 text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                                                                        {m.formatter}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {!selectedItem && extraMappings.length > 0 && (
                                        <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100 flex items-center gap-2">
                                            <AlertCircle size={14} className="shrink-0" />
                                            請選擇上方項目以查看連動欄位效果
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom: Debug Console */}
        <div className="h-48 bg-slate-900 border-t border-slate-800 flex flex-col">
            <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Code2 size={14} />
                    <span>Raw JSON Response</span>
                </div>
                {status === 'success' && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {responseData.length} Records Found
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                    {responseData.length > 0 ? JSON.stringify(responseData, null, 2) : <span className="text-slate-600">// 等待模擬執行...</span>}
                </pre>
            </div>
        </div>
    </div>
  );
};
