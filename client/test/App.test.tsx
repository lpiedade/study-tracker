import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock all pages to avoid deep rendering
vi.mock('../src/pages/Dashboard', () => ({ default: () => <div data-testid="dashboard">Dashboard</div> }));
vi.mock('../src/pages/Subjects', () => ({ default: () => <div data-testid="subjects">Subjects</div> }));
vi.mock('../src/pages/Courses', () => ({ default: () => <div data-testid="courses">Courses</div> }));
vi.mock('../src/pages/Templates', () => ({ default: () => <div data-testid="templates">Templates</div> }));
vi.mock('../src/pages/Calendar', () => ({ default: () => <div data-testid="calendar">Calendar</div> }));
vi.mock('../src/pages/Planner', () => ({ default: () => <div data-testid="planner">Planner</div> }));
vi.mock('../src/pages/Results', () => ({ default: () => <div data-testid="results">Results</div> }));
vi.mock('../src/pages/Analytics', () => ({ default: () => <div data-testid="analytics">Analytics</div> }));

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
