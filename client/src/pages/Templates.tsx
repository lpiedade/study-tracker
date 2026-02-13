import { useState, useEffect } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import api from '../lib/api';
import type { ChecklistTemplate } from '../types';

export default function Templates() {
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newItems, setNewItems] = useState<string[]>(['']);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/templates');
            setTemplates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleAddItem = () => setNewItems([...newItems, '']);
    const handleItemChange = (index: number, value: string) => {
        const updated = [...newItems];
        updated[index] = value;
        setNewItems(updated);
    };
    const handleRemoveInputItem = (index: number) => {
        setNewItems(newItems.filter((_, i) => i !== index));
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const filteredItems = newItems.filter(item => item.trim() !== '');
            await api.post('/templates', {
                name: newName,
                description: newDesc,
                items: filteredItems
            });
            setNewName('');
            setNewDesc('');
            setNewItems(['']);
            fetchTemplates();
        } catch (err) {
            alert('Failed to create template');
        }
    };

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDeleteTemplate = async (id: number) => {
        try {
            await api.delete(`/templates/${id}`);
            fetchTemplates();
            setDeletingId(null);
        } catch (err) {
            alert('Failed to delete template');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Checklist Templates</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    {templates.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                            No templates created yet.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(template => (
                            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                                    {deletingId === template.id ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-red-600 font-medium">Sure?</span>
                                            <button
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="text-red-600 hover:text-red-700 font-bold text-xs"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                className="text-gray-500 hover:text-gray-700 text-xs"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeletingId(template.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {template.description && <p className="text-sm text-gray-600 mb-4">{template.description}</p>}
                                <div className="space-y-2 mt-auto">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items ({template.items.length})</p>
                                    <ul className="text-sm text-gray-700 list-disc list-inside">
                                        {template.items.slice(0, 3).map(item => (
                                            <li key={item.id} className="truncate">{item.text}</li>
                                        ))}
                                        {template.items.length > 3 && <li className="text-xs text-gray-400 italic">+{template.items.length - 3} more</li>}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Template</h3>
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                required
                                type="text"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Math Lesson Base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={2}
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Checklist Items</label>
                            {newItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={item}
                                        onChange={e => handleItemChange(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInputItem(index)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <ClipboardList className="w-4 h-4" /> Create Template
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
