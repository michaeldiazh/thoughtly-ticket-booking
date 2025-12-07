/**
 * Events Page
 * Displays all available events in a table format
 */

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { EventRow } from '../components/EventRow';
import { getEvents } from '../services/api';
import type { EventListItem } from '../types/event';
import './EventsPage.css';

interface EventsPageProps {
  onViewEvent: (eventId: number) => void;
}

export function EventsPage({ onViewEvent }: EventsPageProps) {
  const { selectedUser } = useUser();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEvents({ limit: 100 });
        
        if (response.status === 'OK' && response.data) {
          setEvents(response.data);
        } else {
          setError(response.error?.message || 'Failed to load events');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-header">
          <h1>Upcoming Events</h1>
        </div>
        <div className="loading-message">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="events-header">
          <h1>Upcoming Events</h1>
        </div>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Upcoming Events</h1>
        {selectedUser && (
          <p className="user-greeting">
            Welcome, <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>!
          </p>
        )}
      </div>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Description</th>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-events">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <EventRow key={event.id} event={event} onViewDetails={onViewEvent} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
