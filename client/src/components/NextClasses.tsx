import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import type { LessonPlan } from '../types';
import { parseLocalDate } from '../lib/dateUtils';

export default function NextClasses() {
    const [upcomingLessons, setUpcomingLessons] = useState<LessonPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const response = await api.get('/lessons/upcoming');
                setUpcomingLessons(response.data);
            } catch (error) {
                console.error("Failed to fetch upcoming lessons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-500 dark:text-slate-400">Loading upcoming classes...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Next 3 Classes</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
                {upcomingLessons.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-slate-400">No upcoming classes scheduled.</div>
                ) : (
                    upcomingLessons.map((lesson) => (
                        <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}>
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-slate-100">{lesson.Subject?.name || 'Unknown'}</h4>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{lesson.title}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {format(parseLocalDate(lesson.plannedDate), 'MMM d, yyyy')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                    {/* Placeholder for time if available, or just date */}
                                    Scheduled
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
