import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from "date-fns";
import clsx from "clsx";
import type { LessonPlan } from "../../types";
import { isSameLocalDate } from "../../lib/dateUtils";

interface MonthViewProps {
    currentDate: Date;
    lessons: LessonPlan[];
    subjects: { id: number; name: string; color?: string }[];
    onDayClick: (date: Date) => void;
}

export default function MonthView({ currentDate, lessons, subjects, onDayClick }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1 divide-x divide-gray-200">
                {/* We used flex-1 above to fill height, but grid layout needs explicit rows if we want uniform height. 
             Actually a simple grid with auto-rows is better. Let's adjust structure slightly. */}
                {days.map((day) => {
                    const dayLessons = lessons.filter(l => isSameLocalDate(l.plannedDate, day));
                    // Unique subjects on this day
                    const dailySubjectIds = Array.from(new Set(dayLessons.map(l => l.subjectId)));
                    const MAX_TILES = 6;
                    const displaySubjects = dailySubjectIds.slice(0, MAX_TILES);
                    const moreCount = dailySubjectIds.length - MAX_TILES;

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            className={clsx(
                                "min-h-[80px] p-2 hover:bg-gray-50 cursor-pointer transition-colors relative border-b border-gray-100",
                                !isCurrentMonth && "bg-gray-50/50"
                            )}
                        >
                            <span className={clsx(
                                "text-sm font-medium block mb-2",
                                !isCurrentMonth ? "text-gray-400" : "text-gray-700",
                                isToday && "text-indigo-600 font-bold"
                            )}>
                                {format(day, 'd')}
                            </span>

                            <div className="grid grid-cols-3 gap-1">
                                {displaySubjects.map(subId => {
                                    const subject = subjects.find(s => s.id === subId);
                                    return (
                                        <div
                                            key={`${day.toISOString()}-${subId}`}
                                            className="h-1.5 w-full rounded-full"
                                            style={{ backgroundColor: subject?.color || '#e5e7eb' }}
                                            title={subject?.name}
                                        />
                                    );
                                })}
                                {moreCount > 0 && (
                                    <div className="text-[9px] text-gray-400 font-medium flex items-center justify-center">
                                        +{moreCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
