import { useState } from 'react';
import { CalendarView } from './features/calendar/components/CalendarView';
import { HistoryView } from './features/history/HistoryView';
import { BookingsView } from './features/bookings/BookingsView';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { LoginView } from './auth/LoginView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastProvider';
import './App.css';

type Tab = 'calendar' | 'bookings' | 'history';

function Shell() {
    const { isAuthenticated, user, logout } = useAuth();
    // Простой переключатель вкладок
    const [tab, setTab] = useState<Tab>('calendar');

    if (!isAuthenticated) {
        return <LoginView />;
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Enterprise System</h1>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setTab('calendar')}>Calendar</button>
                        <button onClick={() => setTab('bookings')}>Bookings</button>
                        <button onClick={() => setTab('history')}>History</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{user?.email}</span>
                        <button onClick={logout}>Logout</button>
                    </div>
                </div>
            </header>

            {tab === 'calendar' && <CalendarView />}
            {tab === 'bookings' && <BookingsView />}
            {tab === 'history' && <HistoryView />}
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <Shell />
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}
