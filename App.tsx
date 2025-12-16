
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataSource, ApiObject, ApiCategory } from './types';
import { INITIAL_DATA_SOURCES, INITIAL_API_OBJECTS, INITIAL_CATEGORIES } from './constants';
import { ConnectionConfig } from './components/ConnectionConfig';
import { ApiObjectEditor } from './components/ApiObjectEditor';
import { FormDesigner } from './components/FormDesigner';
import { CategoryManager } from './components/CategoryManager';
import { 
  Plus, 
  Save, 
  Database,
  Layers,
  ChevronRight,
  Server,
  FileEdit,
  Settings,
  Box,
  Command,
  LayoutGrid,
  Zap
} from 'lucide-react';

type ViewMode = 'sources' | 'objects' | 'designer';

const App: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(INITIAL_DATA_SOURCES);
  const [apiObjects, setApiObjects] = useState<ApiObject[]>(INITIAL_API_OBJECTS);
  const [categories, setCategories] = useState<ApiCategory[]>(INITIAL_CATEGORIES);
  
  const [viewMode, setViewMode] = useState<ViewMode>('sources');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
    
    // Default expand all categories
    if (viewMode === 'objects') {
        const initExpanded: Record<string, boolean> = { 'uncategorized': true };
        categories.forEach(c => initExpanded[c.id] = true);
        setExpandedCategories(initExpanded);
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
  
  const toggleCategory = (id: string) => {
      setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group API Objects by Category
  const groupedObjects = React.useMemo(() => {
      const groups: Record<string, ApiObject[]> = {};
      
      // Initialize groups for existing categories
      categories.forEach(c => { groups[c.id] = []; });
      groups['uncategorized'] = [];

      apiObjects.forEach(obj => {
          if (obj.categoryId && groups[obj.categoryId]) {
              groups[obj.categoryId].push(obj);
          } else {
              groups['uncategorized'].push(obj);
          }
      });
      return groups;
  }, [apiObjects, categories]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Sidebar - Clean White Theme */}
      <div className="w-72 bg-white flex flex-col border-r border-slate-200 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="p-6 flex items-center gap-3 shrink-0">
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-sky-200">
                <Zap size={20} fill="currentColor" />
            </div>
            <div>
                <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">Pro OA</h1>
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Connect Hub</span>
            </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex px-4 gap-2 shrink-0 mb-4">
            <button 
                onClick={() => { setViewMode('sources'); setSelectedId(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden ${
                    viewMode === 'sources' 
                    ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
                資料來源
                {viewMode === 'sources' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-sky-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => { setViewMode('objects'); setSelectedId(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden ${
                    viewMode === 'objects' 
                    ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
                API 物件
                {viewMode === 'objects' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-sky-500 rounded-t-full"></div>}
            </button>
        </div>

        {/* Scrollable List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-4 pb-4">
            
            {/* List Toolbar / Header */}
            {viewMode !== 'designer' && (
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur py-2 mb-2 flex items-center justify-between shrink-0 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {viewMode === 'sources' ? 'Connections' : 'Library'}
                    </span>
                    
                    <div className="flex items-center gap-1">
                        {viewMode === 'objects' && (
                             <button 
                                onClick={() => setShowCategoryManager(true)}
                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-sky-600 transition-colors"
                                title="管理分類"
                            >
                                <Settings size={14} />
                            </button>
                        )}
                        <button 
                            onClick={viewMode === 'sources' ? addDataSource : addApiObject}
                            className="p-1.5 hover:bg-sky-50 rounded-md text-slate-400 hover:text-sky-600 transition-all"
                            title={viewMode === 'sources' ? "新增資料來源" : "新增 API 物件"}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-1.5">
                {/* MODE: Data Sources */}
                {viewMode === 'sources' && (
                    dataSources.map(ds => (
                        <button
                            key={ds.id}
                            onClick={() => setSelectedId(ds.id)}
                            className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all flex items-center gap-3 group border ${
                                selectedId === ds.id 
                                ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sm' 
                                : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${selectedId === ds.id ? 'bg-white text-sky-500 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-sky-500'}`}>
                                <Server size={18} />
                            </div>
                            <span className="truncate font-medium">{ds.name}</span>
                        </button>
                    ))
                )}

                {/* MODE: API Objects (Categorized) */}
                {viewMode === 'objects' && (
                    <div className="space-y-4 pt-1">
                        {/* Categories Loop */}
                        {categories.map(cat => {
                            const count = groupedObjects[cat.id]?.length || 0;
                            const isExpanded = expandedCategories[cat.id];
                            
                            return (
                                <div key={cat.id} className="select-none">
                                    <button 
                                        onClick={() => toggleCategory(cat.id)}
                                        className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-sky-700 px-1 py-1 mb-1 transition-colors group"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <div className={`p-0.5 rounded transition-colors ${isExpanded ? 'bg-sky-100 text-sky-600' : 'text-slate-400'}`}>
                                                <ChevronRight size={12} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                            <span className="uppercase tracking-wide flex items-center gap-1.5">
                                                {cat.name}
                                            </span>
                                        </div>
                                        {count > 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-md font-medium">{count}</span>}
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="space-y-1 relative ml-1.5 pl-2 border-l border-slate-100">
                                            {groupedObjects[cat.id]?.length === 0 ? (
                                                <div className="px-3 py-2 text-xs text-slate-400 italic flex items-center gap-2">
                                                    <Box size={12} /> 無物件
                                                </div>
                                            ) : (
                                                groupedObjects[cat.id].map(obj => (
                                                    <button
                                                        key={obj.id}
                                                        onClick={() => setSelectedId(obj.id)}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5 group border ${
                                                            selectedId === obj.id 
                                                            ? 'bg-white border-sky-200 text-sky-700 shadow-sm' 
                                                            : 'border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        <Layers size={14} className={`shrink-0 ${selectedId === obj.id ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-400'}`} />
                                                        <span className="truncate font-medium">{obj.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {/* Uncategorized */}
                        <div className="select-none">
                             <button 
                                onClick={() => toggleCategory('uncategorized')}
                                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-sky-700 px-1 py-1 mb-1 transition-colors group"
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className={`p-0.5 rounded transition-colors ${expandedCategories['uncategorized'] ? 'bg-sky-100 text-sky-600' : 'text-slate-400'}`}>
                                        <ChevronRight size={12} className={`transition-transform duration-200 ${expandedCategories['uncategorized'] ? 'rotate-90' : ''}`} />
                                    </div>
                                    <span className="uppercase tracking-wide flex items-center gap-1.5">
                                         未分類
                                    </span>
                                </div>
                                {groupedObjects['uncategorized']?.length > 0 && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-md font-medium">{groupedObjects['uncategorized']?.length}</span>
                                )}
                            </button>
                             {expandedCategories['uncategorized'] && (
                                 <div className="space-y-1 relative ml-1.5 pl-2 border-l border-slate-100">
                                    {groupedObjects['uncategorized']?.length === 0 ? (
                                         <div className="px-3 py-2 text-xs text-slate-400 italic flex items-center gap-2">
                                            <Box size={12} /> 無物件
                                        </div>
                                    ) : (
                                        groupedObjects['uncategorized'].map(obj => (
                                            <button
                                                key={obj.id}
                                                onClick={() => setSelectedId(obj.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5 group border ${
                                                    selectedId === obj.id 
                                                    ? 'bg-white border-sky-200 text-sky-700 shadow-sm' 
                                                    : 'border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                <Layers size={14} className={`shrink-0 ${selectedId === obj.id ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-400'}`} />
                                                <span className="truncate font-medium">{obj.name}</span>
                                            </button>
                                        ))
                                    )}
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer with Designer Link */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
             <button 
                onClick={() => { setViewMode('designer'); setSelectedId(null); }}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    viewMode === 'designer' 
                    ? 'bg-sky-500 text-white shadow-sky-200 ring-2 ring-sky-100' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600'
                }`}
            >
                <FileEdit size={16} />
                表單設計 (Designer)
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50">
        {viewMode === 'designer' ? (
            <FormDesigner apiObjects={apiObjects} />
        ) : (
            <>
                {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur border-b border-slate-200 h-16 px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${viewMode === 'sources' ? 'bg-sky-50 text-sky-600' : 'bg-blue-50 text-blue-600'}`}>
                            {viewMode === 'sources' ? <Database size={20} /> : <Layers size={20} />}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                {viewMode === 'sources' ? activeSource?.name || '未選擇' : activeObject?.name || '未選擇'}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {viewMode === 'sources' 
                                    ? '外部資料來源連線設定' 
                                    : `所屬來源: ${dataSources.find(d => d.id === activeObject?.dataSourceId)?.name || '未指定'}`
                                }
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all text-sm font-bold tracking-wide active:scale-95">
                        <Save size={16} /> 儲存變更
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col p-8">
                    <div className="max-w-5xl mx-auto h-full w-full flex-1">
                        {viewMode === 'sources' && activeSource && (
                            <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                                <ConnectionConfig 
                                    dataSource={activeSource}
                                    onChange={updateDataSource}
                                />
                            </div>
                        )}

                        {viewMode === 'objects' && activeObject && (
                            <ApiObjectEditor
                                apiObject={activeObject}
                                dataSources={dataSources}
                                categories={categories}
                                onChange={updateApiObject}
                                onDelete={() => deleteApiObject(activeObject.id)}
                            />
                        )}

                        {((viewMode === 'sources' && !activeSource) || (viewMode === 'objects' && !activeObject)) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <div className="w-24 h-24 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-6">
                                    <LayoutGrid size={40} className="text-slate-300" />
                                </div>
                                <p className="text-xl font-bold text-slate-700">請從左側選擇項目進行編輯</p>
                                <p className="text-sm mt-2 font-medium">或點擊左側「+」新增項目</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
          <CategoryManager 
            categories={categories} 
            onChange={setCategories} 
            onClose={() => setShowCategoryManager(false)} 
          />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
