import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, Award, Globe, MonitorPlay, Users, Star } from 'lucide-react';
import { Course } from '../../types/learn';

interface SmartCourseCardProps {
    course: Course;
    onClick: () => void;
    featured?: boolean;
}

const SmartCourseCard: React.FC<SmartCourseCardProps> = ({ course, onClick, featured = false }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative group cursor-pointer ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className={`h-full bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-indigo-500/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 ${featured ? 'flex flex-col md:flex-row' : 'flex flex-col'}`}
            >
                {/* Image Section */}
                <div className={`relative overflow-hidden ${featured ? 'md:w-1/2 h-64 md:h-auto' : 'h-48'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60" />
                    <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                        {course.sourceUrl ? (
                            <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-xs font-mono text-green-400 flex items-center gap-1.5">
                                <Globe className="w-3 h-3" />
                                {course.platform || 'خارجي'}
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                                <MonitorPlay className="w-3 h-3" />
                                أصلي من تولزي
                            </span>
                        )}

                        {course.hasCertificate && (
                            <span className="px-3 py-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-full text-xs font-mono text-yellow-300 flex items-center gap-1.5">
                                <Award className="w-3 h-3" />
                                شهادة معتمدة
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className={`p-6 flex flex-col ${featured ? 'md:w-1/2 justify-center' : 'flex-1'}`}>
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.createdAt ? (() => {
                                const date = new Date(course.createdAt);
                                const now = new Date();
                                const diffTime = Math.abs(now.getTime() - date.getTime());
                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                                if (diffDays === 0) return 'أضيف اليوم';
                                if (diffDays === 1) return 'منذ أمس';
                                if (diffDays === 2) return 'منذ يومين';
                                if (diffDays < 7) return `منذ ${diffDays} أيام`;
                                if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
                                return `منذ ${Math.floor(diffDays / 30)} شهر`;
                            })() : 'جديد'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.studentsCount || 0}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            {course.rating || 5.0}
                            {course.reviewsCount ? <span className="text-gray-400 text-[10px] ml-0.5">({course.reviewsCount.toLocaleString()})</span> : null}
                        </span>
                    </div>

                    <h3 className={`font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${featured ? 'text-3xl' : 'text-lg'}`}>
                        {course.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 font-light">
                        {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                                {{
                                    'beginner': 'مبتدئ',
                                    'intermediate': 'متوسط',
                                    'advanced': 'متقدم',
                                    'all': 'جميع المستويات'
                                }[course.level?.toLowerCase() || 'all'] || course.level || 'جميع المستويات'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                                {course.category}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmartCourseCard;
