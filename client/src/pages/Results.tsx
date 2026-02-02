import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trophy } from 'lucide-react';
import api from '../lib/api';
import type { ExamResult } from '../types';

export default function Results() {
    const [exams, setExams] = useState<ExamResult[]>([]);
    const [newExam, setNewExam] = useState({ subject: '', score: 0, maxScore: 100, date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/exams', newExam);
            setNewExam({ subject: '', score: 0, maxScore: 100, date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
            fetchData();
        } catch (err) {
            alert('Failed to add result');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Exam Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exams.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No exam results recorded.</td></tr>
                                )}
                                {exams.map(exam => {
                                    const percentage = (exam.score / exam.maxScore) * 100;
                                    return (
                                        <tr key={exam.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(exam.date), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.score} / {exam.maxScore}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${percentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Add Result
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input required type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newExam.subject} onChange={e => setNewExam({ ...newExam, subject: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                <input required type="number" step="0.1" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newExam.score} onChange={e => setNewExam({ ...newExam, score: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                <input required type="number" step="0.1" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={newExam.maxScore} onChange={e => setNewExam({ ...newExam, maxScore: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input required type="date" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Save Result
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
