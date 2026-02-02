export interface StudySession {
    id: number;
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    isReview: boolean;
    notes?: string;
}

export interface LessonPlan {
    id: number;
    title: string;
    subject: string;
    content?: string;
    plannedDate: string;
    isCompleted: boolean;
}

export interface ExamResult {
    id: number;
    subject: string;
    score: number;
    maxScore: number;
    date: string;
}

export interface StatsSummary {
    totalSessions: number;
    totalHours: number;
    averageScore: number;
}
