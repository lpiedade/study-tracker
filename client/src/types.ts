export interface Subject {
    id: number;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
}

export interface StudySession {
    id: number;
    subjectId: number;
    Subject?: Subject;
    topic: string;
    startTime: string;
    endTime: string;
    isReview: boolean;
    notes?: string;
}

export interface ChecklistTemplateItem {
    id: number;
    templateId: number;
    text: string;
    order: number;
}

export interface ChecklistTemplate {
    id: number;
    name: string;
    description?: string;
    items: ChecklistTemplateItem[];
    createdAt: string;
}

export interface LessonChecklistItem {
    id: number;
    lessonId: number;
    text: string;
    isCompleted: boolean;
    order: number;
}

export interface LessonPlan {
    id: number;
    title: string;
    subjectId: number;
    Subject?: Subject;
    content?: string;
    plannedDate: string;
    isCompleted: boolean;
    checklist?: LessonChecklistItem[];
}

export interface ExamResult {
    id: number;
    subjectId: number;
    Subject?: Subject;
    score: number;
    maxScore: number;
    date: string;
}

export interface StatsSummary {
    totalSessions: number;
    totalHours: number;
    averageScore: number;
}
