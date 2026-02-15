import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import api from '../lib/api';
import type { ExamResult, StudySession } from '../types';
import { format } from 'date-fns';

export default function Analytics() {
    const [exams, setExams] = useState<ExamResult[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, sessionsRes] = await Promise.all([
                    api.get('/exams'),
                    api.get('/sessions')
                ]);
                setExams(examsRes.data);
                setSessions(sessionsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading analytics...</div>;

    // Process data for charts
    // 1. Score History (sorted by date)
    const scoreData = [...exams]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(exam => {
            const scorePercent = exam.maxScore > 0 ? (exam.score / exam.maxScore) * 100 : 0;
            return {
                date: format(new Date(exam.date), 'MMM d'),
                score: Math.round(scorePercent * 10) / 10,
                subject: exam.Subject?.name || 'Unknown'
            };
        });

    // 2. Study Hours by Subject
    const subjectHours: Record<string, { hours: number, color: string }> = {};
    sessions.forEach(session => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        
        if (isNaN(start) || isNaN(end) || end <= start) return;

        const hours = (end - start) / (1000 * 60 * 60);
        const subjectName = session.Subject?.name || 'Unknown';
        const color = session.Subject?.color || '#4f46e5';

        if (!subjectHours[subjectName]) {
            subjectHours[subjectName] = { hours: 0, color };
        }
        subjectHours[subjectName].hours += hours;
    });

    const sessionData = Object.entries(subjectHours).map(([subject, data]) => ({
        subject,
        hours: Math.round(data.hours * 10) / 10,
        color: data.color
    }));

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Score Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trend (%)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scoreData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="Score %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Study Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Hours by Subject</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="hours" name="Hours">
                                    {sessionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
