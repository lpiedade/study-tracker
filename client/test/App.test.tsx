import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock all pages to avoid deep rendering
vi.mock('./pages/Dashboard', () => ({ default: () => <div data-testid="dashboard">Dashboard</div> }));
vi.mock('./pages/Subjects', () => ({ default: () => <div data-testid="subjects">Subjects</div> }));
vi.mock('./pages/Courses', () => ({ default: () => <div data-testid="courses">Courses</div> }));
vi.mock('./pages/Templates', () => ({ default: () => <div data-testid="templates">Templates</div> }));
vi.mock('./pages/Calendar', () => ({ default: () => <div data-testid="calendar">Calendar</div> }));
vi.mock('./pages/Planner', () => ({ default: () => <div data-testid="planner">Planner</div> }));
vi.mock('./pages/Results', () => ({ default: () => <div data-testid="results">Results</div> }));
vi.mock('./pages/Analytics', () => ({ default: () => <div data-testid="analytics">Analytics</div> }));

// Note: App uses BrowserRouter internally but we test it as-is since BrowserRouter is fine in test env
describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Should render the Layout which contains navigation
        expect(screen.getByText('StudyTracker')).toBeTruthy();
    });

    it('renders dashboard at root path', () => {
        render(<App />);
        expect(screen.getByTestId('dashboard')).toBeTruthy();
    });
});
