/**
 * Main App Component
 */

import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import { WelcomePage } from './pages/WelcomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import type { UserTicket } from './services/api';
import './App.css';

type Page = 'welcome' | 'events' | 'event-detail' | 'confirmation';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [userTicket, setUserTicket] = useState<UserTicket | null>(null);

  const handleViewEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentPage('event-detail');
  };

  const handleBackToEvents = () => {
    setCurrentPage('events');
    setSelectedEventId(null);
  };

  const handleBookingSuccess = (ticket: UserTicket) => {
    setUserTicket(ticket);
    setCurrentPage('confirmation');
  };

  const handleBackToHome = () => {
    setCurrentPage('welcome');
    setSelectedEventId(null);
    setUserTicket(null);
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
        <EventDetailPage 
          eventId={selectedEventId} 
          onBack={handleBackToEvents}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {currentPage === 'confirmation' && userTicket && (
        <ConfirmationPage 
          userTicket={userTicket}
          onBackToHome={handleBackToHome}
        />
      )}
    </UserProvider>
  );
}

export default App;
