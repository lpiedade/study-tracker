import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import clsx from "clsx";

interface CalendarHeaderProps {
    currentDate: Date;
    view: 'week' | 'month';
    onViewChange: (view: 'week' | 'month') => void;
    onNavigate: (direction: 'prev' | 'next' | 'today') => void;
    subjects: { id: number; name: string; color?: string }[];
}

export default function CalendarHeader({ currentDate, view, onViewChange, onNavigate, subjects }: CalendarHeaderProps) {
    return (
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('today')} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        Today
                    </button>
                    <div className="flex items-center rounded-md border border-gray-200 bg-white">
                        <button onClick={() => onNavigate('prev')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="w-px h-8 bg-gray-200" />
                        <button onClick={() => onNavigate('next')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Center: Date Display */}
                <h2 className="text-xl font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>

                {/* Right: View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => onViewChange('week')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'week' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <List className="w-4 h-4" /> Week
                    </button>
                    <button
                        onClick={() => onViewChange('month')}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'month' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <CalendarIcon className="w-4 h-4" /> Month
                    </button>
                </div>
            </div>

            {/* Legacy / Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subjects:</span>
                {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color || '#4f46e5' }} />
                        <span className="text-sm text-gray-600">{subject.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
