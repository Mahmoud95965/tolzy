import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FileCode, Hash, Cpu, Globe, Database, Layers, BarChart } from 'lucide-react';

interface SkillNode {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: SkillNode[];
}

const skillTreeData: SkillNode[] = [
    {
        id: 'ai-foundations',
        label: 'أساسيات الذكاء الاصطناعي',
        icon: <BrainIcon />,
        children: [
            { id: 'machine-learning', label: 'تعلم الآلة', icon: <Hash className="w-4 h-4" /> },
            { id: 'deep-learning', label: 'التعلم العميق', icon: <Layers className="w-4 h-4" /> },
            { id: 'nlp', label: 'معالجة اللغة الطبيعية', icon: <FileCode className="w-4 h-4" /> },
        ]
    },
    {
        id: 'web-dev',
        label: 'تطوير الويب',
        icon: <GlobeIcon />,
        children: [
            { id: 'frontend', label: 'الواجهة الأمامية (React)', icon: <FileCode className="w-4 h-4" /> },
            { id: 'backend', label: 'الواجهة الخلفية (Node.js)', icon: <Database className="w-4 h-4" /> },
        ]
    },
    {
        id: 'computer-science',
        label: 'علوم الحاسب',
        icon: <CpuIcon />,
        children: [
            { id: 'algorithms', label: 'الخوارزميات', icon: <Hash className="w-4 h-4" /> },
            { id: 'system-design', label: 'تصميم الأنظمة', icon: <Layers className="w-4 h-4" /> },
        ]
    },
    {
        id: 'data-analysis',
        label: 'تحليل البيانات',
        icon: <DataIcon />,
        children: [
            { id: 'python-data', label: 'Python للبيانات', icon: <FileCode className="w-4 h-4" /> },
            { id: 'sql', label: 'SQL', icon: <Database className="w-4 h-4" /> },
            { id: 'visualization', label: 'تصوير البيانات', icon: <BarChart className="w-4 h-4" /> },
        ]
    }
];

function BrainIcon() { return <Cpu className="w-4 h-4 text-purple-400" />; }
function GlobeIcon() { return <Globe className="w-4 h-4 text-blue-400" />; }
function CpuIcon() { return <Cpu className="w-4 h-4 text-green-400" />; }
function DataIcon() { return <BarChart className="w-4 h-4 text-orange-400" />; }

interface SkillTreeSidebarProps {
    onSelectCategory: (category: string) => void;
    selectedCategory: string;
}

const SkillTreeSidebar: React.FC<SkillTreeSidebarProps> = ({ onSelectCategory, selectedCategory }) => {
    return (
        <div className="w-64 bg-[#0a0a0a]/50 backdrop-blur-xl border-r border-white/5 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto hidden lg:block">
            <div className="p-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    المستكشف
                </h2>
                <div className="space-y-1">
                    <SkillTreeNode
                        node={{ id: 'all', label: 'كل الدورات', icon: <Folder className="w-4 h-4 text-yellow-500" /> }}
                        level={0}
                        onSelect={onSelectCategory}
                        selectedId={selectedCategory}
                    />
                    {skillTreeData.map(node => (
                        <SkillTreeNode
                            key={node.id}
                            node={node}
                            level={0}
                            onSelect={onSelectCategory}
                            selectedId={selectedCategory}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const SkillTreeNode: React.FC<{
    node: SkillNode;
    level: number;
    onSelect: (id: string) => void;
    selectedId: string;
}> = ({ node, level, onSelect, selectedId }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    const handleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.id);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors ${isSelected
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {hasChildren && (
                    <span className="text-gray-500">
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                )}
                {!hasChildren && <span className="w-3" />} {/* Spacer */}

                {node.icon}
                <span className="truncate">{node.label}</span>
            </button>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map(child => (
                            <SkillTreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                                selectedId={selectedId}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillTreeSidebar;
