import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../lib/api';
import type { Subject } from '../types';

export default function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', color: '#4f46e5' });
    const [newForm, setNewForm] = useState({ name: '', description: '', color: '#4f46e5' });

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/subjects', newForm);
            setNewForm({ name: '', description: '', color: '#4f46e5' });
            fetchSubjects();
        } catch (err) {
            alert('Failed to create subject');
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await api.put(`/subjects/${id}`, editForm);
            setEditingId(null);
            fetchSubjects();
        } catch (err) {
            alert('Failed to update subject');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will affect all linked sessions and lessons.')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
        } catch (err) {
            alert('Failed to delete subject');
        }
    };

    const startEditing = (subject: Subject) => {
        setEditingId(subject.id);
        setEditForm({ name: subject.name, description: subject.description || '', color: subject.color || '#4f46e5' });
    };

    if (loading) return <div className="p-8">Loading subjects...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Manage Subjects</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {subjects.length === 0 && <p className="p-6 text-center text-gray-500">No subjects found.</p>}
                            {subjects.map(subject => (
                                <div key={subject.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                    {editingId === subject.id ? (
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 mr-4">
                                            <input className="rounded border-gray-300 text-sm" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                            <input className="rounded border-gray-300 text-sm" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                                            <div className="flex gap-2">
                                                <input type="color" className="h-8 w-12" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} />
                                                <button onClick={() => handleUpdate(subject.id)} className="text-green-600 p-1"><Check className="w-5 h-5" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600 p-1"><X className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                                                    <p className="text-sm text-gray-500">{subject.description || 'No description'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => startEditing(subject)} className="text-gray-400 hover:text-indigo-600"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(subject.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Subject</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input required type="text" className="w-full rounded-lg border-gray-300" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" className="w-full rounded-lg border-gray-300" value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="color" className="w-full h-10 rounded-lg p-1" value={newForm.color} onChange={e => setNewForm({ ...newForm, color: e.target.value })} />
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
