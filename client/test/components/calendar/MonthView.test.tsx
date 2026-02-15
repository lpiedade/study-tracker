import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonthView from '../../../src/components/calendar/MonthView';

describe('MonthView', () => {
    const defaultProps = {
        currentDate: new Date(2026, 1, 15), // Feb 15, 2026
        lessons: [] as any[],
        subjects: [{ id: 1, name: 'Math', color: '#ff0000' }],
        onDayClick: vi.fn(),
    };

    it('renders weekday headers', () => {
        render(<MonthView {...defaultProps} />);
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });
    });

    it('renders days of the month', () => {
        render(<MonthView {...defaultProps} />);
        // Feb 15 should be visible
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('calls onDayClick when a day is clicked', () => {
        const onDayClick = vi.fn();
        render(<MonthView {...defaultProps} onDayClick={onDayClick} />);
        screen.getByText('15').closest('div[class*="cursor-pointer"]')?.click();
        expect(onDayClick).toHaveBeenCalled();
    });

    it('renders subject dots for lessons on a day', () => {
        const lessons = [
            { id: 1, title: 'L1', subjectId: 1, plannedDate: '2026-02-15', isCompleted: false },
        ];
        const { container } = render(<MonthView {...defaultProps} lessons={lessons} />);
        // Should have dot elements
        const dots = container.querySelectorAll('[style*="background-color"]');
        expect(dots.length).toBeGreaterThan(0);
    });
});
