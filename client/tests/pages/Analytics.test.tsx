import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Analytics from '../../src/pages/Analytics';

const mockGet = vi.fn();
vi.mock('../../src/lib/api', () => ({
    default: { get: (...args: any[]) => mockGet(...args) },
}));

// Mock recharts since it requires DOM measurements
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    LineChart: ({ children, data }: any) => <div data-testid="line-chart" data-data={JSON.stringify(data)}>{children}</div>,
    BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
    Line: () => <div />,
    Bar: ({ children }: any) => <div>{children}</div>,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    Cell: () => <div />,
}));

describe('Analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Analytics />);
        expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });

    it('renders analytics page with charts', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/exams') return Promise.resolve({
                data: [
                    { id: 1, score: 80, maxScore: 100, date: '2026-01-10', Subject: { name: 'Math' } },
                ],
            });
            if (url === '/sessions') return Promise.resolve({
                data: [
                    { id: 1, startTime: '2026-01-10T10:00:00Z', endTime: '2026-01-10T12:00:00Z', Subject: { name: 'Math', color: '#ff0000' } },
                ],
            });
            return Promise.resolve({ data: [] });
        });
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByText('Analytics')).toBeInTheDocument();
            expect(screen.getByText('Score Trend (%)')).toBeInTheDocument();
            expect(screen.getByText('Study Hours by Subject')).toBeInTheDocument();
        });

        // Verify data passed to charts
        const lineChart = screen.getByTestId('line-chart');
        const lineData = JSON.parse(lineChart.getAttribute('data-data') || '[]');
        expect(lineData[0].score).toBe(80);

        const barChart = screen.getByTestId('bar-chart');
        const barData = JSON.parse(barChart.getAttribute('data-data') || '[]');
        expect(barData[0].hours).toBe(2); // 10:00 to 12:00
    });

    it('processes session data for multiple subjects correctly', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/exams') return Promise.resolve({ data: [] });
            if (url === '/sessions') return Promise.resolve({
                data: [
                    { id: 1, startTime: '2026-01-10T08:00:00Z', endTime: '2026-01-10T10:00:00Z', Subject: { name: 'Math', color: '#f00' } },
                    { id: 2, startTime: '2026-01-11T08:00:00Z', endTime: '2026-01-11T09:00:00Z', Subject: { name: 'Math', color: '#f00' } },
                    { id: 3, startTime: '2026-01-11T08:00:00Z', endTime: '2026-01-11T10:00:00Z', Subject: { name: 'Physics', color: '#0f0' } },
                ],
            });
            return Promise.resolve({ data: [] });
        });
        render(<Analytics />);
        await waitFor(() => {
            const barChart = screen.getByTestId('bar-chart');
            const barData = JSON.parse(barChart.getAttribute('data-data') || '[]');

            const math = barData.find((d: any) => d.subject === 'Math');
            const physics = barData.find((d: any) => d.subject === 'Physics');

            expect(math.hours).toBe(3); // 2h + 1h
            expect(physics.hours).toBe(2); // 2h
        });
    });

    it('handles empty data', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByText('Analytics')).toBeInTheDocument();
        });
    });

    it('handles API error', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByText('Analytics')).toBeInTheDocument();
        });
    });
});
