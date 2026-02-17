import { useState, useEffect } from "react";
import { addDays, subDays, addMonths, subMonths } from "date-fns";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import api from "../lib/api";
import type { LessonPlan, Subject } from "../types";
import CalendarHeader from "../components/calendar/CalendarHeader";
import WeekView from "../components/calendar/WeekView";
import MonthView from "../components/calendar/MonthView";

export default function Calendar() {
    const [view, setView] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [activeDragLesson, setActiveDragLesson] = useState<LessonPlan | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 } // Avoid accidental drags
    }));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lessonsRes, subjectsRes] = await Promise.all([
                api.get('/lessons'),
                api.get('/subjects')
            ]);
            setLessons(lessonsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error("Failed to fetch calendar data", error);
        }
    };

    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }

        if (view === 'week') {
            setCurrentDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
        } else {
            setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        }
    };

    const handleDragStart = (event: any) => {
        setActiveDragLesson(event.active.data.current.lesson);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragLesson(null);

        if (!over) return;

        const lessonId = active.id;
        const newDate = new Date(over.id as string); // Droppable ID is ISO date string

        // Optimistic update
        const originalLessons = [...lessons];
        setLessons(prev => prev.map(l => {
            if (l.id.toString() === lessonId) {
                return { ...l, plannedDate: newDate.toISOString() };
            }
            return l;
        }));

        try {
            const lesson = lessons.find(l => l.id.toString() === lessonId);
            if (lesson) {
                // We need to send other required fields for update, or backend should support partial updates
                // Assuming backend expects full object based on app.ts put handler
                await api.put(`/lessons/${lessonId}`, {
                    title: lesson.title,
                    subjectId: lesson.subjectId,
                    content: lesson.content,
                    plannedDate: newDate.toISOString()
                });
            }
        } catch (error) {
            console.error("Failed to update lesson date", error);
            setLessons(originalLessons); // Revert on failure
            alert("Failed to move lesson");
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onNavigate={handleNavigate}
                subjects={subjects}
            />

            <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    {view === 'week' ? (
                        <WeekView
                            currentDate={currentDate}
                            lessons={lessons}
                            subjects={subjects}
                            onDayClick={(d) => console.log('Day clicked', d)}
                        />
                    ) : (
                        <MonthView
                            currentDate={currentDate}
                            lessons={lessons}
                            subjects={subjects}
                            onDayClick={(date) => {
                                setCurrentDate(date);
                                setView('week');
                            }}
                        />
                    )}

                    <DragOverlay>
                        {activeDragLesson ? (
                            <div className="bg-white dark:bg-slate-900 p-2 border border-indigo-200 rounded-lg shadow-xl opacity-90 ring-2 ring-indigo-500 rotate-2 w-[150px]">
                                <div className="h-1 w-1 bg-indigo-500 rounded-full mb-1"></div>
                                <div className="text-xs font-semibold">{activeDragLesson.title}</div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
