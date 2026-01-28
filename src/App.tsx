import { CalendarView } from './features/calendar/components/CalendarView';
import './App.css'; // Глобальные стили (фон и т.д.)

function App() {
  return (
    <div className="container">
      <h1>Enterprise Calendar</h1>
      <CalendarView />
    </div>
  );
}

export default App;