import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
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
        .map(exam => ({
            date: format(new Date(exam.date), 'MMM d'),
            score: (exam.score / exam.maxScore) * 100,
            subject: exam.subject
        }));

    // 2. Study Hours by Subject
    const subjectHours: Record<string, number> = {};
    sessions.forEach(session => {
        const hours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
        subjectHours[session.subject] = (subjectHours[session.subject] || 0) + hours;
    });

    const sessionData = Object.entries(subjectHours).map(([subject, hours]) => ({
        subject,
        hours: Math.round(hours * 10) / 10
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
                                <Bar dataKey="hours" fill="#0ea5e9" name="Hours" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
