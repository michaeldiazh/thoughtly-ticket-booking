/**
 * Main App Component
 */

import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import { WelcomePage } from './pages/WelcomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import './App.css';

type Page = 'welcome' | 'events' | 'event-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const handleViewEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentPage('event-detail');
  };

  const handleBackToEvents = () => {
    setCurrentPage('events');
    setSelectedEventId(null);
  };

  return (
    <UserProvider>
      {currentPage === 'welcome' && (
        <WelcomePage onUserSelected={() => setCurrentPage('events')} />
      )}
      {currentPage === 'events' && (
        <EventsPage onViewEvent={handleViewEvent} />
      )}
      {currentPage === 'event-detail' && selectedEventId && (
        <EventDetailPage eventId={selectedEventId} onBack={handleBackToEvents} />
      )}
    </UserProvider>
  );
}

export default App;
