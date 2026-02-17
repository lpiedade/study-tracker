import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Plus, Trash2, Edit2, X, BookOpen } from 'lucide-react';
import api from '../lib/api';
import type { Course, LessonPlan, StudySession, Subject, ChecklistTemplate } from '../types';
import clsx from 'clsx';
import { parseLocalDate } from '../lib/dateUtils';

export default function Planner() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'sessions'>('lessons');
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newLesson, setNewLesson] = useState({ title: '', subjectId: '', plannedDate: format(new Date(), 'yyyy-MM-dd'), templateId: '' });
    const [newSession, setNewSession] = useState<{
        courseId: string | number;
        subjectId: string | number;
        topic: string;
        startTime: string;
        endTime: string;
        isReview: boolean;
        notes: string;
        lessonPlanId?: number;
    }>({
        courseId: '', subjectId: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '', lessonPlanId: undefined
    });
    const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [lessonsRes, sessionsRes, subjectsRes, coursesRes, templatesRes] = await Promise.all([
                api.get('/lessons'),
                api.get('/sessions'),
                api.get('/subjects'),
                api.get('/courses'),
                api.get('/templates')
            ]);
            setLessons(lessonsRes.data);
            setSessions(sessionsRes.data);
            setSubjects(subjectsRes.data);
            setCourses(coursesRes.data);
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
            // Fix date timezone issue: construct date from local midnight string to ensure correct day
            const payload = {
                ...newLesson,
                plannedDate: newLesson.plannedDate // Keep as YYYY-MM-DD for consistency
            };

            if (editingLessonId) {
                await api.put(`/lessons/${editingLessonId}`, payload);
                setEditingLessonId(null);
            } else {
                await api.post('/lessons', payload);
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

    const handleDeleteClick = (id: number) => {
        setDeletingLessonId(id);
    };

    const confirmDeleteLesson = async () => {
        if (!deletingLessonId) return;
        try {
            await api.delete(`/lessons/${deletingLessonId}`);
            if (editingLessonId === deletingLessonId) {
                cancelEditing();
            }
            fetchData();
        } catch (err) {
            alert('Failed to delete lesson');
        } finally {
            setDeletingLessonId(null);
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
        const parsedDate = parseLocalDate(lesson.plannedDate);
        setNewLesson({
            title: lesson.title,
            subjectId: lesson.subjectId.toString(),
            plannedDate: format(parsedDate, 'yyyy-MM-dd'),
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
            const { courseId: _courseId, ...sessionPayload } = newSession;
            await api.post('/sessions', sessionPayload);
            setNewSession({ courseId: '', subjectId: '', topic: '', startTime: '', endTime: '', isReview: false, notes: '', lessonPlanId: undefined });
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

    const filteredSubjects = newSession.courseId
        ? subjects.filter(subject => String(subject.courseId) === String(newSession.courseId))
        : [];

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Study Planner</h2>

                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'lessons' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200")}
                    >
                        Lesson Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'sessions' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200")}
                    >
                        Session History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    {activeTab === 'lessons' ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                            <div className="divide-y divide-gray-200 dark:divide-slate-800">
                                {lessons.length === 0 && <p className="p-6 text-center text-gray-500 dark:text-slate-400">No lessons planned.</p>}
                                {lessons.map(lesson => (
                                    <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/60">
                                        <div className="flex items-start gap-4">
                                            <button onClick={() => toggleLesson(lesson.id, lesson.isCompleted)} className={clsx("mt-1", lesson.isCompleted ? "text-green-500" : "text-gray-300 hover:text-gray-400 dark:text-slate-500")}>
                                                <CheckCircle className="w-6 h-6" />
                                            </button>
                                            <div>
                                                <h3 className={clsx("font-medium text-gray-900 dark:text-slate-100", lesson.isCompleted && "line-through text-gray-500 dark:text-slate-400")}>{lesson.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: lesson.Subject?.color }}></span>
                                                    {lesson.Subject?.name || 'Unknown'} • {parseLocalDate(lesson.plannedDate).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>

                                                {lesson.checklist && lesson.checklist.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 mb-1">
                                                            <span>Checklist ({lesson.checklist.filter(i => i.isCompleted).length}/{lesson.checklist.length})</span>
                                                            <span>{Math.round((lesson.checklist.filter(i => i.isCompleted).length / lesson.checklist.length) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mb-3">
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
                                                                    <span className={clsx(item.isCompleted && "line-through text-gray-400 dark:text-slate-500")}>{item.text}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEditingLesson(lesson)} className="text-gray-400 dark:text-slate-500 hover:text-indigo-600 transition-colors">
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(lesson.id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                            <div className="divide-y divide-gray-200 dark:divide-slate-800">
                                {sessions.length === 0 && <p className="p-6 text-center text-gray-500 dark:text-slate-400">No sessions logged.</p>}
                                {sessions.map(session => (
                                    <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/60">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-slate-100">{session.Subject?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{session.topic}</p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(session.startTime), 'MMM d, h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                            </div>
                                            {session.LessonPlan && (
                                                <div className="mt-1 flex items-center gap-2 text-xs text-indigo-600">
                                                    <BookOpen className="w-3 h-3" />
                                                    Lesson: {session.LessonPlan.title}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium", session.isReview ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                                                {session.isReview ? 'Review' : 'Study'}
                                            </span>
                                            <button onClick={() => deleteSession(session.id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500">
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
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                            {activeTab === 'lessons'
                                ? (editingLessonId ? 'Edit Lesson' : 'Add New Lesson')
                                : 'Log Session'}
                        </h3>
                        {editingLessonId && (
                            <button onClick={cancelEditing} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {activeTab === 'lessons' ? (
                        <form onSubmit={handleSaveLesson} className="space-y-4">
                            <div>
                                <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                                <input required id="lessonTitle" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                            </div>
                            <div>
                                <label htmlFor="lessonSubject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                                <select required id="lessonSubject" className="w-full rounded-lg border-gray-300"
                                    value={newLesson.subjectId} onChange={e => setNewLesson({ ...newLesson, subjectId: e.target.value })}>
                                    <option value="">Select a Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lessonDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
                                <input required id="lessonDate" type="date" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newLesson.plannedDate} onChange={e => setNewLesson({ ...newLesson, plannedDate: e.target.value })} />
                            </div>
                            {!editingLessonId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Checklist Template (Optional)</label>
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
                                <label htmlFor="sessionCourse" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Course</label>
                                <select
                                    required
                                    id="sessionCourse"
                                    className="w-full rounded-lg border-gray-300"
                                    value={newSession.courseId}
                                    onChange={e => setNewSession({ ...newSession, courseId: e.target.value, subjectId: '', lessonPlanId: undefined })}
                                >
                                    <option value="">Select a Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sessionSubject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                                <select
                                    required
                                    id="sessionSubject"
                                    disabled={!newSession.courseId}
                                    className="w-full rounded-lg border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                                    value={newSession.subjectId}
                                    onChange={e => setNewSession({ ...newSession, subjectId: e.target.value, lessonPlanId: undefined })}
                                >
                                    <option value="">{newSession.courseId ? 'Select a Subject' : 'Select a Course first'}</option>
                                    {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Linked Lesson (Optional)</label>
                                <select className="w-full rounded-lg border-gray-300"
                                    value={newSession.lessonPlanId || ''} onChange={e => setNewSession({ ...newSession, lessonPlanId: e.target.value ? Number(e.target.value) : undefined })}>
                                    <option value="">No specific lesson</option>
                                    {lessons
                                        .filter(l => String(l.subjectId) === String(newSession.subjectId))
                                        .map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sessionTopic" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                                <input required id="sessionTopic" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Start</label>
                                    <input required type="datetime-local" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={newSession.startTime} onChange={e => setNewSession({ ...newSession, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">End</label>
                                    <input required type="datetime-local" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={newSession.endTime} onChange={e => setNewSession({ ...newSession, endTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isReview" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={newSession.isReview} onChange={e => setNewSession({ ...newSession, isReview: e.target.checked })} />
                                <label htmlFor="isReview" className="text-sm text-gray-700 dark:text-slate-300">This is a review session</label>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Log Session
                            </button>
                        </form>
                    )}
                </div>
            </div>


            {/* Custom Delete Confirmation Modal */}
            {
                deletingLessonId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Delete Lesson</h3>
                            <p className="text-gray-600 dark:text-slate-400 mb-6">Are you sure you want to delete this lesson? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeletingLessonId(null)}
                                    className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteLesson}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
