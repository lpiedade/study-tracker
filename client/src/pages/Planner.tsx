import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Plus, Trash2, Edit2, X } from 'lucide-react';
import api from '../lib/api';
import type { LessonPlan, StudySession, Subject, ChecklistTemplate } from '../types';
import clsx from 'clsx';

export default function Planner() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'sessions'>('lessons');
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newLesson, setNewLesson] = useState({ title: '', subjectId: '', plannedDate: format(new Date(), 'yyyy-MM-dd'), templateId: '' });
    const [newSession, setNewSession] = useState({ subjectId: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '' });
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [lessonsRes, sessionsRes, subjectsRes, templatesRes] = await Promise.all([
                api.get('/lessons'),
                api.get('/sessions'),
                api.get('/subjects'),
                api.get('/templates')
            ]);
            setLessons(lessonsRes.data);
            setSessions(sessionsRes.data);
            setSubjects(subjectsRes.data);
            setTemplates(templatesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLessonId) {
                await api.put(`/lessons/${editingLessonId}`, newLesson);
                setEditingLessonId(null);
            } else {
                await api.post('/lessons', newLesson);
            }
            setNewLesson(prev => ({
                ...prev,
                title: ''
            }));
            fetchData();
        } catch (err) {
            alert('Failed to save lesson');
        }
    };

    const handleDeleteLesson = async (id: number) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            await api.delete(`/lessons/${id}`);
            if (editingLessonId === id) {
                cancelEditing();
            }
            fetchData();
        } catch (err) {
            alert('Failed to delete lesson');
        }
    };

    const toggleChecklistItem = async (itemId: number) => {
        try {
            await api.put(`/lessons/checklist-items/${itemId}/toggle`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const startEditingLesson = (lesson: LessonPlan) => {
        setEditingLessonId(lesson.id);
        setNewLesson({
            title: lesson.title,
            subjectId: lesson.subjectId.toString(),
            plannedDate: format(new Date(lesson.plannedDate), 'yyyy-MM-dd'),
            templateId: '' // Templates are applied only on creation in this version
        });
    };

    const cancelEditing = () => {
        setEditingLessonId(null);
        setNewLesson({ title: '', subjectId: '', plannedDate: format(new Date(), 'yyyy-MM-dd'), templateId: '' });
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/sessions', newSession);
            setNewSession({ subjectId: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '' });
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
                                                <p className="text-sm text-gray-500">
                                                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: lesson.Subject?.color }}></span>
                                                    {lesson.Subject?.name || 'Unknown'} • {format(new Date(lesson.plannedDate), 'MMM d, yyyy')}
                                                </p>

                                                {lesson.checklist && lesson.checklist.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                                            <span>Checklist ({lesson.checklist.filter(i => i.isCompleted).length}/{lesson.checklist.length})</span>
                                                            <span>{Math.round((lesson.checklist.filter(i => i.isCompleted).length / lesson.checklist.length) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                                            <div
                                                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                                                style={{ width: `${(lesson.checklist.filter(i => i.isCompleted).length / lesson.checklist.length) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                                            {lesson.checklist.map(item => (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => toggleChecklistItem(item.id)}
                                                                    className="flex items-center gap-2 text-sm text-left group"
                                                                >
                                                                    <div className={clsx(
                                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                                        item.isCompleted ? "bg-indigo-600 border-indigo-600" : "border-gray-300 group-hover:border-indigo-400"
                                                                    )}>
                                                                        {item.isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                                                    </div>
                                                                    <span className={clsx(item.isCompleted && "line-through text-gray-400")}>{item.text}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEditingLesson(lesson)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
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
                                            <h3 className="font-medium text-gray-900">{session.Subject?.name || 'Unknown'}</h3>
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {activeTab === 'lessons'
                                ? (editingLessonId ? 'Edit Lesson' : 'Add New Lesson')
                                : 'Log Session'}
                        </h3>
                        {editingLessonId && (
                            <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {activeTab === 'lessons' ? (
                        <form onSubmit={handleSaveLesson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select required className="w-full rounded-lg border-gray-300"
                                    value={newLesson.subjectId} onChange={e => setNewLesson({ ...newLesson, subjectId: e.target.value })}>
                                    <option value="">Select a Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input required type="date" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.plannedDate} onChange={e => setNewLesson({ ...newLesson, plannedDate: e.target.value })} />
                            </div>
                            {!editingLessonId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Template (Optional)</label>
                                    <select className="w-full rounded-lg border-gray-300"
                                        value={newLesson.templateId} onChange={e => setNewLesson({ ...newLesson, templateId: e.target.value })}>
                                        <option value="">No Template</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> {editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select required className="w-full rounded-lg border-gray-300"
                                    value={newSession.subjectId} onChange={e => setNewSession({ ...newSession, subjectId: e.target.value })}>
                                    <option value="">Select a Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
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
