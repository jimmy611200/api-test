
import React, { useState } from 'react';
import { DataSource, KeyValue, ResponseVariableMapping } from '../types';
import { Server, Shield, Database, Plus, Trash2, Globe, Wifi, CheckCircle2, XCircle, Loader2, Key, ChevronRight } from 'lucide-react';

interface Props {
  dataSource: DataSource;
  onChange: (ds: DataSource) => void;
}

export const ConnectionConfig: React.FC<Props> = ({ dataSource, onChange }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleChange = (field: keyof DataSource, value: any) => {
    onChange({ ...dataSource, [field]: value });
    setTestStatus('idle');
  };

  const handleAuthChange = (field: keyof typeof dataSource.authConfig, value: any) => {
    onChange({
      ...dataSource,
      authConfig: { ...dataSource.authConfig, [field]: value }
    });
  };

  const addVariable = () => {
    const vars = dataSource.authConfig.responseVariables || [];
    const newVar: ResponseVariableMapping = { id: Date.now().toString(), jsonPath: '', variableName: '' };
    handleAuthChange('responseVariables', [...vars, newVar]);
  };

  const updateVariable = (id: string, field: 'jsonPath' | 'variableName', value: string) => {
    const vars = (dataSource.authConfig.responseVariables || []).map(v => 
        v.id === id ? { ...v, [field]: value } : v
    );
    handleAuthChange('responseVariables', vars);
  };

  const removeVariable = (id: string) => {
    const vars = (dataSource.authConfig.responseVariables || []).filter(v => v.id !== id);
    handleAuthChange('responseVariables', vars);
  };

  const addHeader = () => {
    const newHeader: KeyValue = { id: Date.now().toString(), key: '', value: '' };
    onChange({ ...dataSource, headers: [...dataSource.headers, newHeader] });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...dataSource.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange({ ...dataSource, headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = dataSource.headers.filter((_, i) => i !== index);
    onChange({ ...dataSource, headers: newHeaders });
  };

  const testConnection = async () => {
    setTestStatus('loading');
    setTestMessage('');
    const url = `${dataSource.protocol}://${dataSource.host}:${dataSource.port}`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);
        setTestStatus('success');
        setTestMessage('連線成功 (主機可達)');
    } catch (error: any) {
        setTestStatus('error');
        setTestMessage(error.message === 'Failed to fetch' 
            ? '連線失敗：請檢查 CORS 設定或 SSL 憑證' 
            : `連線失敗：${error.name === 'AbortError' ? '連線逾時' : error.message}`);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all text-slate-800 placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2";
  const cardClass = "bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md";
  const radioClass = "form-radio text-sky-500 focus:ring-sky-500 h-4 w-4 border-slate-300 bg-white";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><Server size={18} /></div>
                連線資訊 (Connection)
            </h3>
            <div className="flex items-center gap-3">
                 {testStatus !== 'idle' && (
                    <span className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-700' : testStatus === 'error' ? 'bg-red-50 text-red-700' : 'text-slate-500'}`}>
                        {testStatus === 'success' && <CheckCircle2 size={14} />}
                        {testStatus === 'error' && <XCircle size={14} />}
                        {testMessage}
                    </span>
                 )}
                <button 
                    onClick={testConnection}
                    disabled={testStatus === 'loading' || !dataSource.host}
                    className="text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md shadow-sky-100 active:scale-95"
                >
                    {testStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                    測試連線
                </button>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
             <div className="col-span-8">
                <label className={labelClass}>來源名稱</label>
                <input type="text" value={dataSource.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} placeholder="例如: ERP 正式機" />
            </div>
            <div className="col-span-4">
                 <label className={labelClass}>協定 (Protocol)</label>
                 <select value={dataSource.protocol} onChange={(e) => handleChange('protocol', e.target.value)} className={inputClass}>
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                 </select>
            </div>
            <div className="col-span-8">
                <label className={labelClass}>主機位置 (Host)</label>
                <div className="relative">
                    <Globe size={16} className="absolute top-3 left-3.5 text-slate-400 z-10" />
                    <input type="text" value={dataSource.host} onChange={(e) => handleChange('host', e.target.value)} className={`${inputClass} pl-10 font-mono`} placeholder="192.168.1.1 or api.example.com" />
                </div>
            </div>
            <div className="col-span-4">
                <label className={labelClass}>埠號 (Port)</label>
                <input type="text" value={dataSource.port} onChange={(e) => handleChange('port', e.target.value)} className={`${inputClass} font-mono`} placeholder="80" />
            </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Shield size={18} /></div>
            <h3 className="text-base font-bold text-slate-800">認證設定 (Authentication)</h3>
        </div>
        
        <div className="mb-8">
            <label className={labelClass}>認證模式</label>
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                {[
                    { id: 'none', label: '無認證' },
                    { id: 'basic', label: '基本認證 (Basic)' },
                    { id: 'api_key', label: 'API 金鑰 (Key)' },
                    { id: 'custom_token', label: '自定義 / Token' }
                ].map((type) => (
                    <button key={type.id} onClick={() => handleChange('authType', type.id)} className={`flex-1 text-sm py-2.5 px-4 rounded-lg transition-all font-semibold ${dataSource.authType === type.id ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                        {type.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60">
            {dataSource.authType === 'custom_token' && (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>登入 API 路徑 (Login URL)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400 font-mono text-xs font-bold">POST</span>
                            <input type="text" value={dataSource.authConfig.loginUrl || ''} onChange={(e) => handleAuthChange('loginUrl', e.target.value)} className={`${inputClass} pl-14 font-mono`} placeholder="/Login" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="col-span-2 text-xs font-bold text-slate-900 mb-1 flex items-center gap-2"><Shield size={14} className="text-slate-500" /> 登入憑證</div>
                        <div>
                            <label className={labelClass}>帳號 (Username)</label>
                            <input type="text" value={dataSource.authConfig.username || ''} onChange={(e) => handleAuthChange('username', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>密碼 (Password)</label>
                            <input type="password" value={dataSource.authConfig.password || ''} onChange={(e) => handleAuthChange('password', e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <Key size={14} className="text-sky-500" /> 回應變數提取 (Response Variables)
                            </h4>
                            <button onClick={addVariable} className="text-[10px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded transition-colors uppercase tracking-wider">
                                <Plus size={12} /> 新增提取
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {(dataSource.authConfig.responseVariables || []).map(v => (
                                <div key={v.id} className="flex gap-3 items-center">
                                    <div className="flex-1">
                                        <input type="text" value={v.jsonPath} onChange={(e) => updateVariable(v.id, 'jsonPath', e.target.value)} className={`${inputClass} text-xs font-mono h-9`} placeholder="來源路徑 (e.g. data.token)" />
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <div className="flex-1">
                                        <input type="text" value={v.variableName} onChange={(e) => updateVariable(v.id, 'variableName', e.target.value)} className={`${inputClass} text-xs font-mono h-9 text-sky-700 bg-sky-50/30`} placeholder="變數代碼 (e.g. sid)" />
                                    </div>
                                    <button onClick={() => removeVariable(v.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {(dataSource.authConfig.responseVariables || []).length === 0 && (
                                <div className="text-center py-4 text-xs text-slate-400 italic">尚未設定提取規則，API 模擬將無動態變數可用</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>額外登入參數 (JSON)</label>
                        <textarea 
                            value={dataSource.authConfig.extraLoginParams || ''}
                            onChange={(e) => handleAuthChange('extraLoginParams', e.target.value)}
                            className="w-full h-24 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                            placeholder='{ "ClientVersion": "API" }'
                        />
                    </div>
                </div>
            )}

            {dataSource.authType === 'basic' && (
                <div className="grid grid-cols-2 gap-6">
                    <div><label className={labelClass}>帳號 (Username)</label><input type="text" value={dataSource.authConfig.username || ''} onChange={(e) => handleAuthChange('username', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>密碼 (Password)</label><input type="password" value={dataSource.authConfig.password || ''} onChange={(e) => handleAuthChange('password', e.target.value)} className={inputClass} /></div>
                </div>
            )}

            {dataSource.authType === 'api_key' && (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>金鑰名稱 (Key Name)</label>
                        <input type="text" value={dataSource.authConfig.apiKeyName || ''} onChange={(e) => handleAuthChange('apiKeyName', e.target.value)} className={inputClass} placeholder="X-API-KEY" />
                    </div>
                    <div>
                        <label className={labelClass}>金鑰內容 (Key Value)</label>
                        <input type="password" value={dataSource.authConfig.apiKeyValue || ''} onChange={(e) => handleAuthChange('apiKeyValue', e.target.value)} className={inputClass} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>加入位置 (Placement)</label>
                        <div className="flex gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                                <input 
                                    type="radio" 
                                    name="apiKeyPlacement"
                                    checked={dataSource.authConfig.apiKeyPlacement !== 'query'}
                                    onChange={() => handleAuthChange('apiKeyPlacement', 'header')}
                                    className={radioClass}
                                />
                                <span className="text-sm text-slate-700 font-bold">Header</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                                <input 
                                    type="radio" 
                                    name="apiKeyPlacement"
                                    checked={dataSource.authConfig.apiKeyPlacement === 'query'}
                                    onChange={() => handleAuthChange('apiKeyPlacement', 'query')}
                                    className={radioClass}
                                />
                                <span className="text-sm text-slate-700 font-bold">Query Parameter</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-3"><div className="p-2 bg-pink-50 rounded-lg text-pink-500"><Database size={18} /></div>HTTP Headers</h3>
            <button onClick={addHeader} className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg transition-colors uppercase">新增 Header</button>
        </div>
        <div className="space-y-3">
            {dataSource.headers.map((header, idx) => (
                <div key={header.id} className="flex gap-4 items-center group">
                    <input type="text" value={header.key} onChange={(e) => updateHeader(idx, 'key', e.target.value)} className={`${inputClass} font-mono text-xs`} placeholder="Key" />
                    <span className="text-slate-300 font-bold">:</span>
                    <input type="text" value={header.value} onChange={(e) => updateHeader(idx, 'value', e.target.value)} className={`${inputClass} font-mono text-xs`} placeholder="Value" />
                    <button onClick={() => removeHeader(idx)} className="text-slate-400 hover:text-red-600 p-2 rounded transition-colors opacity-50 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
