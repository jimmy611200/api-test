
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataSource, ApiObject } from './types';
import { INITIAL_DATA_SOURCES, INITIAL_API_OBJECTS } from './constants';
import { ConnectionConfig } from './components/ConnectionConfig';
import { ApiObjectEditor } from './components/ApiObjectEditor';
import { FormDesigner } from './components/FormDesigner';
import { 
  Layout, 
  Plus, 
  Save, 
  Database,
  Layers,
  ChevronRight,
  Server,
  FileEdit
} from 'lucide-react';

type ViewMode = 'sources' | 'objects' | 'designer';

const App: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(INITIAL_DATA_SOURCES);
  const [apiObjects, setApiObjects] = useState<ApiObject[]>(INITIAL_API_OBJECTS);
  
  const [viewMode, setViewMode] = useState<ViewMode>('sources');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize selection
  React.useEffect(() => {
    if (viewMode === 'sources' && dataSources.length > 0 && !selectedId) {
        setSelectedId(dataSources[0].id);
    } else if (viewMode === 'objects' && apiObjects.length > 0 && !selectedId) {
        setSelectedId(apiObjects[0].id);
    } else if (viewMode !== 'designer' && !selectedId) {
        // Create new if empty list
        if (viewMode === 'sources') addDataSource();
        if (viewMode === 'objects') addApiObject();
    }
  }, [viewMode]);

  const activeSource = dataSources.find(d => d.id === selectedId);
  const activeObject = apiObjects.find(o => o.id === selectedId);

  const updateDataSource = (updatedDs: DataSource) => {
    setDataSources(prev => prev.map(ds => ds.id === updatedDs.id ? updatedDs : ds));
  };

  const updateApiObject = (updatedObj: ApiObject) => {
    setApiObjects(prev => prev.map(obj => obj.id === updatedObj.id ? updatedObj : obj));
  };

  const addDataSource = () => {
    const newId = `ds_${Date.now()}`;
    const newDs: DataSource = {
      id: newId,
      name: '新資料來源',
      host: '',
      port: '80',
      protocol: 'http',
      authType: 'none',
      authConfig: {},
      headers: []
    };
    setDataSources([...dataSources, newDs]);
    setSelectedId(newId);
  };

  const addApiObject = () => {
    const newId = `obj_${Date.now()}`;
    const newObj: ApiObject = {
      id: newId,
      dataSourceId: dataSources.length > 0 ? dataSources[0].id : '',
      name: '新 API 物件',
      method: 'POST',
      path: '',
      mappings: []
    };
    setApiObjects([...apiObjects, newObj]);
    setSelectedId(newId);
  };

  const deleteApiObject = (id: string) => {
    if(confirm('確定刪除此 API 物件？')) {
        setApiObjects(prev => prev.filter(o => o.id !== id));
        if (selectedId === id) setSelectedId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-800 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 text-white">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
                <Layout size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pro OA 設定</span>
        </div>
        
        {/* Navigation */}
        <div className="flex p-3 gap-2 border-b border-slate-800 pb-4">
            <button 
                onClick={() => { setViewMode('sources'); setSelectedId(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'sources' ? 'bg-slate-800 text-white shadow-inner' : 'hover:bg-slate-800/50 text-slate-500'}`}
            >
                資料來源
            </button>
            <button 
                onClick={() => { setViewMode('objects'); setSelectedId(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'objects' ? 'bg-slate-800 text-white shadow-inner' : 'hover:bg-slate-800/50 text-slate-500'}`}
            >
                API 物件
            </button>
        </div>

        {/* Extended Nav for Designer */}
        <div className="px-3 pt-2">
             <button 
                onClick={() => { setViewMode('designer'); setSelectedId(null); }}
                className={`w-full py-2.5 px-3 rounded-md text-sm font-bold flex items-center gap-3 transition-all ${viewMode === 'designer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800/50 text-slate-400'}`}
            >
                <FileEdit size={18} />
                表單設計 (Designer)
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {viewMode !== 'designer' && (
                <div className="flex justify-between items-center px-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {viewMode === 'sources' ? 'Connections' : 'Endpoints'}
                    </span>
                    <button 
                        onClick={viewMode === 'sources' ? addDataSource : addApiObject}
                        className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}

            {viewMode === 'sources' && (
                dataSources.map(ds => (
                    <button
                        key={ds.id}
                        onClick={() => setSelectedId(ds.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center gap-3 group relative ${selectedId === ds.id ? 'bg-slate-800 text-white shadow-md border-l-4 border-indigo-500' : 'hover:bg-slate-800/50'}`}
                    >
                        <Server size={16} className={selectedId === ds.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'} />
                        <span className="truncate font-medium">{ds.name}</span>
                    </button>
                ))
            )}

            {viewMode === 'objects' && (
                apiObjects.map(obj => (
                    <button
                        key={obj.id}
                        onClick={() => setSelectedId(obj.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center gap-3 group relative ${selectedId === obj.id ? 'bg-slate-800 text-white shadow-md border-l-4 border-emerald-500' : 'hover:bg-slate-800/50'}`}
                    >
                        <Layers size={16} className={selectedId === obj.id ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'} />
                        <span className="truncate font-medium">{obj.name}</span>
                    </button>
                ))
            )}
            
            {viewMode === 'designer' && (
                <div className="p-4 text-xs text-slate-500 leading-relaxed bg-slate-800/30 rounded-lg border border-slate-800 m-2">
                    <p className="mb-2 text-indigo-400 font-bold">小提示：</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>點擊左側工具箱的元件以新增。</li>
                        <li>點擊畫布上的欄位進行編輯。</li>
                        <li>右側面板可設定詳細屬性。</li>
                    </ul>
                </div>
            )}
        </div>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            v2.5.0 Pro Form
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {viewMode === 'designer' ? (
            <FormDesigner apiObjects={apiObjects} />
        ) : (
            <>
                {/* Top Bar (Only for Config Views) */}
                <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${viewMode === 'sources' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {viewMode === 'sources' ? <Database size={20} /> : <Layers size={20} />}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">
                                {viewMode === 'sources' ? activeSource?.name || '未選擇' : activeObject?.name || '未選擇'}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                {viewMode === 'sources' 
                                    ? '外部資料來源連線設定' 
                                    : `所屬來源: ${dataSources.find(d => d.id === activeObject?.dataSourceId)?.name || '未指定'}`
                                }
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 shadow-md transition-all text-sm font-medium">
                        <Save size={18} /> 儲存變更
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-slate-50/50 p-8">
                    <div className="max-w-5xl mx-auto h-full">
                        {viewMode === 'sources' && activeSource && (
                            <ConnectionConfig 
                                dataSource={activeSource}
                                onChange={updateDataSource}
                            />
                        )}

                        {viewMode === 'objects' && activeObject && (
                            <ApiObjectEditor
                                apiObject={activeObject}
                                dataSources={dataSources}
                                onChange={updateApiObject}
                                onDelete={() => deleteApiObject(activeObject.id)}
                            />
                        )}

                        {((viewMode === 'sources' && !activeSource) || (viewMode === 'objects' && !activeObject)) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    {viewMode === 'sources' ? <Server size={32} /> : <Layers size={32} />}
                                </div>
                                <p className="text-lg font-medium text-slate-600">請從左側選擇項目進行編輯</p>
                                <p className="text-sm mt-2">或點擊「+」新增項目</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
