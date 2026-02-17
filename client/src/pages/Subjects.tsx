import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../lib/api';
import type { Subject, Course } from '../types';

export default function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', color: '#4f46e5', courseId: '' });
    const [newForm, setNewForm] = useState({ name: '', description: '', color: '#4f46e5', courseId: '' });

    const fetchData = async () => {
        try {
            const [subjectsRes, coursesRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/courses')
            ]);
            setSubjects(subjectsRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/subjects', newForm);
            setNewForm({ name: '', description: '', color: '#4f46e5', courseId: '' });
            fetchData();
        } catch (err) {
            alert('Failed to create subject');
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await api.put(`/subjects/${id}`, editForm);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Failed to update subject');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will affect all linked sessions and lessons.')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete subject');
        }
    };

    const startEditing = (subject: Subject) => {
        setEditingId(subject.id);
        setEditForm({
            name: subject.name,
            description: subject.description || '',
            color: subject.color || '#4f46e5',
            courseId: subject.courseId?.toString() || ''
        });
    };

    if (loading) return <div className="p-8">Loading subjects...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Manage Subjects</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                        <div className="divide-y divide-gray-200 dark:divide-slate-800">
                            {subjects.length === 0 && <p className="p-6 text-center text-gray-500 dark:text-slate-400">No subjects found.</p>}
                            {subjects.map(subject => (
                                <div key={subject.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/60">
                                    {editingId === subject.id ? (
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 mr-4">
                                            <input className="rounded border-gray-300 text-sm" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                            <input className="rounded border-gray-300 text-sm" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                                            <select required className="rounded border-gray-300 text-sm" value={editForm.courseId} onChange={e => setEditForm({ ...editForm, courseId: e.target.value })}>
                                                <option value="" disabled>Select a Course</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <div className="flex gap-2">
                                                <input type="color" className="h-8 w-12" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} />
                                                <button onClick={() => handleUpdate(subject.id)} className="text-green-600 p-1"><Check className="w-5 h-5" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600 p-1"><X className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 dark:text-slate-100 truncate">{subject.name}</h3>
                                                    {subject.Course && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 mb-1">
                                                            {subject.Course.name}
                                                        </span>
                                                    )}
                                                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{subject.description || 'No description'}</p>

                                                    {subject.lessonPlans && subject.lessonPlans.length > 0 && (
                                                        <div className="mt-2 max-w-xs">
                                                            <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mb-1">
                                                                <span>Progress: {subject.lessonPlans.filter(l => l.isCompleted).length}/{subject.lessonPlans.length} lessons</span>
                                                                <span>{Math.round((subject.lessonPlans.filter(l => l.isCompleted).length / subject.lessonPlans.length) * 100)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                                                                <div
                                                                    className="h-1.5 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        backgroundColor: subject.color || '#4f46e5',
                                                                        width: `${(subject.lessonPlans.filter(l => l.isCompleted).length / subject.lessonPlans.length) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 ml-4">
                                                <button onClick={() => startEditing(subject)} className="text-gray-400 dark:text-slate-500 hover:text-indigo-600"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(subject.id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Add New Subject</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                            <input id="subject-name" required type="text" className="w-full rounded-lg border-gray-300" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="subject-desc" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                            <input id="subject-desc" type="text" className="w-full rounded-lg border-gray-300" value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="subject-course" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Course</label>
                            <select id="subject-course" required className="w-full rounded-lg border-gray-300" value={newForm.courseId} onChange={e => setNewForm({ ...newForm, courseId: e.target.value })}>
                                <option value="" disabled>Select a Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="subject-color" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Color</label>
                            <input id="subject-color" type="color" className="w-full h-10 rounded-lg p-1" value={newForm.color} onChange={e => setNewForm({ ...newForm, color: e.target.value })} />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Subject
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
