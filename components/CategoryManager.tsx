
import React, { useState, useRef, useEffect } from 'react';
import { ApiCategory } from '../types';
import { MOCK_ORG_STRUCTURE, OrgNode } from '../constants';
import { Plus, Trash2, X, Check, Users, Building2, Tag, ChevronRight, ChevronDown, CheckSquare, Square, Search } from 'lucide-react';

interface Props {
  categories: ApiCategory[];
  onChange: (categories: ApiCategory[]) => void;
  onClose: () => void;
}

// Internal Tree Node Component
const TreeNodeItem: React.FC<{
    node: OrgNode;
    selectedDepts: string[];
    selectedUsers: string[];
    onToggle: (node: OrgNode) => void;
    level?: number;
}> = ({ node, selectedDepts, selectedUsers, onToggle, level = 0 }) => {
    const [expanded, setExpanded] = useState(true); // Default expanded
    
    // Check if this specific node is selected
    const isChecked = node.type === 'dept' 
        ? selectedDepts.includes(node.name) 
        : selectedUsers.includes(node.id); // Users use ID, Depts use Name (as per legacy structure)

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer ${level > 0 ? 'ml-6' : ''}`}
                onClick={(e) => {
                    // Clicking the row toggles selection, unless clicking the expand icon
                    e.stopPropagation();
                    onToggle(node);
                }}
            >
                {/* Expand Icon */}
                <div 
                    className={`p-0.5 rounded-md hover:bg-sky-100 text-slate-400 transition-colors ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {/* Checkbox */}
                <div className={`text-sky-500 transition-transform active:scale-90`}>
                    {isChecked ? <CheckSquare size={16} fill="currentColor" className="text-sky-500" stroke="white" /> : <Square size={16} className="text-slate-300" />}
                </div>

                {/* Icon & Label */}
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    {node.type === 'dept' 
                        ? <Building2 size={14} className="text-slate-400" /> 
                        : <Users size={14} className="text-slate-400" />
                    }
                    <span className={isChecked ? 'font-bold text-sky-700' : ''}>{node.name}</span>
                    {node.type === 'user' && <span className="text-[10px] text-slate-400 font-mono">({node.id})</span>}
                </div>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="border-l border-slate-100 ml-[1.15rem]">
                    {node.children!.map(child => (
                        <TreeNodeItem 
                            key={child.id} 
                            node={child} 
                            selectedDepts={selectedDepts} 
                            selectedUsers={selectedUsers} 
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Dropdown Component for Tree Select
const OrgTreeSelector: React.FC<{
    selectedDepts: string[];
    selectedUsers: string[];
    onUpdate: (depts: string[], users: string[]) => void;
}> = ({ selectedDepts, selectedUsers, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (node: OrgNode) => {
        if (node.type === 'dept') {
            const exists = selectedDepts.includes(node.name);
            const newDepts = exists 
                ? selectedDepts.filter(d => d !== node.name)
                : [...selectedDepts, node.name];
            onUpdate(newDepts, selectedUsers);
        } else {
            const exists = selectedUsers.includes(node.id);
            const newUsers = exists
                ? selectedUsers.filter(u => u !== node.id)
                : [...selectedUsers, node.id];
            onUpdate(selectedDepts, newUsers);
        }
    };

    const totalSelected = selectedDepts.length + selectedUsers.length;

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border rounded-lg px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-all ${
                    isOpen ? 'border-sky-500 ring-2 ring-sky-500/10' : 'border-slate-200 hover:border-sky-300'
                }`}
            >
                <div className="flex flex-wrap gap-1.5 items-center overflow-hidden">
                    {totalSelected === 0 ? (
                        <span className="text-slate-400 flex items-center gap-2">
                             <Search size={14} /> 點擊選擇部門或人員...
                        </span>
                    ) : (
                        <>
                            {selectedDepts.map(d => (
                                <span key={d} className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-xs font-medium border border-sky-100">
                                    <Building2 size={10} /> {d}
                                </span>
                            ))}
                            {selectedUsers.map(u => {
                                // Find user name from tree or just show ID
                                const findName = (nodes: OrgNode[]): string | undefined => {
                                    for(const n of nodes) {
                                        if (n.id === u) return n.name;
                                        if (n.children) {
                                            const found = findName(n.children);
                                            if(found) return found;
                                        }
                                    }
                                    return undefined;
                                };
                                const name = findName(MOCK_ORG_STRUCTURE) || u;
                                return (
                                    <span key={u} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium border border-emerald-100">
                                        <Users size={10} /> {name}
                                    </span>
                                )
                            })}
                        </>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-[300px] overflow-y-auto custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                        <span>組織架構</span>
                        <span className="text-sky-500">{totalSelected} 已選取</span>
                    </div>
                    {MOCK_ORG_STRUCTURE.map(rootNode => (
                        <TreeNodeItem 
                            key={rootNode.id} 
                            node={rootNode} 
                            selectedDepts={selectedDepts} 
                            selectedUsers={selectedUsers} 
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CategoryManager: React.FC<Props> = ({ categories, onChange, onClose }) => {
  const [editingList, setEditingList] = useState<ApiCategory[]>(JSON.parse(JSON.stringify(categories)));

  const handleUpdate = (id: string, field: keyof ApiCategory, value: any) => {
    setEditingList(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCategory = () => {
    const newCat: ApiCategory = {
        id: `cat_${Date.now()}`,
        name: '新分類',
        allowedDepts: [],
        allowedUsers: []
    };
    setEditingList([...editingList, newCat]);
  };

  const removeCategory = (id: string) => {
    if (confirm('確定刪除此分類？底下的 API 物件將會變成「未分類」。')) {
        setEditingList(prev => prev.filter(c => c.id !== id));
    }
  };

  const save = () => {
      onChange(editingList);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-50 p-2.5 rounded-xl text-sky-600">
                        <Tag size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">API 分類與權限管理</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="space-y-4">
                    {editingList.map((cat, idx) => (
                        <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-sky-200 transition-colors">
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">分類名稱</label>
                                    <input 
                                        type="text"
                                        value={cat.name}
                                        onChange={(e) => handleUpdate(cat.id, 'name', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-slate-800"
                                        placeholder="例如: 財務部專用"
                                    />
                                </div>
                                <button 
                                    onClick={() => removeCategory(cat.id)}
                                    className="mt-7 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="刪除分類"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Tree Select for Permissions */}
                            <div className="pt-4 border-t border-slate-50">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase mb-2">
                                    <Building2 size={14} /> 
                                    權限設定 (部門 & 人員)
                                </label>
                                <OrgTreeSelector 
                                    selectedDepts={cat.allowedDepts}
                                    selectedUsers={cat.allowedUsers}
                                    onUpdate={(depts, users) => {
                                        // Batch update to avoid multiple renders
                                        const newCat = { ...cat, allowedDepts: depts, allowedUsers: users };
                                        setEditingList(prev => prev.map(c => c.id === cat.id ? newCat : c));
                                    }}
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1 leading-relaxed">
                                    勾選「部門」可授權整個單位；勾選「人員」則僅授權該使用者。
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={addCategory}
                    className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center gap-2 font-bold"
                >
                    <Plus size={18} /> 新增分類
                </button>
            </div>

            {/* Footer */}
            <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-colors">取消</button>
                <button onClick={save} className="px-6 py-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-200 font-bold flex items-center gap-2 transition-transform active:scale-95">
                    <Check size={18} /> 儲存設定
                </button>
            </div>
        </div>
    </div>
  );
};
