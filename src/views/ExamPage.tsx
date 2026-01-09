import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
    CheckCircle, XCircle, Clock, RotateCcw, ChevronLeft, ChevronRight,
    Moon, Sun, Home, ArrowRight, Flag, List
} from 'lucide-react';
import Confetti from 'react-confetti';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export type QuestionType = 'mcq' | 'boolean';

export interface Question {
    id?: string;
    type?: QuestionType;
    q: string;
    options?: string[];
    a: string | boolean;
    explanation?: string;
}

export interface ExamData {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    duration?: number;
}

const ExamPage: React.FC<{ exam: ExamData }> = ({ exam }) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [examState, setExamState] = useState<'intro' | 'quiz' | 'result' | 'review'>('intro');
    const [mounted, setMounted] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);

    // Timer State
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Timer Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (examState === 'quiz') {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [examState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate score
    const score = useMemo(() => {
        let s = 0;
        exam.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.a) s++;
        });
        return s;
    }, [userAnswers, exam.questions]);

    const progress = Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100);

    const handleAnswer = (answer: any) => {
        // Prevent changing answer if already answered (Immediate feedback mode)
        if (userAnswers[currentQuestionIndex] !== undefined) return;

        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    };

    const toggleFlag = () => {
        setFlaggedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestionIndex)) next.delete(currentQuestionIndex);
            else next.add(currentQuestionIndex);
            return next;
        });
    };

    const navigateTo = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsNavOpen(false);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishExam();
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const finishExam = () => {
        setExamState('result');
    };

    const restartExam = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedQuestions(new Set());
        setElapsedSeconds(0);
        setExamState('intro');
    };

    if (!mounted) return null;

    // --- Components ---

    const QuestionNavigator = () => (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-indigo-600 text-white">
                <h3 className="font-bold">خريطة الأسئلة</h3>
                <button onClick={() => setIsNavOpen(false)}><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto max-h-[calc(100vh-64px)]">
                {exam.questions.map((_, idx) => {
                    let statusColor = "bg-gray-100 dark:bg-gray-800 text-gray-500";
                    if (currentQuestionIndex === idx) statusColor = "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300";
                    else if (flaggedQuestions.has(idx)) statusColor = "bg-yellow-100 text-yellow-700 border border-yellow-300";
                    else if (userAnswers[idx] !== undefined) {
                        // Show color based on correctness since we now have immediate feedback
                        const isCorrect = userAnswers[idx] === exam.questions[idx].a;
                        statusColor = isCorrect
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => navigateTo(idx)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${statusColor}`}
                        >
                            {idx + 1}
                            {flaggedQuestions.has(idx) && <Flag className="w-2 h-2 absolute top-1 right-1 fill-current" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const IntroView = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{exam.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg mx-auto">{exam.description}</p>
                <div className="flex justify-center gap-8 mb-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2"><List className="w-4 h-4" /> {exam.questions.length} سؤال</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> وقت مفتوح</div>
                </div>
                <button
                    onClick={() => setExamState('quiz')}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                >
                    بدء الاختبار الآن
                </button>
            </motion.div>
        </div>
    );

    const ReviewView = () => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8" dir="rtl">
            <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center sticky top-4 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">مراجعة الإجابات</h2>
                <button
                    onClick={() => setExamState('result')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    عودة للنتيجة
                </button>
            </header>

            <div className="max-w-3xl mx-auto space-y-6">
                {exam.questions.map((q, idx) => {
                    const userAnswer = userAnswers[idx];
                    const isCorrect = userAnswer === q.a;
                    const isSkipped = userAnswer === undefined;

                    return (
                        <div key={idx} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-r-4 ${isCorrect ? 'border-green-500' : isSkipped ? 'border-yellow-500' : 'border-red-500'} shadow-sm`}>
                            <div className="flex items-start gap-4 mb-4">
                                <span className="w-8 h-8 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-sm text-gray-600 dark:text-gray-300">
                                    {idx + 1}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{q.q}</h3>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="text-sm font-semibold text-gray-500 mb-2">إجابتك:</div>
                                <div className={`p-3 rounded-lg font-medium flex items-center gap-2 ${isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : isSkipped ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                                    {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    {isSkipped ? 'لم تتم الإجابة' : String(userAnswer)}
                                </div>
                                {!isCorrect && (
                                    <>
                                        <div className="text-sm font-semibold text-gray-500 mt-3 mb-2">الإجابة الصحيحة:</div>
                                        <div className="p-3 rounded-lg font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            {String(q.a)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {q.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                                    <strong>توضيح: </strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const ResultView = () => {
        const percentage = Math.round((score / exam.questions.length) * 100);
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4" dir="rtl">
                {percentage >= 70 && <Confetti recycle={false} numberOfPieces={500} />}
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-100 dark:text-indigo-900/50" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * percentage) / 100} className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-2xl font-black text-indigo-700 dark:text-indigo-300">{percentage}%</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {percentage >= 90 ? 'أداء مذهل!' : percentage >= 70 ? 'عمل رائع!' : percentage >= 50 ? 'جيد، استمر' : 'حاول مرة أخرى'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        أجبت على {score} من {exam.questions.length} سؤال بشكل صحيح
                    </p>
                    <p className="text-sm text-gray-500 mb-8 flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        الزمن المستغرق: {formatTime(elapsedSeconds)}
                    </p>

                    <div className="space-y-3">
                        <button onClick={() => setExamState('review')} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                            مراجعة الإجابات التفصيلية
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={restartExam} className="py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2">
                                <RotateCcw className="w-4 h-4" /> إعادة
                            </button>
                            <Link href="/tolzy-ai" className="py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> الرئيسية
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // --- Main Quiz Render ---
    if (examState === 'intro') return <IntroView />;
    if (examState === 'result') return <ResultView />;
    if (examState === 'review') return <ReviewView />;

    // Quiz Mode
    const currentQ = exam.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === exam.questions.length - 1;
    const userAnswer = userAnswers[currentQuestionIndex];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === currentQ.a;

    // Determine feedback state
    const feedbackStatus = isAnswered ? (isCorrect ? 'correct' : 'incorrect') : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300" dir="rtl">
            <QuestionNavigator />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-40 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tolzy-ai"><ArrowRight className="w-5 h-5 text-gray-500" /></Link>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-500">{currentQuestionIndex + 1}/{exam.questions.length}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(elapsedSeconds)}</span>
                    </div>
                    <button onClick={toggleFlag} className={`p-2 rounded-lg transition-colors ${flaggedQuestions.has(currentQuestionIndex) ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <Flag className="w-5 h-5 fill-current" />
                    </button>
                    <button onClick={() => setIsNavOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <List className="w-5 h-5" />
                    </button>
                    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Question Area */}
            <main className="pt-24 pb-24 px-4 max-w-2xl mx-auto flex flex-col justify-center min-h-[80vh]">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-snug">
                            {currentQ.q}
                        </h2>

                        <div className="space-y-3">
                            {(currentQ.options || ['True', 'False']).map((opt, idx) => {
                                const val = currentQ.type === 'boolean' ? (idx === 0) : opt;
                                const label = currentQ.type === 'boolean' ? (val ? 'صواب' : 'خطأ') : opt;
                                const isSelected = userAnswer === val;

                                let btnClass = `w-full p-5 rounded-2xl text-right font-medium text-lg transition-all border-2 relative overflow-hidden group `;

                                if (isAnswered) {
                                    if (val === currentQ.a) {
                                        btnClass += "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300";
                                    } else if (isSelected && val !== currentQ.a) {
                                        btnClass += "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300";
                                    } else {
                                        btnClass += "bg-gray-50 border-transparent text-gray-400 dark:bg-gray-800 dark:text-gray-600 opacity-50";
                                    }
                                } else {
                                    btnClass += "border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(val)}
                                        disabled={isAnswered}
                                        className={btnClass}
                                    >
                                        <div className="flex items-center justify-between z-10 relative">
                                            <span>{label}</span>
                                            {isAnswered && val === currentQ.a && <CheckCircle className="w-6 h-6 text-green-600" />}
                                            {isAnswered && isSelected && val !== currentQ.a && <XCircle className="w-6 h-6 text-red-600" />}
                                            {!isAnswered && <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-gray-400" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Immediate Feedback Footer */}
                        {feedbackStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-xl border ${feedbackStatus === 'correct' ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {feedbackStatus === 'correct' ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className={`font-bold ${feedbackStatus === 'correct' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {feedbackStatus === 'correct' ? 'إجابة صحيحة، أحسنت!' : 'إجابة خاطئة'}
                                    </span>
                                </div>
                                {feedbackStatus === 'incorrect' && (
                                    <div className="text-gray-700 dark:text-gray-200 mt-2 font-semibold">
                                        الإجابة الصحيحة هي: {String(currentQ.a)}
                                    </div>
                                )}
                                {currentQ.explanation && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed bg-white/50 dark:bg-black/10 p-2 rounded">
                                        {currentQ.explanation}
                                    </p>
                                )}
                            </motion.div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-40">
                <div className="max-w-2xl mx-auto flex justify-between gap-4">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextQuestion}
                        className={`flex-1 text-white rounded-xl font-bold py-3 transition-all shadow-lg flex items-center justify-center gap-2 ${isAnswered || isLast
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-none'
                            }`}
                    // Allow skipping if not answered? User said "Show correct answer BEFORE moving". 
                    // If I click Next without answering, do I skip?
                    // User requirement: "display correct answer ... before moving to next question".
                    // This implies I MUST answer or at least receive feedback.
                    // But user also said "allow users to skip".
                    // Let's stick to the implemented logic: Next button is enabled.
                    // If I click next without answering -> It skips (no feedback shown for that question yet, but can come back).
                    // If I answer -> Feedback shown -> Then I click Next.
                    // I will leave it as is, prioritizing the "Immediate Feedback" request which handles the "Show correct answer" part.
                    >
                        {isLast ? 'إنهاء واستعراض النتيجة' : 'التالي'}
                        {!isLast && <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ExamPage;
