
import React from 'react';
import { DataSource, KeyValue } from '../types';
import { Server, Shield, Database, Plus, Trash2, Globe } from 'lucide-react';

interface Props {
  dataSource: DataSource;
  onChange: (ds: DataSource) => void;
}

export const ConnectionConfig: React.FC<Props> = ({ dataSource, onChange }) => {
  const handleChange = (field: keyof DataSource, value: any) => {
    onChange({ ...dataSource, [field]: value });
  };

  const handleAuthChange = (field: keyof typeof dataSource.authConfig, value: any) => {
    onChange({
      ...dataSource,
      authConfig: { ...dataSource.authConfig, [field]: value }
    });
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

  // Common input style - Added bg-white explicitly
  const inputClass = "w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-slate-800 placeholder-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  // Updated radio class for form plugin
  const radioClass = "form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 bg-white";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Basic Connection */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <Server size={20} className="text-indigo-600" /> 
            連線資訊 (Connection)
        </h3>
        <div className="grid grid-cols-12 gap-6">
             <div className="col-span-8">
                <label className={labelClass}>來源名稱</label>
                <input 
                    type="text" 
                    value={dataSource.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={inputClass}
                    placeholder="例如: ERP 正式機"
                />
            </div>
            <div className="col-span-4">
                 <label className={labelClass}>協定 (Protocol)</label>
                 <select 
                    value={dataSource.protocol}
                    onChange={(e) => handleChange('protocol', e.target.value)}
                    className={inputClass}
                 >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                 </select>
            </div>
            <div className="col-span-8">
                <label className={labelClass}>主機位置 (Host)</label>
                <div className="relative">
                    <Globe size={18} className="absolute top-3 left-3.5 text-slate-400 z-10" />
                    <input 
                        type="text" 
                        value={dataSource.host}
                        onChange={(e) => handleChange('host', e.target.value)}
                        className={`${inputClass} pl-10 font-mono`}
                        placeholder="192.168.1.1 or api.example.com"
                    />
                </div>
            </div>
            <div className="col-span-4">
                <label className={labelClass}>埠號 (Port)</label>
                <input 
                    type="text" 
                    value={dataSource.port}
                    onChange={(e) => handleChange('port', e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder="80"
                />
            </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <Shield size={20} className="text-emerald-600" /> 
            認證設定 (Authentication)
        </h3>
        
        <div className="mb-8">
            <label className={labelClass}>認證模式</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { id: 'none', label: '無認證' },
                    { id: 'basic', label: 'Basic Auth' },
                    { id: 'api_key', label: 'API Key' },
                    { id: 'custom_token', label: '自定義 / Token' }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleChange('authType', type.id)}
                        className={`text-sm py-3 px-4 rounded-xl border transition-all font-medium bg-white shadow-sm ${
                            dataSource.authType === type.id 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Auth Fields */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            {dataSource.authType === 'none' && (
                <div className="text-slate-500 text-sm text-center italic py-4">不需要額外認證資訊</div>
            )}

            {dataSource.authType === 'custom_token' && (
                <div className="space-y-6">
                    <div className="flex items-start gap-3 text-sm text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="mt-1 min-w-[6px] min-h-[6px] rounded-full bg-blue-600"></div>
                        <div>
                            <strong>適用情境 (如 FlexSystem)：</strong>
                            系統將先呼叫登入 API，從回應中擷取 Token，並存入全域變數供後續 API 物件使用。
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>登入路徑 (Login URL)</label>
                            <input 
                                type="text"
                                value={dataSource.authConfig.loginUrl || ''}
                                onChange={(e) => handleAuthChange('loginUrl', e.target.value)}
                                className={inputClass}
                                placeholder="/Login"
                            />
                        </div>
                         <div>
                            <label className={labelClass}>Token 變數名稱 (Variable Name)</label>
                            <input 
                                type="text"
                                value={dataSource.authConfig.tokenVariable || ''}
                                onChange={(e) => handleAuthChange('tokenVariable', e.target.value)}
                                className={`${inputClass} bg-white font-mono text-slate-600`}
                                placeholder="SessionID"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>帳號 (Username / UserCode)</label>
                            <input 
                                type="text"
                                value={dataSource.authConfig.username || ''}
                                onChange={(e) => handleAuthChange('username', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>密碼 (Password)</label>
                            <input 
                                type="password"
                                value={dataSource.authConfig.password || ''}
                                onChange={(e) => handleAuthChange('password', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Token 欄位路徑 (Token Field Path)</label>
                            <input 
                                type="text"
                                value={dataSource.authConfig.tokenField || ''}
                                onChange={(e) => handleAuthChange('tokenField', e.target.value)}
                                className={`${inputClass} font-mono`}
                                placeholder="例如: data.token 或 Session"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">登入成功後，系統會從 JSON 回應中此路徑抓取 Token 值。</p>
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>額外參數 (JSON)</label>
                            <textarea 
                                value={dataSource.authConfig.extraLoginParams || ''}
                                onChange={(e) => handleAuthChange('extraLoginParams', e.target.value)}
                                className="w-full h-24 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                placeholder='{ "ClientVersion": "API" }'
                            />
                        </div>
                    </div>
                </div>
            )}

            {dataSource.authType === 'basic' && (
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>帳號 (Username)</label>
                        <input 
                            type="text"
                            value={dataSource.authConfig.username || ''}
                            onChange={(e) => handleAuthChange('username', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>密碼 (Password)</label>
                        <input 
                            type="password"
                            value={dataSource.authConfig.password || ''}
                            onChange={(e) => handleAuthChange('password', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            )}

            {dataSource.authType === 'api_key' && (
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>Key Name</label>
                        <input 
                            type="text"
                            value={dataSource.authConfig.apiKeyName || ''}
                            onChange={(e) => handleAuthChange('apiKeyName', e.target.value)}
                            className={inputClass}
                            placeholder="X-API-KEY"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Key Value</label>
                        <input 
                            type="password"
                            value={dataSource.authConfig.apiKeyValue || ''}
                            onChange={(e) => handleAuthChange('apiKeyValue', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>加入位置 (Placement)</label>
                        <div className="flex gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                                <input 
                                    type="radio" 
                                    name="apiKeyPlacement"
                                    checked={dataSource.authConfig.apiKeyPlacement !== 'query'}
                                    onChange={() => handleAuthChange('apiKeyPlacement', 'header')}
                                    className={radioClass}
                                />
                                <span className="text-sm text-slate-700 font-medium">Header</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                                <input 
                                    type="radio" 
                                    name="apiKeyPlacement"
                                    checked={dataSource.authConfig.apiKeyPlacement === 'query'}
                                    onChange={() => handleAuthChange('apiKeyPlacement', 'query')}
                                    className={radioClass}
                                />
                                <span className="text-sm text-slate-700 font-medium">Query Parameter</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* HTTP Headers */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Database size={20} className="text-blue-600" /> 
                HTTP Headers
            </h3>
            <button onClick={addHeader} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm">
                <Plus size={16} /> 新增 Header
            </button>
        </div>
        
        {dataSource.headers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                暫無自訂 Header，點擊右上角新增
            </div>
        ) : (
            <div className="space-y-3">
                {dataSource.headers.map((header, idx) => (
                    <div key={header.id} className="flex gap-4 items-center">
                        <input 
                            type="text" 
                            value={header.key}
                            onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                            className={`${inputClass} font-mono text-xs`}
                            placeholder="Key (e.g. Content-Type)"
                        />
                        <span className="text-slate-300 font-bold">:</span>
                        <input 
                            type="text" 
                            value={header.value}
                            onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                            className={`${inputClass} font-mono text-xs`}
                            placeholder="Value (e.g. application/json)"
                        />
                        <button onClick={() => removeHeader(idx)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
