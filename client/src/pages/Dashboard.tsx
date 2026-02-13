import { useEffect, useState } from 'react';
import { Clock, BookOpen, Trophy, AlertCircle } from 'lucide-react';
import NextClasses from '../components/NextClasses';
import api from '../lib/api';
import type { StatsSummary, StudySession } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
    const [stats, setStats] = useState<StatsSummary | null>(null);
    const [overdue, setOverdue] = useState<number>(0);
    const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, progressRes, sessionsRes] = await Promise.all([
                    api.get('/stats/summary'),
                    api.get('/stats/progress'),
                    api.get('/sessions')
                ]);

                setStats(summaryRes.data);
                setOverdue(progressRes.data.overdueLessons);
                setRecentSessions(sessionsRes.data.slice(0, 5)); // Take top 5
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500 mt-1">Welcome back! Here's your study overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Study Hours"
                    value={stats?.totalHours.toFixed(1) || "0"}
                    icon={Clock}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Sessions Completed"
                    value={stats?.totalSessions.toString() || "0"}
                    icon={BookOpen}
                    color="bg-indigo-500"
                />
                <StatsCard
                    title="Average Score"
                    value={stats?.averageScore.toFixed(1) || "0"}
                    icon={Trophy}
                    color="bg-emerald-500"
                />
                <StatsCard
                    title="Overdue Lessons"
                    value={overdue.toString()}
                    icon={AlertCircle}
                    color={overdue > 0 ? "bg-red-500" : "bg-green-500"}
                    subtext={overdue > 0 ? "Catch up needed!" : "On track"}
                />
            </div>

            {/* Next Classes */}
            <NextClasses />

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentSessions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No recent study sessions found.</div>
                    ) : (
                        recentSessions.map((session) => (
                            <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: session.Subject?.color }} />
                                        <h4 className="font-medium text-gray-900">{session.Subject?.name || 'Unknown'}</h4>
                                    </div>
                                    <p className="text-sm text-gray-500">{session.topic}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.isReview ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {session.isReview ? 'Review' : 'New Study'}
                                    </span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {format(new Date(session.startTime), 'MMM d, h:mm a')}
                                    </p>
                                    {session.LessonPlan && (
                                        <p className="text-xs text-indigo-600 mt-1 truncate max-w-[150px]">
                                            {session.LessonPlan.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, subtext }: { title: string, value: string, icon: any, color: string, subtext?: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                {subtext && <p className="mt-1 text-xs font-medium text-gray-500">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} text-white`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
