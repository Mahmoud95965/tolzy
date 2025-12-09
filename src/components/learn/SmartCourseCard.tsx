import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Award, Globe, MonitorPlay, Users, Star, ArrowUpRight } from 'lucide-react';
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

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

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
            className={`group relative cursor-pointer h-full ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
            <div
                style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                className={`h-full bg-white dark:bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10 transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] ${featured ? 'flex flex-col md:flex-row' : 'flex flex-col'}`}
            >
                {/* Thumbnail */}
                <div className={`relative overflow-hidden ${featured ? 'md:w-3/5 h-64 md:h-auto' : 'h-52'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40" />
                    <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop'}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end max-w-[80%]">
                        {course.sourceUrl ? (
                            <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-white flex items-center gap-1.5 shadow-lg">
                                <Globe className="w-3 h-3 text-blue-400" />
                                {course.platform || 'خارجي'}
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-md border border-indigo-400/30 rounded-full text-xs font-medium text-white flex items-center gap-1.5 shadow-lg">
                                <MonitorPlay className="w-3 h-3" />
                                حصري
                            </span>
                        )}
                        {course.hasCertificate && (
                            <span className="px-3 py-1 bg-yellow-500/80 backdrop-blur-md border border-yellow-400/30 rounded-full text-xs font-medium text-white flex items-center gap-1.5 shadow-lg">
                                <Award className="w-3 h-3" />
                                شهادة
                            </span>
                        )}
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-bold border shadow-lg ${course.price === 'free'
                            ? 'bg-green-500/80 text-white border-green-400/30'
                            : 'bg-white/90 text-gray-900 border-white/50'
                            }`}>
                            {course.price === 'free' ? 'مجاني' : 'مدفوع'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className={`p-6 flex flex-col ${featured ? 'md:w-2/5 justify-between bg-gray-50/50 dark:bg-white/5' : 'flex-1'}`}>
                    <div>
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {course.studentsCount ? course.studentsCount.toLocaleString() : '0'} طالب
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {course.rating || 5.0}
                            </span>
                        </div>

                        <h3 className={`font-bold text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${featured ? 'text-2xl lg:text-3xl' : 'text-lg line-clamp-2'}`}>
                            {course.title}
                        </h3>

                        <p className={`text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 ${featured ? 'line-clamp-4' : 'line-clamp-2'}`}>
                            {course.description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {(course.instructor?.[0] || 'T').toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                        {course.instructor || 'Tolzy Team'}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        {course.level || 'مبتدئ'}
                                    </span>
                                </div>
                            </div>

                            <button className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmartCourseCard;
