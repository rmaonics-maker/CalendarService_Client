import { useState } from 'react';
import { CalendarView } from './features/calendar/components/CalendarView';
import { HistoryView } from './features/history/HistoryView';
import './App.css';

function App() {
  // Простой переключатель вкладок для теста
  const [tab, setTab] = useState<'calendar' | 'history'>('calendar');

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1>Enterprise System</h1>
          <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setTab('calendar')}>Calendar</button>
              <button onClick={() => setTab('history')}>Audit Logs (High Load)</button>
          </div>
      </header>
      
      {tab === 'calendar' ? <CalendarView /> : <HistoryView />}
    </div>
  );
}

export default App;