import { useDraggable } from "@dnd-kit/core";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { LessonPlan } from "../../types";

interface LessonCardProps {
    lesson: LessonPlan;
    subjectColor?: string;
}

export default function LessonCard({ lesson, subjectColor }: LessonCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lesson.id.toString(),
        data: { lesson } // Pass lesson data for drop handling
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const isMissed = !lesson.isCompleted && new Date(lesson.plannedDate) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "relative p-2 mb-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm cursor-move group hover:shadow-md transition-all z-10",
                isDragging && "opacity-50 ring-2 ring-indigo-500 rotate-2",
                lesson.isCompleted && "bg-gray-50 dark:bg-slate-800"
            )}
        >
            {/* Left Color Stripe */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: subjectColor || '#4f46e5' }}
            />

            <div className="pl-2.5">
                <h4
                    data-testid="lesson-title"
                    className={clsx("text-xs font-semibold leading-tight mb-1", lesson.isCompleted ? "text-gray-500 dark:text-slate-400 line-through" : "text-gray-900 dark:text-slate-100")}
                >
                    {lesson.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        {/* Duration placeholder, since we don't have duration in schema yet, assuming 1h for now or just hiding */}
                        <Clock className="w-3 h-3" />
                        <span>Planned</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {lesson.isCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
                        {isMissed && !lesson.isCompleted && <AlertCircle className="w-3 h-3 text-red-500" />}
                    </div>
                </div>

                {/* Checklist Progress Bar */}
                {lesson.checklist && lesson.checklist.length > 0 && (
                    <div className="mt-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1">
                        <div
                            className="bg-indigo-500 h-1 rounded-full transition-all"
                            style={{ width: `${(lesson.checklist.filter(i => i.isCompleted).length / lesson.checklist.length) * 100}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
