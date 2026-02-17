import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { LessonPlan } from "../../types";
import LessonCard from "./LessonCard";
import { isSameLocalDate } from "../../lib/dateUtils";

interface WeekViewProps {
    currentDate: Date;
    lessons: LessonPlan[];
    subjects: { id: number; name: string; color?: string }[];

    onDayClick: (date: Date) => void;
}

export default function WeekView({ currentDate, lessons, subjects, onDayClick }: WeekViewProps) {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    return (
        <div className="grid grid-cols-7 gap-4 h-full min-h-[600px]">
            {days.map((day) => {
                const dayLessons = lessons.filter(l => isSameLocalDate(l.plannedDate, day));
                // Calculate total hours planned (mock calculation as we don't have duration yet)
                const totalHours = dayLessons.length;

                return (
                    <DayColumn
                        key={day.toISOString()}
                        day={day}
                        lessons={dayLessons}
                        subjects={subjects}
                        totalHours={totalHours}
                        onDayClick={() => onDayClick(day)}
                    />
                );
            })}
        </div>
    );
}

interface DayColumnProps {
    day: Date;
    lessons: LessonPlan[];
    subjects: { id: number; name: string; color?: string }[];
    totalHours: number;
    onDayClick: () => void;
}

function DayColumn({ day, lessons, subjects, totalHours, onDayClick }: DayColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
        data: { date: day }
    });

    const isToday = isSameDay(day, new Date());

    return (
        <div ref={setNodeRef} className={clsx("flex flex-col h-full rounded-xl transition-colors", isOver ? "bg-indigo-50/50 ring-2 ring-indigo-200" : "bg-gray-50 dark:bg-slate-800/30")}>
            {/* Header */}
            <div
                onClick={onDayClick}
                className={clsx(
                    "p-3 text-center border-b border-gray-100 cursor-pointer hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-800/60 rounded-t-xl transition-colors",
                    isToday && "bg-indigo-50"
                )}
            >
                <div className="text-sm font-medium text-gray-500 uppercase">{format(day, 'EEE')}</div>
                <div className={clsx("text-xl font-bold mt-0.5", isToday ? "text-indigo-600" : "text-gray-900 dark:text-slate-100")}>
                    {format(day, 'd')}
                </div>
                {totalHours > 0 && (
                    <div className="text-[10px] text-gray-400 mt-1 font-medium">{totalHours}h Planned</div>
                )}
            </div>

            {/* Lessons Container */}
            <div className="flex-1 p-2 space-y-2 min-h-[100px]">
                {lessons.map(lesson => {
                    const subject = subjects.find(s => s.id === lesson.subjectId);
                    return (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            subjectColor={subject?.color}
                        />
                    );
                })}
                {lessons.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-gray-300 italic">No plans</p>
                    </div>
                )}
            </div>
        </div>
    );
}
