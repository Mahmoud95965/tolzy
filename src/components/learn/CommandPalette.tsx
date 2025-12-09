import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, RefreshCw } from 'lucide-react';
import { Course } from '../../types/learn';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import axios from 'axios';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    onSelectCourse: (courseId: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, courses, onSelectCourse }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncAllCourses = async () => {
        setIsSyncing(true);
        try {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:5000' : '';

            let updatedCount = 0;

            for (const course of courses) {
                if (course.sourceUrl && (!course.studentsCount || course.studentsCount === 0)) {
                    try {
                        const response = await axios.post(`${API_BASE}/api/fetch-course`, { url: course.sourceUrl });
                        if (response.data && response.data.studentsCount > 0) {
                            const courseRef = doc(db, 'courses', course.id);
                            await updateDoc(courseRef, { studentsCount: response.data.studentsCount });
                            updatedCount++;
                        }
                    } catch (err) {
                        console.error(`Failed to sync ${course.title}`, err);
                    }
                    await new Promise(r => setTimeout(r, 200));
                }
            }
            alert(`Sync Complete! Updated ${updatedCount} courses.`);
            window.location.reload();
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Failed to sync. Check console.');
        } finally {
            setIsSyncing(false);
        }
    };

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
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a]/80 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
                    >
                        {/* Header / Input */}
                        <div className="flex items-center px-4 py-5 border-b border-white/5 relative">
                            <Search className="w-5 h-5 text-indigo-400 mr-4" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ابحث عن الدورات، المهارات، أو المواضيع..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-light leading-relaxed"
                            />
                            <div className="flex items-center gap-2">
                                {isSyncing ? (
                                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                                ) : (
                                    <button
                                        onClick={handleSyncAllCourses}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-xs font-mono text-gray-400 opacity-50 hover:opacity-100 transition-opacity"
                                        title="Sync Student Counts"
                                    >
                                        SYNC
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 absolute left-4">
                                <span className="text-[10px] font-medium text-gray-500 font-mono px-2 py-1 bg-white/5 rounded-md border border-white/5 shadow-sm">ESC</span>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {filteredCourses.length > 0 ? (
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 opacity-70">نتائج البحث</h3>
                                    {filteredCourses.map((course, index) => (
                                        <button
                                            key={course.id}
                                            onClick={() => {
                                                onSelectCourse(course.id);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${index === selectedIndex
                                                ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-sm'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-lg transition-colors ${index === selectedIndex ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'}`}>
                                                    <Command className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-base font-medium transition-colors ${index === selectedIndex ? 'text-indigo-200' : 'text-gray-200 group-hover:text-white'}`}>
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[300px] mt-0.5 flex items-center gap-2">
                                                        <span className="opacity-75">{course.category}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                        <span className="opacity-75">{course.platform || 'Tolzy'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <ArrowRight className="w-5 h-5 text-indigo-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-400">لا توجد نتائج</p>
                                    <p className="text-sm opacity-60 mt-1">لم نجد أي دورات تطابق "{searchTerm}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↑↓</kbd> للتنقل</span>
                                <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↵</kbd> للاختيار</span>
                            </div>
                            <span className="opacity-50">Tolzy Search AI</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
