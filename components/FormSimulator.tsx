
import React, { useState } from 'react';
import { ApiObject, DataSource } from '../types';
import { Play, Loader2, Code2, RefreshCw, Database } from 'lucide-react';

interface Props {
  apiObject: ApiObject;
  dataSource?: DataSource;
}

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

export const FormSimulator: React.FC<Props> = ({ apiObject }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rawResponse, setRawResponse] = useState<any>(null);

  const generateMockData = () => {
    const mockCount = 5; 
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
    setRawResponse(null);

    setTimeout(() => {
        const mocks = generateMockData();
        
        let raw: any = mocks;
        if (apiObject.responseRootPath) {
            const rootParts = apiObject.responseRootPath.split('.');
            raw = rootParts.reduceRight((acc, part) => ({ [part]: acc }), mocks);
        }
        
        setRawResponse({ 
            Status: "Success",
            StatusCode: 200,
            Data: raw,
            Message: "Simulation Completed"
        });
        
        setStatus('success');
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
        {/* Main Content Area - Expanded JSON Viewer */}
        <div className="flex-1 p-8 flex flex-col">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden h-full">
                
                {/* Simulator Header */}
                <div className="h-14 px-6 flex items-center justify-between bg-slate-950 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="text-sky-400 p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <Code2 size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-200 text-sm tracking-wide">API 回傳模擬 (JSON Response Viewer)</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <Database size={10} /> {apiObject.method} {apiObject.path || '/'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {status === 'success' && (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    HTTP 200 OK
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={executeSimulation}
                            disabled={status === 'loading'}
                            className="flex items-center gap-2 bg-sky-500 text-white px-5 py-2 rounded-xl hover:bg-sky-400 transition-all shadow-lg shadow-sky-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
                        >
                            {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                            {status === 'loading' ? '正在取得資料...' : '執行 API 模擬測試'}
                        </button>
                    </div>
                </div>

                {/* JSON Body */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-slate-900/30 relative">
                    {status === 'idle' ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                            <div className="p-6 rounded-full bg-slate-800/50 border border-slate-700/50">
                                <RefreshCw size={40} className="text-slate-600 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-500">尚未執行模擬</p>
                                <p className="text-xs text-slate-600 mt-1">點擊右上方按鈕以模擬 API 回傳 JSON 資料</p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500 h-full">
                            <pre className={`text-xs font-mono leading-relaxed whitespace-pre-wrap ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                                {rawResponse ? JSON.stringify(rawResponse, null, 2) : 'Loading...'}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Footer / Hint */}
                <div className="px-6 py-3 bg-slate-950 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
                    <span className="flex items-center gap-1.5 italic">
                        * 此為模擬資料，旨在確認資料結構與路徑對應是否正確
                    </span>
                    <span className="font-mono">
                        Root Path: {apiObject.responseRootPath || '/'}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};
