import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import api from '../lib/api';
import type { Course } from '../types';

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                name: newName,
                description: newDesc
            });
            setNewName('');
            setNewDesc('');
            fetchCourses();
        } catch (err) {
            alert('Failed to create course');
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Delete this course? All associated subjects will also be deleted.')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (err) {
            alert('Failed to delete course');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Courses</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    {courses.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                            No courses created yet. Start by grouping your subjects into a course.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                        <h4 className="font-bold text-gray-900">{course.name}</h4>
                                    </div>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {course.description && <p className="text-sm text-gray-600 mb-4">{course.description}</p>}
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Subjects ({course.subjects?.length || 0})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {course.subjects?.slice(0, 3).map(subject => (
                                            <span key={subject.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: subject.color }}></span>
                                                {subject.name}
                                            </span>
                                        ))}
                                        {(course.subjects?.length || 0) > 3 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-500 italic">
                                                +{(course.subjects?.length || 0) - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Course</h3>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                required
                                type="text"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Computer Science, Economics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={2}
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Optional description..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Course
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
