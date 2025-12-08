import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { Course } from '../../types/learn';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    onSelectCourse: (courseId: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, courses, onSelectCourse }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (isOpen) onClose();
                else {
                    // This logic should be handled by parent to open
                }
            }
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCourses.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCourses.length) % filteredCourses.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCourses[selectedIndex]) {
                    onSelectCourse(filteredCourses[selectedIndex].id);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, filteredCourses, selectedIndex, onSelectCourse]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center px-4 py-4 border-b border-white/5">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ابحث عن الدورات، المهارات، أو المواضيع..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-light"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono px-2 py-1 bg-white/5 rounded">ESC</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredCourses.length > 0 ? (
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">مقترحات</h3>
                                    {filteredCourses.map((course, index) => (
                                        <button
                                            key={course.id}
                                            onClick={() => {
                                                onSelectCourse(course.id);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${index === selectedIndex ? 'bg-indigo-600/20' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                                                    <Command className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-sm font-medium ${index === selectedIndex ? 'text-indigo-300' : 'text-gray-200'}`}>
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[300px]">
                                                        {course.category} • {course.platform || 'Tolzy'}
                                                    </p>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <ArrowRight className="w-4 h-4 text-indigo-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    <p>لا توجد نتائج لـ "{searchTerm}"</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex gap-4">
                                <span><strong className="text-gray-400">↑↓</strong> للتنقل</span>
                                <span><strong className="text-gray-400">↵</strong> للاختيار</span>
                            </div>
                            <span>بحث تولزي</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
