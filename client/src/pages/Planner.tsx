import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { LessonPlan, StudySession } from '../types';
import clsx from 'clsx';

export default function Planner() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'sessions'>('lessons');
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newLesson, setNewLesson] = useState({ title: '', subject: '', plannedDate: format(new Date(), 'yyyy-MM-dd') });
    const [newSession, setNewSession] = useState({ subject: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '' });

    const fetchData = async () => {
        try {
            const [lessonsRes, sessionsRes] = await Promise.all([
                api.get('/lessons'),
                api.get('/sessions')
            ]);
            setLessons(lessonsRes.data);
            setSessions(sessionsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/lessons', newLesson);
            setNewLesson({ title: '', subject: '', plannedDate: format(new Date(), 'yyyy-MM-dd') });
            fetchData();
        } catch (err) {
            alert('Failed to create lesson');
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/sessions', newSession);
            setNewSession({ subject: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '' });
            fetchData();
        } catch (err) {
            alert('Failed to log session');
        }
    };

    const toggleLesson = async (id: number, current: boolean) => {
        try {
            await api.put(`/lessons/${id}/complete`, { isCompleted: !current });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteSession = async (id: number) => {
        if (!confirm("Delete this session?")) return;
        try {
            await api.delete(`/sessions/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Study Planner</h2>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'lessons' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                        Lesson Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'sessions' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                    >
                        Session History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    {activeTab === 'lessons' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {lessons.length === 0 && <p className="p-6 text-center text-gray-500">No lessons planned.</p>}
                                {lessons.map(lesson => (
                                    <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-start gap-4">
                                            <button onClick={() => toggleLesson(lesson.id, lesson.isCompleted)} className={clsx("mt-1", lesson.isCompleted ? "text-green-500" : "text-gray-300 hover:text-gray-400")}>
                                                <CheckCircle className="w-6 h-6" />
                                            </button>
                                            <div>
                                                <h3 className={clsx("font-medium text-gray-900", lesson.isCompleted && "line-through text-gray-500")}>{lesson.title}</h3>
                                                <p className="text-sm text-gray-500">{lesson.subject} • {format(new Date(lesson.plannedDate), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {sessions.length === 0 && <p className="p-6 text-center text-gray-500">No sessions logged.</p>}
                                {sessions.map(session => (
                                    <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{session.subject}</h3>
                                            <p className="text-sm text-gray-500">{session.topic}</p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(session.startTime), 'MMM d, h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium", session.isReview ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                                                {session.isReview ? 'Review' : 'Study'}
                                            </span>
                                            <button onClick={() => deleteSession(session.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Form Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {activeTab === 'lessons' ? 'Add New Lesson' : 'Log Session'}
                    </h3>

                    {activeTab === 'lessons' ? (
                        <form onSubmit={handleCreateLesson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.subject} onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input required type="date" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.plannedDate} onChange={e => setNewLesson({ ...newLesson, plannedDate: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Lesson
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newSession.subject} onChange={e => setNewSession({ ...newSession, subject: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                    <input required type="datetime-local" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={newSession.startTime} onChange={e => setNewSession({ ...newSession, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                                    <input required type="datetime-local" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={newSession.endTime} onChange={e => setNewSession({ ...newSession, endTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isReview" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={newSession.isReview} onChange={e => setNewSession({ ...newSession, isReview: e.target.checked })} />
                                <label htmlFor="isReview" className="text-sm text-gray-700">This is a review session</label>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Log Session
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
