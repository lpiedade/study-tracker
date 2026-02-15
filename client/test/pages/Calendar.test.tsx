import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Calendar from '../../src/pages/Calendar';

const mockGet = vi.fn();
const mockPut = vi.fn();
vi.mock('../lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        put: (...args: any[]) => mockPut(...args),
    },
}));

// Mock DnD kit as it requires DOM measurements
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: any) => <div>{children}</div>,
    DragOverlay: ({ children }: any) => <div>{children}</div>,
    useSensor: () => ({}),
    useSensors: () => [],
    useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
    useDraggable: () => ({ setNodeRef: vi.fn(), attributes: {}, listeners: {}, transform: null, isDragging: false }),
    PointerSensor: class { },
}));

// Mock child components to simplify
vi.mock('../components/calendar/WeekView', () => ({
    default: () => <div data-testid="week-view">Week View</div>,
}));
vi.mock('../components/calendar/MonthView', () => ({
    default: () => <div data-testid="month-view">Month View</div>,
}));
vi.mock('../components/calendar/CalendarHeader', () => ({
    default: ({ view, onViewChange, onNavigate }: any) => (
        <div data-testid="calendar-header">
            <span>{view}</span>
            <button onClick={() => onViewChange('month')}>Switch to Month</button>
            <button onClick={() => onNavigate('today')}>Today</button>
            <button onClick={() => onNavigate('prev')}>Prev</button>
            <button onClick={() => onNavigate('next')}>Next</button>
        </div>
    ),
}));

describe('Calendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders calendar with week view by default', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Calendar />);
        await waitFor(() => {
            expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
            expect(screen.getByTestId('week-view')).toBeInTheDocument();
        });
    });

    it('switches to month view', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Calendar />);
        await waitFor(() => {
            expect(screen.getByTestId('week-view')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Switch to Month'));
        expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('handles navigation', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Calendar />);
        await waitFor(() => {
            expect(screen.getByText('Today')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Today'));
        fireEvent.click(screen.getByText('Prev'));
        fireEvent.click(screen.getByText('Next'));
        // No crash = success
    });

    it('handles API error', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Calendar />);
        await waitFor(() => {
            expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
        });
    });
});
